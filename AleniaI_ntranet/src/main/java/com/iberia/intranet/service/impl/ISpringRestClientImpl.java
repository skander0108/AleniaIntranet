package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.ispring.ISpringLearnerResult;
import com.iberia.intranet.dto.ispring.ISpringTokenResponse;
import com.iberia.intranet.service.ISpringRestClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ISpringRestClientImpl implements ISpringRestClient {

    @Value("${ispring.api.url}")
    private String apiUrl;

    @Value("${ispring.client.id}")
    private String clientId;

    @Value("${ispring.client.secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    private String accessToken;
    private LocalDateTime tokenExpiry;

    @Override
    public List<ISpringLearnerResult> getAllLearnerProgress() {
        ensureToken();
        if (accessToken == null) {
            log.error("Failed to obtain access token. Aborting sync.");
            return Collections.emptyList();
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            // Fetching all results. Pagination should be handled if dataset is large.
            // Assuming /learners/modules/results endpoint.
            // We might need to handle pagination loop here if iSpring uses Link headers or
            // page params.
            // For now, simple fetch.
            // Assuming /learners/modules/results endpoint for actual data
            String url = apiUrl + "/learners/modules/results";

            ResponseEntity<com.iberia.intranet.dto.ispring.ISpringResultsResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    com.iberia.intranet.dto.ispring.ISpringResultsResponse.class);

            if (response.getBody() != null && response.getBody().getResults() != null) {
                return response.getBody().getResults();
            }
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Error fetching learner progress from iSpring: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public com.iberia.intranet.dto.ispring.ISpringUserProfile getUserProfile(String userId) {
        ensureToken();
        if (accessToken == null) {
            log.error("Failed to obtain access token. Aborting user fetch.");
            return null;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            String url = apiUrl + "/user/" + userId;

            ResponseEntity<com.iberia.intranet.dto.ispring.ISpringUserProfile> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    com.iberia.intranet.dto.ispring.ISpringUserProfile.class);

            return response.getBody();
        } catch (Exception e) {
            log.error("Error fetching user profile for ID {}: {}", userId, e.getMessage());
            return null;
        }
    }

    private synchronized void ensureToken() {
        if (accessToken != null && tokenExpiry != null && LocalDateTime.now().isBefore(tokenExpiry)) {
            return;
        }

        try {
            log.info("Refreshing iSpring access token...");
            String authUrl = apiUrl + "/api/v3/token";

            // If the URL in config is base domain, we might need to append /oauth/token or
            // it might be a separate auth URL.
            // Assuming standard iSpring structure where auth is on the same domain.

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            org.springframework.util.MultiValueMap<String, String> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("grant_type", "client_credentials");

            HttpEntity<org.springframework.util.MultiValueMap<String, String>> request = new HttpEntity<>(body,
                    headers);

            ISpringTokenResponse response = restTemplate.postForObject(authUrl, request, ISpringTokenResponse.class);

            if (response != null && response.getAccessToken() != null) {
                this.accessToken = response.getAccessToken();
                // Expire 1 minute before actual expiry to be safe
                this.tokenExpiry = LocalDateTime.now().plusSeconds(response.getExpiresIn() - 60);
                log.info("iSpring token refreshed. Expires in {} seconds.", response.getExpiresIn());
            } else {
                log.error("Failed to assume iSpring token: response is null");
            }

        } catch (Exception e) {
            log.error("Error authenticating with iSpring: {}", e.getMessage());
        }
    }
}
