package com.iberia.intranet.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatSendRequest {
    @NotBlank
    private String message;
}
