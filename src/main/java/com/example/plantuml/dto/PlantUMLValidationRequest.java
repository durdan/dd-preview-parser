package com.example.plantuml.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PlantUMLValidationRequest {
    
    @NotBlank(message = "PlantUML code cannot be empty")
    @Size(max = 50000, message = "PlantUML code cannot exceed 50,000 characters")
    private String code;
    
    public PlantUMLValidationRequest() {}
    
    public PlantUMLValidationRequest(String code) {
        this.code = code;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
}