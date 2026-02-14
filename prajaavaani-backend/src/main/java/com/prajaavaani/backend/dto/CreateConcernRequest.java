package com.prajaavaani.backend.dto;

import com.prajaavaani.backend.model.GeographicLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateConcernRequest {

    // authorId will likely come from the authenticated user context (e.g., JWT)
    // private UUID authorId; 

    @Size(max = 100, message = "Author name cannot exceed 100 characters")
    private String authorName; // Optional

    @NotBlank(message = "Concern text cannot be blank")
    @Size(max = 5000, message = "Concern text cannot exceed 5000 characters") // Example limit
    private String text;

    @NotNull(message = "Geographic level must be specified")
    private GeographicLevel geographicLevel;

    @NotBlank(message = "Location identifier cannot be blank")
    @Size(max = 100, message = "Location identifier cannot exceed 100 characters")
    private String locationIdentifier;

    public String getAuthorName() {
        return authorName;
    }

    public String getText() {
        return text;
    }

    public GeographicLevel getGeographicLevel() {
        return geographicLevel;
    }

    public String getLocationIdentifier() {
        return locationIdentifier;
    }
}
