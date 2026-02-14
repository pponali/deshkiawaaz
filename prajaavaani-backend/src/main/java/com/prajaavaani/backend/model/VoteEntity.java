package com.prajaavaani.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "votes", uniqueConstraints = {
    // Ensure a user can only vote once per concern
    @UniqueConstraint(columnNames = {"user_id", "concern_id"}) 
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) // Vote must belong to a user
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) // Vote must belong to a concern
    @JoinColumn(name = "concern_id", nullable = false)
    private ConcernEntity concern;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10) // 'UPVOTE' or 'DOWNVOTE'
    private VoteType voteType;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime timestamp;

    public VoteType getVoteType() {
        return voteType;
    }
    public void setVoteType(VoteType voteType) {
        this.voteType = voteType;
    }
    public UserEntity getUser() {
        return user;
    }
    public void setUser(UserEntity user) {
        this.user = user;
    }
    public ConcernEntity getConcern() {
        return concern;
    }
    public void setConcern(ConcernEntity concern) {
        this.concern = concern;
    }

    public enum VoteType {
        UPVOTE, DOWNVOTE
    }
}
