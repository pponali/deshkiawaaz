package com.prajaavaani.backend.exception;

public class OtpSendingFailedException extends RuntimeException {
    public OtpSendingFailedException(String message) {
        super(message);
    }
}
