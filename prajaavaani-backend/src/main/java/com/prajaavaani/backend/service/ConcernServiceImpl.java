package com.prajaavaani.backend.service;

import com.prajaavaani.backend.dto.ConcernDto;
import com.prajaavaani.backend.dto.CreateConcernRequest;
import com.prajaavaani.backend.dto.VoteRequest;
import com.prajaavaani.backend.model.ConcernEntity;
import com.prajaavaani.backend.model.GeographicLevel;
import com.prajaavaani.backend.model.UserEntity;
import com.prajaavaani.backend.model.VoteEntity;
import com.prajaavaani.backend.repository.ConcernRepository;
import com.prajaavaani.backend.repository.UserRepository;
import com.prajaavaani.backend.repository.VoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Important for vote logic

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ConcernServiceImpl implements ConcernService {

    private static final Logger log = LoggerFactory.getLogger(ConcernServiceImpl.class);

    private final ConcernRepository concernRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;

    public ConcernServiceImpl(ConcernRepository concernRepository, UserRepository userRepository, VoteRepository voteRepository) {
        this.concernRepository = concernRepository;
        this.userRepository = userRepository;
        this.voteRepository = voteRepository;
    }

    @Override
    @Transactional // Ensure atomicity
    public ConcernDto createConcern(CreateConcernRequest request, UUID authorId) {
        // Find the author (assuming authorId is validated upstream, e.g., via security context)
        UserEntity author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found with ID: " + authorId)); // Replace with specific exception

        ConcernEntity concern = new ConcernEntity();
        concern.setAuthor(author); // Set the author relationship
        concern.setAuthorName(request.getAuthorName()); // Can be null
        concern.setText(request.getText());
        concern.setGeographicLevel(request.getGeographicLevel());
        concern.setLocationIdentifier(request.getLocationIdentifier());
        // upvotes/downvotes/netVotes default to 0
        concern.setNetVotes(0);

        ConcernEntity savedConcern = concernRepository.save(concern);
        log.info("Created concern with ID: {}", savedConcern.getId());
        return mapToDto(savedConcern);
    }

    @Override
    public Page<ConcernDto> getLeaderboard(GeographicLevel level, String locationIdentifier, Pageable pageable) {
        log.info("Fetching leaderboard for Level: {}, Location: {}, Page: {}", level, locationIdentifier, pageable.getPageNumber());
        
        // Use the repository method that sorts by net votes
        // Note: Ensure pageable includes sort direction if needed, e.g., Sort.by(Sort.Direction.DESC, "netVotesAlias")
        // If sorting in Java:
        // Page<ConcernEntity> concernPage = concernRepository.findByGeographicLevelAndLocationIdentifier(level, locationIdentifier, pageable);
        // List<ConcernDto> dtos = concernPage.getContent().stream()
        //         .map(this::mapToDto)
        //         .sorted((c1, c2) -> Integer.compare(c2.getNetVotes(), c1.getNetVotes())) // Sort DTOs
        //         .collect(Collectors.toList());
        // return new PageImpl<>(dtos, pageable, concernPage.getTotalElements());

        // Using the JPQL query for sorting (adjust if needed)
         Page<ConcernEntity> concernPage = concernRepository.findAndSortByNetVotes(level, locationIdentifier, pageable);
         List<ConcernDto> dtos = concernPage.getContent().stream()
                 .map(this::mapToDto)
                 .collect(Collectors.toList());
         return new PageImpl<>(dtos, pageable, concernPage.getTotalElements());
    }

    @Override
    @Transactional // Crucial for consistent vote updates
    public ConcernDto castVote(VoteRequest request, UUID userId) {
        log.info("Processing vote request: User ID {}, Concern ID {}, Type {}", userId, request.getConcernId(), request.getVoteType());

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId)); // Use specific exception
        ConcernEntity concern = concernRepository.findById(request.getConcernId())
                .orElseThrow(() -> new RuntimeException("Concern not found: " + request.getConcernId())); // Use specific exception

        Optional<VoteEntity> existingVoteOpt = voteRepository.findByUserIdAndConcernId(userId, request.getConcernId());

        if (existingVoteOpt.isPresent()) {
            // User has already voted on this concern
            VoteEntity existingVote = existingVoteOpt.get();
            if (existingVote.getVoteType() == request.getVoteType()) {
                // User is casting the same vote again - remove the vote (toggle off)
                log.debug("Removing existing {} for concern {}", existingVote.getVoteType(), concern.getId());
                if (existingVote.getVoteType() == VoteEntity.VoteType.UPVOTE) {
                    concern.setUpvotes(concern.getUpvotes() - 1);
                } else {
                    concern.setDownvotes(concern.getDownvotes() - 1);
                }
                // Update netVotes
                concern.setNetVotes(concern.getUpvotes() - concern.getDownvotes());
                voteRepository.delete(existingVote);
            } else {
                // User is changing their vote
                log.debug("Changing vote from {} to {} for concern {}", existingVote.getVoteType(), request.getVoteType(), concern.getId());
                if (existingVote.getVoteType() == VoteEntity.VoteType.UPVOTE) {
                    concern.setUpvotes(concern.getUpvotes() - 1);
                    concern.setDownvotes(concern.getDownvotes() + 1);
                } else {
                    concern.setDownvotes(concern.getDownvotes() - 1);
                    concern.setUpvotes(concern.getUpvotes() + 1);
                }
                // Update netVotes
                concern.setNetVotes(concern.getUpvotes() - concern.getDownvotes());
                existingVote.setVoteType(request.getVoteType());
                voteRepository.save(existingVote); // Update existing vote record
            }
        } else {
            // New vote
            log.debug("Casting new {} for concern {}", request.getVoteType(), concern.getId());
            VoteEntity newVote = new VoteEntity();
            newVote.setUser(user);
            newVote.setConcern(concern);
            newVote.setVoteType(request.getVoteType());
            if (request.getVoteType() == VoteEntity.VoteType.UPVOTE) {
                concern.setUpvotes(concern.getUpvotes() + 1);
            } else {
                concern.setDownvotes(concern.getDownvotes() + 1);
            }
            // Update netVotes
            concern.setNetVotes(concern.getUpvotes() - concern.getDownvotes());
            voteRepository.save(newVote);
        }

        ConcernEntity updatedConcern = concernRepository.save(concern); // Save updated vote counts
        log.info("Vote processed for concern ID: {}. New counts: Up={}, Down={}", updatedConcern.getId(), updatedConcern.getUpvotes(), updatedConcern.getDownvotes());
        return mapToDto(updatedConcern);
    }

    // --- Helper Methods ---

    // Maps ConcernEntity to ConcernDto
    private ConcernDto mapToDto(ConcernEntity entity) {
        ConcernDto dto = new ConcernDto();
        dto.setId(entity.getId());
        dto.setAuthorId(entity.getAuthor() != null ? entity.getAuthor().getId() : null);
        dto.setAuthorName(entity.getAuthorName());
        dto.setText(entity.getText());
        dto.setUpvotes(entity.getUpvotes());
        dto.setDownvotes(entity.getDownvotes());
        dto.setNetVotes(entity.getNetVotes()); // Use persistent field
        dto.setGeographicLevel(entity.getGeographicLevel());
        dto.setLocationIdentifier(entity.getLocationIdentifier());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
