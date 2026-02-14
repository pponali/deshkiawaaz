package com.prajaavaani.backend.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI prajaavaaniOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("Prajaavaani API")
                        .description("API documentation for Prajaavaani backend")
                        .version("v1.0")
                        .contact(new Contact()
                            .name("Prajaavaani Team")
                            .email("support@prajaavaani.com")))
                .externalDocs(new ExternalDocumentation()
                        .description("Prajaavaani Docs")
                        .url("https://prajaavaani.com/docs"));
    }
}
