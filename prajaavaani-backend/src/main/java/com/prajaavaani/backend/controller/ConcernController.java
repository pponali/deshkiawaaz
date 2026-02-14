package com.prajaavaani.backend.controller;

import com.prajaavaani.backend.dto.ConcernDto;
import com.prajaavaani.backend.dto.CreateConcernRequest;
import com.prajaavaani.backend.dto.VoteRequest;
import com.prajaavaani.backend.model.GeographicLevel;
import com.prajaavaani.backend.model.UserEntity; // Import UserEntity
import com.prajaavaani.backend.repository.UserRepository; // Import UserRepository
import com.prajaavaani.backend.service.ConcernService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // Use this to get authenticated user details
import org.springframework.security.core.userdetails.UserDetails; // Example user details type
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException; // For exceptions

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/concerns") // Base path for concern-related endpoints
// @CrossOrigin
public class ConcernController {

    private final ConcernService concernService;
    private final UserRepository userRepository; // Inject UserRepository

    public ConcernController(ConcernService concernService, UserRepository userRepository) {
        this.concernService = concernService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<ConcernDto> createConcern(
            @Valid @RequestBody CreateConcernRequest request,
            @AuthenticationPrincipal UserDetails userDetails // Inject authenticated user details
    ) {
        if (userDetails == null) {
             // Should not happen if security is configured correctly, but good practice to check
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        UUID authorId = getUserIdFromUserDetails(userDetails); // Extract user ID
        ConcernDto createdConcern = concernService.createConcern(request, authorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdConcern);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<Page<ConcernDto>> getLeaderboard(
            @RequestParam GeographicLevel level,
            @RequestParam String locationIdentifier,
            @PageableDefault(size = 20) Pageable pageable // Default page size 20. Sorting handled in service.
    ) {
        Page<ConcernDto> leaderboardPage = concernService.getLeaderboard(level, locationIdentifier, pageable);
        return ResponseEntity.ok(leaderboardPage);
    }

    @PostMapping("/vote")
    public ResponseEntity<ConcernDto> castVote(
            @Valid @RequestBody VoteRequest request,
            @AuthenticationPrincipal UserDetails userDetails // Inject authenticated user details
    ) {
        if (userDetails == null) {
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UUID userId = getUserIdFromUserDetails(userDetails); // Extract user ID
        ConcernDto updatedConcern = concernService.castVote(request, userId);
        return ResponseEntity.ok(updatedConcern);
    }

    // --- Helper ---
    // Extracts the UserEntity UUID from UserDetails (which uses mobile number as username)
    private UUID getUserIdFromUserDetails(UserDetails userDetails) {
        if (userDetails == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required."); 
        }
        String mobileNumber = userDetails.getUsername();
        // Fetch the UserEntity from the repository to get the UUID
        UserEntity user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> {
                     // This case should ideally not happen if the token is valid and user exists
                     // but handle defensively.
                     System.err.println("Error: User details found in token but user not found in DB: " + mobileNumber);
                     return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "User inconsistency detected.");
                 });
        return user.getId();
     }
}
