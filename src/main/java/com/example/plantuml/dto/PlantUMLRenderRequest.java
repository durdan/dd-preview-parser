package com.example.plantuml.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PlantUMLRenderRequest {
    
    @NotBlank(message = "PlantUML code cannot be empty")
    @Size(max = 50000, message = "PlantUML code cannot exceed 50,000 characters")
    private String code;
    
    private String format = "png"; // Default format
    
    public PlantUMLRenderRequest() {}
    
    public PlantUMLRenderRequest(String code, String format) {
        this.code = code;
        this.format = format;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getFormat() {
        return format;
    }
    
    public void setFormat(String format) {
        this.format = format;
    }
}