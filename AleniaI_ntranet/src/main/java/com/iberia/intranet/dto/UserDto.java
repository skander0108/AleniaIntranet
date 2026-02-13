package com.iberia.intranet.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Value;

import java.util.Set;
import java.util.UUID;

@Value
@Builder
public class UserDto {

    UUID id;

    @NotBlank
    String fullName;

    @NotBlank
    @Email
    String email;

    @NotNull
    Boolean isActive;

    Set<String> roles;
}

