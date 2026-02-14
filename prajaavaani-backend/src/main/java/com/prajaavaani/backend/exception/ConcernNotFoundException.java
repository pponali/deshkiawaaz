package com.prajaavaani.backend.exception;

public class ConcernNotFoundException extends RuntimeException {
    public ConcernNotFoundException(String message) {
        super(message);
    }
}
