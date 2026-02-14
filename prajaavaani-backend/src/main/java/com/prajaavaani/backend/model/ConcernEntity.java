package com.prajaavaani.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "concerns")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConcernEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Optional relationship to the user who posted
    @ManyToOne(fetch = FetchType.LAZY) // Lazy fetch is generally preferred
    @JoinColumn(name = "author_id") // Foreign key column in concerns table
    private UserEntity author; // Can be null if anonymous posting is allowed

    @Column(length = 100) // Optional author name provided at posting
    private String authorName;

    @Column(nullable = false, columnDefinition = "TEXT") // Use TEXT for potentially long concern descriptions
    private String text;

    @Column(nullable = false)
    @ColumnDefault("0") // Default value in the database
    private Integer upvotes = 0;

    @Column(nullable = false)
    @ColumnDefault("0")
    private Integer downvotes = 0;

    @Column(nullable = false)
    @ColumnDefault("0")
    private Integer netVotes = 0;

    @Enumerated(EnumType.STRING) // Store enum name as string in DB
    @Column(nullable = false, length = 20)
    private GeographicLevel geographicLevel;

    @Column(nullable = false, length = 100) // e.g., Pincode, City Name, State Name
    private String locationIdentifier;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public void setAuthor(UserEntity author) {
        this.author = author;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public void setText(String text) {
        this.text = text;
    }

    public void setGeographicLevel(GeographicLevel geographicLevel) {
        this.geographicLevel = geographicLevel;
    }

    public void setLocationIdentifier(String locationIdentifier) {
        this.locationIdentifier = locationIdentifier;
    }

    public UUID getId() {
        return id;
    }

    public String getAuthorName() {
        return authorName;
    }

    public String getText() {
        return text;
    }

    public int getUpvotes() {
        return upvotes;
    }

    public int getDownvotes() {
        return downvotes;
    }

    public int getNetVotes() {
        return netVotes;
    }

    public GeographicLevel getGeographicLevel() {
        return geographicLevel;
    }

    public String getLocationIdentifier() {
        return locationIdentifier;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public UserEntity getAuthor() {
        return author;
    }

    public void setNetVotes(Integer netVotes) {
        this.netVotes = netVotes;
    }

    public void setUpvotes(int upvotes) {
        this.upvotes = upvotes;
    }

    public void setDownvotes(int downvotes) {
        this.downvotes = downvotes;
    }

    // Relationships (e.g., OneToMany with Votes) can be added later
}
