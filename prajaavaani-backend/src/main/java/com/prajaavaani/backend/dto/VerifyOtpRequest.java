package com.prajaavaani.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank(message = "Mobile number cannot be blank")
    @Pattern(regexp = "^\\d{10}$", message = "Mobile number must be 10 digits")
    private String mobileNumber;

    @NotBlank(message = "OTP code cannot be blank")
    @Size(min = 6, max = 6, message = "OTP code must be 6 digits") // Assuming 6-digit OTP
    private String otpCode;

    public String getMobileNumber() {
        return mobileNumber;
    }

    public String getOtpCode() {
        return otpCode;
    }
}
