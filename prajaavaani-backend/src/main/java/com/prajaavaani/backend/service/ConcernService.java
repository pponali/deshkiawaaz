package com.prajaavaani.backend.service;

import com.prajaavaani.backend.dto.ConcernDto;
import com.prajaavaani.backend.dto.CreateConcernRequest;
import com.prajaavaani.backend.dto.VoteRequest;
import com.prajaavaani.backend.model.GeographicLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ConcernService {

    ConcernDto createConcern(CreateConcernRequest request, UUID authorId); // Pass authenticated user ID

    Page<ConcernDto> getLeaderboard(GeographicLevel level, String locationIdentifier, Pageable pageable);

    ConcernDto castVote(VoteRequest request, UUID userId); // Pass authenticated user ID
}
