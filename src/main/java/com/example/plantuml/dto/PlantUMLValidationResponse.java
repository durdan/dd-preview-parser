package com.example.plantuml.dto;

import java.util.List;

public class PlantUMLValidationResponse {
    
    private boolean valid;
    private List<String> errors;
    private List<String> warnings;
    
    public PlantUMLValidationResponse() {}
    
    public PlantUMLValidationResponse(boolean valid, List<String> errors, List<String> warnings) {
        this.valid = valid;
        this.errors = errors;
        this.warnings = warnings;
    }
    
    public boolean isValid() {
        return valid;
    }
    
    public void setValid(boolean valid) {
        this.valid = valid;
    }
    
    public List<String> getErrors() {
        return errors;
    }
    
    public void setErrors(List<String> errors) {
        this.errors = errors;
    }
    
    public List<String> getWarnings() {
        return warnings;
    }
    
    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }
}