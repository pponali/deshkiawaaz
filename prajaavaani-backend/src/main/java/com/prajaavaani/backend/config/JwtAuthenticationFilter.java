package com.prajaavaani.backend.config;

import com.prajaavaani.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService; // Use Spring's interface
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component // Mark as a Spring component to be picked up
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService; // Inject Spring's UserDetailsService

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userMobileNumber; // Username is the mobile number

        // Check if Authorization header exists and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // Continue chain if no token
            return;
        }

        jwt = authHeader.substring(7); // Extract token after "Bearer "
        try {
            userMobileNumber = jwtService.extractUsername(jwt);

            // Check if user is not already authenticated
            if (userMobileNumber != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Load user details using UserDetailsService (which uses our UserDetailsServiceImpl)
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userMobileNumber);

                // Validate token
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Create authentication token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, // Credentials are null for JWT auth
                            userDetails.getAuthorities() // Use authorities from UserDetails
                    );
                    // Set details from the request
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    // Update SecurityContextHolder
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                     logger.debug("JWT token validated successfully for user: " + userMobileNumber);
                } else {
                     logger.warn("JWT token validation failed for user: " + userMobileNumber);
                 }
            }
        } catch (Exception e) {
            // Log exceptions during token parsing/validation
             logger.error("Error processing JWT token: " + e.getMessage());
             // Optionally, you could set an error response here
        }


        filterChain.doFilter(request, response); // Continue the filter chain
    }
}
