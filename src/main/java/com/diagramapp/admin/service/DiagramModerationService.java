package com.diagramapp.admin.service;

import com.diagramapp.admin.model.DiagramModerationStatus;
import com.diagramapp.admin.model.ModerationAction;
import com.diagramapp.admin.repository.AdminDiagramRepository;
import com.diagramapp.admin.repository.ModerationActionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class DiagramModerationService {
    
    private final AdminDiagramRepository diagramRepository;
    private final ModerationActionRepository moderationActionRepository;
    
    // Simple content filters - in production, use ML-based moderation
    private static final List<Pattern> INAPPROPRIATE_PATTERNS = List.of(
        Pattern.compile("\\b(spam|abuse|inappropriate)\\b", Pattern.CASE_INSENSITIVE)
    );
    
    @Autowired
    public DiagramModerationService(AdminDiagramRepository diagramRepository,
                                  ModerationActionRepository moderationActionRepository) {
        this.diagramRepository = diagramRepository;
        this.moderationActionRepository = moderationActionRepository;
    }
    
    public Page<Diagram> getDiagramsForModeration(DiagramModerationStatus status, Pageable pageable) {
        if (status == null) {
            throw new IllegalArgumentException("Moderation status cannot be null");
        }
        return diagramRepository.findByModerationStatus(status, pageable);
    }
    
    @Transactional
    public void moderateDiagram(Long diagramId, String adminId, DiagramModerationStatus newStatus, String reason) {
        if (diagramId == null || adminId == null || newStatus == null) {
            throw new IllegalArgumentException("DiagramId, adminId, and status are required");
        }
        
        Diagram diagram = diagramRepository.findById(diagramId)
            .orElseThrow(() -> new IllegalArgumentException("Diagram not found: " + diagramId));
        
        diagram.setModerationStatus(newStatus);
        diagram.setUpdatedAt(LocalDateTime.now());
        diagramRepository.save(diagram);
        
        // Record moderation action
        ModerationAction action = new ModerationAction(diagramId, adminId, newStatus, reason);
        moderationActionRepository.save(action);
    }
    
    public void autoFlagInappropriateContent(Diagram diagram) {
        if (diagram == null || diagram.getTitle() == null) {
            return;
        }
        
        String content = diagram.getTitle() + " " + (diagram.getDescription() != null ? diagram.getDescription() : "");
        
        boolean isInappropriate = INAPPROPRIATE_PATTERNS.stream()
            .anyMatch(pattern -> pattern.matcher(content).find());
        
        if (isInappropriate) {
            diagram.setModerationStatus(DiagramModerationStatus.FLAGGED);
            diagramRepository.save(diagram);
            
            ModerationAction action = new ModerationAction(
                diagram.getId(), 
                "system", 
                DiagramModerationStatus.FLAGGED, 
                "Auto-flagged for inappropriate content"
            );
            moderationActionRepository.save(action);
        }
    }
    
    public long getPendingModerationCount() {
        return diagramRepository.countByModerationStatus(DiagramModerationStatus.PENDING);
    }
    
    public List<ModerationAction> getModerationHistory(Long diagramId) {
        if (diagramId == null) {
            throw new IllegalArgumentException("DiagramId cannot be null");
        }
        return moderationActionRepository.findByDiagramIdOrderByCreatedAtDesc(diagramId);
    }
}