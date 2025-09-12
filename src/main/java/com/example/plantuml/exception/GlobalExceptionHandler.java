package com.example.plantuml.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(PlantUMLException.class)
    public ResponseEntity<Map<String, Object>> handlePlantUMLException(PlantUMLException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", ex.getErrorCode());
        error.put("message", ex.getMessage());
        error.put("timestamp", System.currentTimeMillis());
        
        HttpStatus status = getStatusForErrorCode(ex.getErrorCode());
        return ResponseEntity.status(status).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, Object> error = new HashMap<>();
        Map<String, String> fieldErrors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach(err -> {
            String fieldName = ((FieldError) err).getField();
            String errorMessage = err.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });
        
        error.put("error", "VALIDATION_ERROR");
        error.put("message", "Invalid request parameters");
        error.put("fieldErrors", fieldErrors);
        error.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", "INTERNAL_ERROR");
        error.put("message", "An unexpected error occurred");
        error.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
    
    private HttpStatus getStatusForErrorCode(String errorCode) {
        return switch (errorCode) {
            case "INVALID_SYNTAX" -> HttpStatus.BAD_REQUEST;
            case "RENDER_TIMEOUT" -> HttpStatus.REQUEST_TIMEOUT;
            case "UNSUPPORTED_FORMAT" -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }
}