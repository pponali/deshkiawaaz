package com.prajaavaani.backend.dto;

import com.prajaavaani.backend.model.GeographicLevel;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ConcernDto {
    private UUID id;
    private UUID authorId; // Can be null
    private String authorName; // Can be null
    private String text;
    private int upvotes;
    private int downvotes;
    private int netVotes; // Calculated field
    private GeographicLevel geographicLevel;
    private String locationIdentifier;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public void setId(UUID id) {
        this.id = id;
    }
    public void setAuthorId(UUID authorId) {
        this.authorId = authorId;
    }
    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }
    public void setText(String text) {
        this.text = text;
    }
    public void setUpvotes(int upvotes) {
        this.upvotes = upvotes;
    }
    public void setDownvotes(int downvotes) {
        this.downvotes = downvotes;
    }
    public void setNetVotes(int netVotes) {
        this.netVotes = netVotes;
    }
    public void setGeographicLevel(GeographicLevel geographicLevel) {
        this.geographicLevel = geographicLevel;
    }
    public void setLocationIdentifier(String locationIdentifier) {
        this.locationIdentifier = locationIdentifier;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Add a constructor or static factory method for easy mapping from Entity if needed
}
