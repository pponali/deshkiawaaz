package com.prajaavaani.backend.repository;

import com.prajaavaani.backend.model.VoteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoteRepository extends JpaRepository<VoteEntity, UUID> {

    // Find a vote by user ID and concern ID to check if a user has already voted
    Optional<VoteEntity> findByUserIdAndConcernId(UUID userId, UUID concernId);

    // Add other custom query methods as needed (e.g., count votes by type for a concern)
}
