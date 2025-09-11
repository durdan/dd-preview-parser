package com.diagramapp.admin.repository;

import com.diagramapp.admin.model.DiagramModerationStatus;
import com.diagramapp.admin.model.UsageMetrics;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminDiagramRepository extends JpaRepository<Diagram, Long> {
    
    @Query("SELECT d FROM Diagram d WHERE d.moderationStatus = :status")
    Page<Diagram> findByModerationStatus(@Param("status") DiagramModerationStatus status, Pageable pageable);
    
    @Modifying
    @Query("UPDATE Diagram d SET d.moderationStatus = :status, d.updatedAt = :updatedAt WHERE d.id IN :ids")
    int bulkUpdateModerationStatus(@Param("ids") List<Long> ids, 
                                  @Param("status") DiagramModerationStatus status,
                                  @Param("updatedAt") LocalDateTime updatedAt);
    
    @Modifying
    @Query("DELETE FROM Diagram d WHERE d.id IN :ids")
    int bulkDeleteByIds(@Param("ids") List<Long> ids);
    
    @Query(value = """
        SELECT new com.diagramapp.admin.model.UsageMetrics(
            CAST(:date AS java.time.LocalDate),
            COUNT(d.id),
            COUNT(CASE WHEN d.isActive = true THEN 1 END),
            COUNT(CASE WHEN DATE(d.createdAt) = :date THEN 1 END),
            COUNT(CASE WHEN DATE(d.deletedAt) = :date THEN 1 END),
            COALESCE(AVG(d.viewCount), 0),
            COALESCE(SUM(d.viewCount), 0)
        )
        FROM Diagram d
        WHERE d.createdAt <= :endOfDay
        """)
    UsageMetrics getDailyUsageMetrics(@Param("date") LocalDate date, 
                                     @Param("endOfDay") LocalDateTime endOfDay);
    
    @Query("SELECT COUNT(d) FROM Diagram d WHERE d.moderationStatus = :status")
    long countByModerationStatus(@Param("status") DiagramModerationStatus status);
}