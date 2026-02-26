package com.iberia.intranet.dto.ispring;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ISpringTokenResponse {
    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("expires_in")
    private int expiresIn;

    @JsonProperty("token_type")
    private String tokenType;
}
