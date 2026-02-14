package com.prajaavaani.backend.service;

public interface OtpService {
    String generateAndStoreOtp(String key); // Key is typically the mobile number
    boolean validateOtp(String key, String otp);
    void sendOtpSms(String mobileNumber, String otp);
}
