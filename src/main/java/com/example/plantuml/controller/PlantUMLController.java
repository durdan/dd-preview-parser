package com.example.plantuml.controller;

import com.example.plantuml.dto.*;
import com.example.plantuml.exception.PlantUMLException;
import com.example.plantuml.service.PlantUMLRenderer;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/plantuml")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PlantUMLController {
    
    private final PlantUMLRenderer plantUMLRenderer;
    private final Set<String> supportedFormats = Set.of("png", "svg", "txt");
    private final long startTime = System.currentTimeMillis();
    
    @Autowired
    public PlantUMLController(PlantUMLRenderer plantUMLRenderer) {
        this.plantUMLRenderer = plantUMLRenderer;
    }
    
    @PostMapping(value = "/render", 
                 consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<PlantUMLRenderResponse>> render(
            @Valid @RequestBody PlantUMLRenderRequest request) {
        
        return CompletableFuture.supplyAsync(() -> {
            validateFormat(request.getFormat());
            sanitizeInput(request.getCode());
            
            long startTime = System.currentTimeMillis();
            
            try {
                byte[] imageData = plantUMLRenderer.render(request.getCode(), request.getFormat());
                String base64Data = Base64.getEncoder().encodeToString(imageData);
                long renderTime = System.currentTimeMillis() - startTime;
                
                PlantUMLRenderResponse response = new PlantUMLRenderResponse(
                    base64Data, request.getFormat(), renderTime);
                
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                throw new PlantUMLException("Failed to render PlantUML diagram: " + e.getMessage(), 
                                          "RENDER_ERROR", e);
            }
        });
    }
    
    @PostMapping(value = "/validate",
                 consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PlantUMLValidationResponse> validate(
            @Valid @RequestBody PlantUMLValidationRequest request) {
        
        sanitizeInput(request.getCode());
        
        try {
            boolean isValid = plantUMLRenderer.validate(request.getCode());
            List<String> errors = isValid ? List.of() : 
                plantUMLRenderer.getValidationErrors(request.getCode());
            List<String> warnings = plantUMLRenderer.getValidationWarnings(request.getCode());
            
            PlantUMLValidationResponse response = new PlantUMLValidationResponse(
                isValid, errors, warnings);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            throw new PlantUMLException("Failed to validate PlantUML code: " + e.getMessage(),
                                      "VALIDATION_ERROR", e);
        }
    }
    
    @GetMapping(value = "/status", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PlantUMLStatusResponse> getStatus() {
        try {
            String version = plantUMLRenderer.getVersion();
            long uptime = System.currentTimeMillis() - startTime;
            int activeConnections = plantUMLRenderer.getActiveConnections();
            
            PlantUMLStatusResponse response = new PlantUMLStatusResponse(
                "healthy", version, uptime, activeConnections);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            PlantUMLStatusResponse response = new PlantUMLStatusResponse(
                "unhealthy", "unknown", 0, 0);
            return ResponseEntity.status(503).body(response);
        }
    }
    
    private void validateFormat(String format) {
        if (format != null && !supportedFormats.contains(format.toLowerCase())) {
            throw new PlantUMLException("Unsupported format: " + format + 
                ". Supported formats: " + supportedFormats, "UNSUPPORTED_FORMAT");
        }
    }
    
    private void sanitizeInput(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new PlantUMLException("PlantUML code cannot be empty", "INVALID_INPUT");
        }
        
        // Basic security check - prevent potential script injection
        String lowerCode = code.toLowerCase();
        if (lowerCode.contains("<script") || lowerCode.contains("javascript:") || 
            lowerCode.contains("data:text/html")) {
            throw new PlantUMLException("Invalid characters detected in PlantUML code", 
                                      "SECURITY_VIOLATION");
        }
    }
}