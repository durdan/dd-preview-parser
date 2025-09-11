package com.diagramapp.admin.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "moderation_actions")
public class ModerationAction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "diagram_id", nullable = false)
    private Long diagramId;
    
    @Column(name = "admin_id", nullable = false)
    private String adminId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiagramModerationStatus status;
    
    @Column(length = 500)
    private String reason;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    // Constructors
    public ModerationAction() {}
    
    public ModerationAction(Long diagramId, String adminId, DiagramModerationStatus status, String reason) {
        this.diagramId = diagramId;
        this.adminId = adminId;
        this.status = status;
        this.reason = reason;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getDiagramId() { return diagramId; }
    public void setDiagramId(Long diagramId) { this.diagramId = diagramId; }
    
    public String getAdminId() { return adminId; }
    public void setAdminId(String adminId) { this.adminId = adminId; }
    
    public DiagramModerationStatus getStatus() { return status; }
    public void setStatus(DiagramModerationStatus status) { this.status = status; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}