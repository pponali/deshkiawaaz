package com.prajaavaani.backend.service;

import com.prajaavaani.backend.config.TwilioConfig;
import com.prajaavaani.backend.exception.InvalidOtpException;
import com.prajaavaani.backend.exception.OtpSendingFailedException;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class OtpServiceImpl implements OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpServiceImpl.class);
    private final TwilioConfig twilioConfig;

    public OtpServiceImpl(TwilioConfig twilioConfig) {
        this.twilioConfig = twilioConfig;
    }

    // !!! WARNING: In-memory storage - NOT suitable for production or multi-instance deployments !!!
    // Replace with Redis, Memcached, or database-backed storage for production.
    private final Map<String, String> otpCache = new ConcurrentHashMap<>();
    // Optional: Add expiration logic if using in-memory for testing
    // private final Map<String, Long> otpExpiryCache = new ConcurrentHashMap<>();
    // private static final long OTP_EXPIRY_DURATION_MS = TimeUnit.MINUTES.toMillis(5); // 5 minutes

    @PostConstruct // Initialize Twilio client after properties are loaded
    private void setupTwilio() {
        try {
             Twilio.init(twilioConfig.getAccountSid(), twilioConfig.getAuthToken());
             log.info("Twilio client initialized successfully.");
        } catch (Exception e) {
            log.error("Failed to initialize Twilio client. Please check credentials.", e);
            // Depending on requirements, you might want to prevent app startup here
        }
    }

    @Override
    public String generateAndStoreOtp(String key) {
        // Generate 6-digit OTP
        String otp = new DecimalFormat("000000").format(new Random().nextInt(999999));
        log.debug("Generated OTP {} for key {}", otp, key);

        // Store OTP (replace with proper cache implementation)
        otpCache.put(key, otp);
        // Optional: Store expiry time
        // otpExpiryCache.put(key, System.currentTimeMillis() + OTP_EXPIRY_DURATION_MS);

        log.info("Stored OTP for key {}", key); // Avoid logging OTP itself in production logs
        return otp;
    }

    @Override
    public boolean validateOtp(String key, String otpToValidate) {
        String storedOtp = otpCache.get(key);
        // Optional: Check expiry
        // Long expiryTime = otpExpiryCache.get(key);
        // if (expiryTime == null || System.currentTimeMillis() > expiryTime) {
        //     log.warn("OTP expired or not found for key {}", key);
        //     otpCache.remove(key); // Clean up expired/invalid entry
        //     otpExpiryCache.remove(key);
        //     throw new InvalidOtpException("OTP expired or not found");
        // }

        if (storedOtp != null && storedOtp.equals(otpToValidate)) {
            log.info("OTP validation successful for key {}", key);
            otpCache.remove(key);
            // otpExpiryCache.remove(key);
            return true;
        } else {
            log.warn("OTP validation failed for key {}. Provided OTP did not match.", key);
            otpCache.remove(key); // Remove after failed attempt for this simple implementation
            // otpExpiryCache.remove(key);
            throw new InvalidOtpException("Invalid OTP provided.");
        }
    }

    @Override
    public void sendOtpSms(String mobileNumber, String otp) {
         String formattedMobileNumber = formatMobileNumber(mobileNumber);
         if (formattedMobileNumber == null) {
             log.error("Invalid mobile number format provided: {}", mobileNumber);
             throw new OtpSendingFailedException("Invalid mobile number format.");
         }
         String messageBody = "Your Prajaavaani verification code is: " + otp;
         log.info("DEVELOPMENT MODE: Would send SMS to {} with message: {}", formattedMobileNumber, messageBody);
         // Uncomment the following code when you have a valid Twilio account
         /*
         try {
             Message message = Message.creator(
                             new PhoneNumber(formattedMobileNumber), // To number
                             new PhoneNumber(twilioConfig.getPhoneNumber()), // From Twilio number
                             messageBody)
                     .create();

             log.info("OTP SMS sent successfully to {}. SID: {}", formattedMobileNumber, message.getSid());

         } catch (Exception e) {
             log.error("Failed to send OTP SMS to {}: {}", formattedMobileNumber, e.getMessage());
             throw new OtpSendingFailedException("Failed to send OTP SMS");
         }
         */
     }

    // Basic helper to ensure number is in E.164 format (e.g., +91XXXXXXXXXX)
    // Adapt this based on expected input format
    private String formatMobileNumber(String number) {
        // Remove any non-digit characters first
        String digitsOnly = number.replaceAll("\\D", "");
        if (digitsOnly.length() == 10) { // Assume 10 digits is Indian number without country code
            return "+91" + digitsOnly;
        } else if (digitsOnly.startsWith("91") && digitsOnly.length() == 12) { // Starts with 91
             return "+" + digitsOnly;
        } else if (number.matches("^\\+\\d{11,15}$")) { // Already in E.164 format (approx)
            return number;
        }
        // Add more specific validation/formatting if needed
        return null; // Indicate invalid format
    }
}
