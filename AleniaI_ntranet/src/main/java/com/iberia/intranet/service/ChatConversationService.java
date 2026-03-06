package com.iberia.intranet.service;

import com.iberia.intranet.dto.ChatConversationDto;
import com.iberia.intranet.dto.ChatMessageDto;
import com.iberia.intranet.entity.*;
import com.iberia.intranet.repository.ChatConversationRepository;
import com.iberia.intranet.repository.ChatMessageRepository;
import com.iberia.intranet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatConversationService {

        private static final int MAX_BOT_FAILURES = 2;

        private final ChatConversationRepository conversationRepo;
        private final ChatMessageRepository messageRepo;
        private final UserRepository userRepo;
        private final ChatbotService chatbotService;
        private final SimpMessagingTemplate messagingTemplate;

        /**
         * Send a message from the user. The bot tries to answer.
         * If it fails too many times, the conversation is escalated.
         * Returns the list of new messages (user + bot/system).
         */
        @Transactional
        public List<ChatMessageDto> sendUserMessage(UUID userId, String content) {
                User user = userRepo.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Find or create active conversation
                ChatConversation conversation = conversationRepo
                                .findByUserIdAndStatusIn(userId,
                                                List.of(ChatStatus.BOT, ChatStatus.ESCALATED, ChatStatus.ASSIGNED))
                                .orElseGet(() -> {
                                        ChatConversation newConv = ChatConversation.builder()
                                                        .user(user)
                                                        .status(ChatStatus.BOT)
                                                        .failedBotAttempts(0)
                                                        .build();
                                        return conversationRepo.save(newConv);
                                });

                // Save user message
                ChatMessage userMsg = ChatMessage.builder()
                                .conversation(conversation)
                                .senderType(SenderType.USER)
                                .senderId(userId)
                                .content(content)
                                .build();
                messageRepo.save(userMsg);

                ChatMessageDto userMsgDto = toDto(userMsg, user.getFullName());

                // If already escalated/assigned, just forward to admin via WebSocket
                if (conversation.getStatus() == ChatStatus.ESCALATED
                                || conversation.getStatus() == ChatStatus.ASSIGNED) {
                        messagingTemplate.convertAndSend(
                                        "/topic/conversation." + conversation.getId(), userMsgDto);
                        return List.of(userMsgDto);
                }

                // Bot phase — try to answer
                String botAnswer = chatbotService.findAnswer(content);

                if (botAnswer != null) {
                        // Bot answered successfully
                        ChatMessage botMsg = ChatMessage.builder()
                                        .conversation(conversation)
                                        .senderType(SenderType.BOT)
                                        .content(botAnswer)
                                        .build();
                        messageRepo.save(botMsg);
                        return List.of(userMsgDto, toDto(botMsg, "IT Support Bot"));
                }

                // Bot failed
                conversation.setFailedBotAttempts(conversation.getFailedBotAttempts() + 1);

                if (conversation.getFailedBotAttempts() >= MAX_BOT_FAILURES) {
                        // Escalate
                        conversation.setStatus(ChatStatus.ESCALATED);
                        conversation.setSubject(content.length() > 100 ? content.substring(0, 100) : content);
                        conversationRepo.save(conversation);

                        String escalationMsg = "🔄 I wasn't able to resolve your issue. " +
                                        "I'm connecting you to an IT support agent. Please hold on — someone will be with you shortly.";

                        ChatMessage sysMsg = ChatMessage.builder()
                                        .conversation(conversation)
                                        .senderType(SenderType.BOT)
                                        .content(escalationMsg)
                                        .build();
                        messageRepo.save(sysMsg);

                        // Notify admins about new escalation
                        messagingTemplate.convertAndSend("/topic/admin.escalations",
                                        toConversationDto(conversation));

                        return List.of(userMsgDto, toDto(sysMsg, "IT Support Bot"));
                }

                // Bot failed but not yet at threshold
                conversationRepo.save(conversation);
                String retryMsg = "🤔 I'm not sure I understand your question. " +
                                "Could you rephrase it or provide more details? " +
                                "If I still can't help, I'll connect you to a human agent.";

                ChatMessage retryBotMsg = ChatMessage.builder()
                                .conversation(conversation)
                                .senderType(SenderType.BOT)
                                .content(retryMsg)
                                .build();
                messageRepo.save(retryBotMsg);

                return List.of(userMsgDto, toDto(retryBotMsg, "IT Support Bot"));
        }

        /**
         * Admin sends a reply to an escalated conversation.
         */
        @Transactional
        public ChatMessageDto sendAdminReply(UUID conversationId, UUID adminId, String content) {
                ChatConversation conversation = conversationRepo.findById(conversationId)
                                .orElseThrow(() -> new RuntimeException("Conversation not found"));
                User admin = userRepo.findById(adminId)
                                .orElseThrow(() -> new RuntimeException("Admin not found"));

                ChatMessage adminMsg = ChatMessage.builder()
                                .conversation(conversation)
                                .senderType(SenderType.ADMIN)
                                .senderId(adminId)
                                .content(content)
                                .build();
                messageRepo.save(adminMsg);

                ChatMessageDto dto = toDto(adminMsg, admin.getFullName());

                // Send to user via WebSocket
                messagingTemplate.convertAndSend(
                                "/topic/conversation." + conversationId, dto);

                return dto;
        }

        /**
         * Admin assigns themselves to a conversation.
         */
        @Transactional
        public ChatConversationDto assignToAdmin(UUID conversationId, UUID adminId) {
                ChatConversation conversation = conversationRepo.findById(conversationId)
                                .orElseThrow(() -> new RuntimeException("Conversation not found"));
                User admin = userRepo.findById(adminId)
                                .orElseThrow(() -> new RuntimeException("Admin not found"));

                conversation.setAssignedAdmin(admin);
                conversation.setStatus(ChatStatus.ASSIGNED);
                conversationRepo.save(conversation);

                // Notify user that an agent joined
                String joinMsg = "✅ **" + admin.getFullName()
                                + "** from IT Support has joined the conversation. How can I help you?";
                ChatMessage sysMsg = ChatMessage.builder()
                                .conversation(conversation)
                                .senderType(SenderType.ADMIN)
                                .senderId(adminId)
                                .content(joinMsg)
                                .build();
                messageRepo.save(sysMsg);

                messagingTemplate.convertAndSend(
                                "/topic/conversation." + conversationId, toDto(sysMsg, admin.getFullName()));

                return toConversationDto(conversation);
        }

        /**
         * Admin resolves a conversation.
         */
        @Transactional
        public void resolveConversation(UUID conversationId, UUID adminId) {
                ChatConversation conversation = conversationRepo.findById(conversationId)
                                .orElseThrow(() -> new RuntimeException("Conversation not found"));

                conversation.setStatus(ChatStatus.RESOLVED);
                conversation.setResolvedAt(ZonedDateTime.now());
                conversationRepo.save(conversation);

                String resolveMsg = "✅ This conversation has been marked as resolved. " +
                                "If you need further help, just start a new conversation!";
                ChatMessage sysMsg = ChatMessage.builder()
                                .conversation(conversation)
                                .senderType(SenderType.BOT)
                                .content(resolveMsg)
                                .build();
                messageRepo.save(sysMsg);

                messagingTemplate.convertAndSend(
                                "/topic/conversation." + conversationId, toDto(sysMsg, "System"));
        }

        @Transactional(readOnly = true)
        public List<ChatConversationDto> getEscalatedConversations() {
                return conversationRepo
                                .findByStatusInOrderByCreatedAtAsc(List.of(ChatStatus.ESCALATED, ChatStatus.ASSIGNED))
                                .stream().map(this::toConversationDto).collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<ChatConversationDto> getUserConversations(UUID userId) {
                return conversationRepo.findByUserIdOrderByCreatedAtDesc(userId)
                                .stream().map(this::toConversationDto).collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<ChatMessageDto> getConversationMessages(UUID conversationId) {
                return messageRepo.findByConversationIdOrderByCreatedAtAsc(conversationId)
                                .stream().map(msg -> toDto(msg, resolveSenderName(msg)))
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public long getEscalatedCount() {
                return conversationRepo.countByStatusIn(List.of(ChatStatus.ESCALATED, ChatStatus.ASSIGNED));
        }

        // --- Mapping helpers ---

        private ChatMessageDto toDto(ChatMessage msg, String senderName) {
                return ChatMessageDto.builder()
                                .id(msg.getId())
                                .conversationId(msg.getConversation().getId())
                                .senderType(msg.getSenderType().name())
                                .senderId(msg.getSenderId())
                                .senderName(senderName)
                                .content(msg.getContent())
                                .createdAt(msg.getCreatedAt())
                                .build();
        }

        private ChatConversationDto toConversationDto(ChatConversation conv) {
                List<ChatMessage> msgs = messageRepo.findByConversationIdOrderByCreatedAtAsc(conv.getId());
                String lastMsg = msgs.isEmpty() ? "" : msgs.get(msgs.size() - 1).getContent();

                return ChatConversationDto.builder()
                                .id(conv.getId())
                                .userName(conv.getUser().getFullName())
                                .userEmail(conv.getUser().getEmail())
                                .assignedAdminName(
                                                conv.getAssignedAdmin() != null ? conv.getAssignedAdmin().getFullName()
                                                                : null)
                                .status(conv.getStatus().name())
                                .subject(conv.getSubject())
                                .messageCount(msgs.size())
                                .lastMessage(lastMsg.length() > 100 ? lastMsg.substring(0, 100) + "..." : lastMsg)
                                .createdAt(conv.getCreatedAt())
                                .updatedAt(conv.getUpdatedAt())
                                .resolvedAt(conv.getResolvedAt())
                                .build();
        }

        private String resolveSenderName(ChatMessage msg) {
                if (msg.getSenderType() == SenderType.BOT)
                        return "IT Support Bot";
                if (msg.getSenderId() != null) {
                        return userRepo.findById(msg.getSenderId())
                                        .map(User::getFullName).orElse("Unknown");
                }
                return "System";
        }
}
