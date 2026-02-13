package com.iberia.intranet.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class JwtResponse {
    private String accessToken;
    private String tokenType;
    private Long expiresIn;
    private UUID id;
    private String email;
    private String fullName;
    private List<String> roles;

    public JwtResponse(String accessToken, Long expiresIn, UUID id, String email, String fullName, List<String> roles) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer"; // Set default value here
        this.expiresIn = expiresIn;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
    }
}
