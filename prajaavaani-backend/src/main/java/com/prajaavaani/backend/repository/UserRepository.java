package com.prajaavaani.backend.repository;

import com.prajaavaani.backend.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    // Custom query method to find a user by mobile number
    Optional<UserEntity> findByMobileNumber(String mobileNumber);

    // Add other custom query methods as needed
}
