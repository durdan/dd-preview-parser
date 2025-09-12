package com.example.plantuml.exception;

public class PlantUMLException extends RuntimeException {
    
    private final String errorCode;
    
    public PlantUMLException(String message) {
        super(message);
        this.errorCode = "PLANTUML_ERROR";
    }
    
    public PlantUMLException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public PlantUMLException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "PLANTUML_ERROR";
    }
    
    public PlantUMLException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}