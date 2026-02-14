package com.prajaavaani.backend.dto;

import com.prajaavaani.backend.model.VoteEntity;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class VoteRequest {

    // userId will likely come from the authenticated user context
    // private UUID userId; 

    @NotNull(message = "Concern ID cannot be null")
    private UUID concernId;

    @NotNull(message = "Vote type (UPVOTE/DOWNVOTE) must be specified")
    private VoteEntity.VoteType voteType; 

    public UUID getConcernId() {
        return concernId;
    }
    public VoteEntity.VoteType getVoteType() {
        return voteType;
    }
}
