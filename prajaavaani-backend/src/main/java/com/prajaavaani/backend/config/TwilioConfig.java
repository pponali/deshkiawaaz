package com.prajaavaani.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.NotBlank;

@Configuration
@ConfigurationProperties(prefix = "twilio") // Matches the prefix in application.properties
@Data // Lombok for getters/setters
@Validated // Enable validation on properties
public class TwilioConfig {

    @NotBlank(message = "Twilio Account SID is required")
    private String accountSid;

    @NotBlank(message = "Twilio Auth Token is required")
    private String authToken;

    @NotBlank(message = "Twilio Phone Number is required")
    private String phoneNumber; // Or messagingServiceSid if using that

    // Optional: Add messagingServiceSid if you prefer using that
    // private String messagingServiceSid;

    public String getAccountSid() {
        return accountSid;
    }
    public void setAccountSid(String accountSid) {
        this.accountSid = accountSid;
    }
    public String getAuthToken() {
        return authToken;
    }
    public void setAuthToken(String authToken) {
        this.authToken = authToken;
    }
    public String getPhoneNumber() {
        return phoneNumber;
    }
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
