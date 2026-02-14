package com.prajaavaani.backend.service;

import com.prajaavaani.backend.dto.AuthRequest;
import com.prajaavaani.backend.dto.AuthResponse;
import com.prajaavaani.backend.dto.VerifyOtpRequest;
import com.prajaavaani.backend.exception.InvalidOtpException;
import com.prajaavaani.backend.exception.OtpSendingFailedException;
import com.prajaavaani.backend.model.UserEntity;
import com.prajaavaani.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepository userRepository, OtpService otpService, JwtService jwtService) {
        this.userRepository = userRepository;
        this.otpService = otpService;
        this.jwtService = jwtService;
    }

    @Override
    public void requestOtp(AuthRequest authRequest) {
        log.info("OTP requested for mobile number: {}", authRequest.getMobileNumber());
        
        // 1. Generate and store OTP using OtpService
        String otp = otpService.generateAndStoreOtp(authRequest.getMobileNumber());
        
        // 2. Send OTP via SMS service using OtpService
        try {
            otpService.sendOtpSms(authRequest.getMobileNumber(), otp);
            log.info("OTP requested and sent successfully to {}", authRequest.getMobileNumber());
        } catch (Exception e) {
            // Log the error and potentially rethrow a service-specific exception
            log.error("Failed to send OTP for mobile number {}: {}", authRequest.getMobileNumber(), e.getMessage());
            // Depending on requirements, might want to clear the stored OTP if sending failed critically
            // Or throw a custom exception like OtpSendingFailedException
            throw new OtpSendingFailedException("Failed to send OTP. Please try again later.");
        }
    }

    @Override
    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest verifyOtpRequest) {
        String mobileNumber = verifyOtpRequest.getMobileNumber();

        // 1. Validate mobile number format
        if (!isValidMobileNumber(mobileNumber)) {
            throw new InvalidOtpException("Invalid mobile number format.");
        }

        // 2. Validate OTP (exception thrown if invalid)
        otpService.validateOtp(mobileNumber, verifyOtpRequest.getOtpCode());

        // 3. Find or create user (handle race condition with transaction)
        UserEntity user = userRepository.findByMobileNumber(mobileNumber).orElse(null);
        if (user == null) {
            user = new UserEntity();
            user.setMobileNumber(mobileNumber);
            user.setIsVerified(true);
            user = userRepository.save(user);
        } else if (!Boolean.TRUE.equals(user.getIsVerified())) {
            user.setIsVerified(true);
            user = userRepository.save(user);
        }

        // 4. Build UserDetails (add roles if needed)
        User userDetails = new User(user.getMobileNumber(), "", Collections.emptyList());
        String jwtToken = jwtService.generateToken(userDetails);

        // 5. Build response (optionally mask mobile number)
        AuthResponse response = new AuthResponse();
        response.setMessage("OTP verified successfully");
        response.setUserId(user.getId());
        response.setMobileNumber(maskMobileNumber(user.getMobileNumber()));
        response.setJwtToken(jwtToken);
        return response;
    }

    private boolean isValidMobileNumber(String mobileNumber) {
        // Example: Indian 10-digit numbers or E.164 format
        return mobileNumber != null && (mobileNumber.matches("^\\+91\\d{10}$") || mobileNumber.matches("^\\d{10}$"));
    }

    private String maskMobileNumber(String mobileNumber) {
        // Mask all but last 4 digits
        if (mobileNumber == null || mobileNumber.length() < 4) return "****";
        return "****" + mobileNumber.substring(mobileNumber.length() - 4);
    }
}
