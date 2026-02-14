package com.prajaavaani.backend.service;

import com.prajaavaani.backend.dto.AuthRequest;
import com.prajaavaani.backend.dto.AuthResponse;
import com.prajaavaani.backend.dto.VerifyOtpRequest;

public interface AuthService {
    // Initiates the OTP sending process
    void requestOtp(AuthRequest authRequest); 

    // Verifies the OTP and returns user details (or token) upon success
    AuthResponse verifyOtp(VerifyOtpRequest verifyOtpRequest); 
}
