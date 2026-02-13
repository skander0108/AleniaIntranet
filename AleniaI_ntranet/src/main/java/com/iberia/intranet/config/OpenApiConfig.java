package com.iberia.intranet.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Iberia Intranet API",
                version = "v1",
                description = "REST API for Iberia Intranet"
        )
)
public class OpenApiConfig {
}

