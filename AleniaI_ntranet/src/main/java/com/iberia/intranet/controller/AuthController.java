package com.iberia.intranet.controller;

import com.iberia.intranet.dto.JwtResponse;
import com.iberia.intranet.dto.LoginRequest;
import com.iberia.intranet.security.JwtUtils;
import com.iberia.intranet.security.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final JwtUtils jwtUtils;

        @PostMapping("/login")
        public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
                try {
                        Authentication authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(loginRequest.getEmail(),
                                                        loginRequest.getPassword()));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        String jwt = jwtUtils.generateJwtToken(authentication);

                        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                        List<String> roles = userDetails.getAuthorities().stream()
                                        .map(GrantedAuthority::getAuthority)
                                        .collect(Collectors.toList());

                        return ResponseEntity.ok(new JwtResponse(
                                        jwt,
                                        86400000L, // 24 hours in milliseconds
                                        userDetails.getId(),
                                        userDetails.getEmail(),
                                        userDetails.getFullName(),
                                        roles));
                } catch (Exception e) {
                        e.printStackTrace(); // This will print the full stack trace
                        System.out.println("ERROR IN LOGIN: " + e.getClass().getName() + ": " + e.getMessage());
                        throw e; // Re-throw to return 500
                }
        }
}
