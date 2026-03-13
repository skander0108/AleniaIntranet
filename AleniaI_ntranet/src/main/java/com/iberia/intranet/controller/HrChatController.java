package com.iberia.intranet.controller;

import com.iberia.intranet.dto.ChatConversationDto;
import com.iberia.intranet.dto.ChatMessageDto;
import com.iberia.intranet.dto.ChatSendRequest;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.service.ChatConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/chat")
@RequiredArgsConstructor
public class HrChatController {

    private final ChatConversationService chatService;
    private final UserRepository userRepository;

    @GetMapping("/conversations")
    public ResponseEntity<List<ChatConversationDto>> getEscalatedConversations() {
        return ResponseEntity.ok(chatService.getEscalatedConversations());
    }

    @GetMapping("/conversations/count")
    public ResponseEntity<Map<String, Long>> getEscalatedCount() {
        return ResponseEntity.ok(Map.of("count", chatService.getEscalatedCount()));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessages(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(chatService.getConversationMessages(id));
    }

    @PostMapping("/conversations/{id}/assign")
    public ResponseEntity<ChatConversationDto> assignToMe(@PathVariable("id") UUID id) {
        User Hr = getCurrentHr();
        return ResponseEntity.ok(chatService.assignToHr(id, Hr.getId()));
    }

    @PostMapping("/conversations/{id}/reply")
    public ResponseEntity<ChatMessageDto> reply(
            @PathVariable("id") UUID id,
            @Valid @RequestBody ChatSendRequest request) {
        User Hr = getCurrentHr();
        return ResponseEntity.ok(chatService.sendHrReply(id, Hr.getId(), request.getMessage()));
    }

    @PostMapping("/conversations/{id}/resolve")
    public ResponseEntity<Void> resolve(@PathVariable("id") UUID id) {
        User Hr = getCurrentHr();
        chatService.resolveConversation(id, Hr.getId());
        return ResponseEntity.ok().build();
    }

    private User getCurrentHr() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Hr not found"));
    }
}
