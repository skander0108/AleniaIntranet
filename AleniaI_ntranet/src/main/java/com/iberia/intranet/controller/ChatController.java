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
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatConversationService chatService;
    private final UserRepository userRepository;

    @PostMapping("/send")
    public ResponseEntity<List<ChatMessageDto>> sendMessage(@Valid @RequestBody ChatSendRequest request) {
        User user = getCurrentUser();
        List<ChatMessageDto> responses = chatService.sendUserMessage(user.getId(), request.getMessage());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ChatConversationDto>> getMyConversations() {
        User user = getCurrentUser();
        return ResponseEntity.ok(chatService.getUserConversations(user.getId()));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessages(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(chatService.getConversationMessages(id));
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
