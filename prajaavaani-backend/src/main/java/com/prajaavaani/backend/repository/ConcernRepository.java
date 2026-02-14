package com.prajaavaani.backend.repository;

import com.prajaavaani.backend.model.ConcernEntity;
import com.prajaavaani.backend.model.GeographicLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ConcernRepository extends JpaRepository<ConcernEntity, UUID> {

    // Find concerns by geographic level and location identifier, ordered by net votes
    // Using Pageable for pagination support
    // Note: Calculating net votes directly in JPQL can be complex depending on DB.
    // It might be more efficient to fetch and sort in the service layer,
    // or use a database view/native query if performance is critical.
    // This example fetches all matching and relies on service layer sorting.
    Page<ConcernEntity> findByGeographicLevelAndLocationIdentifier(
            GeographicLevel geographicLevel,
            String locationIdentifier,
            Pageable pageable);

    // Example of a query to sort by calculated net votes directly (might need DB-specific functions)
    // This is a simplified example and might need adjustments for specific DBs like PostgreSQL
    @Query("SELECT c FROM ConcernEntity c WHERE c.geographicLevel = :level AND c.locationIdentifier = :location ORDER BY c.netVotes DESC")
    Page<ConcernEntity> findAndSortByNetVotes(
            @Param("level") GeographicLevel level,
            @Param("location") String location,
            Pageable pageable);

    // Add other custom query methods as needed (e.g., find by author)
}
