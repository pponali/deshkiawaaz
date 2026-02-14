package com.prajaavaani.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "users") // Using "users" as "user" can be a reserved keyword
@Data // Lombok annotation for getters, setters, toString, equals, hashCode
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 15) // Assuming mobile numbers might include country code later
    private String mobileNumber;

    @Column(nullable = false)
    private Boolean isVerified = false;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp // Automatically set on creation
    private LocalDateTime createdAt;

    @UpdateTimestamp // Automatically set on update
    private LocalDateTime updatedAt;

    public String getMobileNumber() {
        return mobileNumber;
    }
    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }
    public Boolean getIsVerified() {
        return isVerified;
    }
    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
    public UUID getId() {
        return id;
    }

    // Relationships (e.g., OneToMany with Concerns, Votes) can be added later
}
