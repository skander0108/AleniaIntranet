package com.iberia.intranet.security;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;

import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean

    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);

        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;

    }

    @Bean

    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {

        return authConfig.getAuthenticationManager();

    }

    @Bean

    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();

    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(org.springframework.security.config.Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() // Fix for CORS
                                                                                                         // preflight
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/joiners/images/**").permitAll() // Allow serving images
                        .requestMatchers("/api/files/**").permitAll() // Allow public access to uploaded files
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/api/docs/**")
                        .permitAll()
                        .requestMatchers("/error").permitAll()

                        // WebSocket endpoint (auth handled by STOMP)
                        .requestMatchers("/ws/**").permitAll()

                        // Chat endpoints (authenticated users)
                        .requestMatchers("/api/chat/**").authenticated()

                        // Admin-only endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Manager or Admin only for creating/updating/deleting content
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/announcements/**")
                        .hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/announcements/**")
                        .hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/announcements/**")
                        .hasAnyRole("MANAGER", "ADMIN")

                        // Event Registration (Authenticated users)
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/events/*/register")
                        .authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/events/*/register")
                        .authenticated()

                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/events/**")
                        .hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/events/**")
                        .hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/events/**")
                        .hasAnyRole("MANAGER", "ADMIN")

                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/joiners/**")
                        .hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/joiners/**")
                        .hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/joiners/**")
                        .hasAnyRole("MANAGER", "ADMIN")

                        // SSE Endpoint
                        .requestMatchers("/api/notifications/stream").authenticated()

                        // All other endpoints require authentication
                        .anyRequest().authenticated());

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean

    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {

        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();

        configuration.setAllowedOriginPatterns(java.util.List.of("*")); // Allow any origin pattern for Docker and
                                                                        // LocalTunnel

        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        configuration.setAllowedHeaders(java.util.List.of("*"));

        configuration.setAllowCredentials(true);

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;

    }

}
