package com.prajaavaani.backend.controller;

import com.prajaavaani.backend.dto.AuthRequest;
import com.prajaavaani.backend.dto.AuthResponse;
import com.prajaavaani.backend.dto.VerifyOtpRequest;
import com.prajaavaani.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth") // Base path for authentication endpoints
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/request-otp")
    @ResponseStatus(HttpStatus.ACCEPTED) // Indicate request is accepted, processing happens async
    public void requestOtp(@Valid @RequestBody AuthRequest authRequest) {
        authService.requestOtp(authRequest);
        // No body needed, success indicated by 202 Accepted status
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest verifyOtpRequest) {
        AuthResponse response = authService.verifyOtp(verifyOtpRequest);
        // Return user details (and potentially token) on successful verification
        return ResponseEntity.ok(response); 
    }

    // TODO: Add endpoints for logout, token refresh if using JWT
}
