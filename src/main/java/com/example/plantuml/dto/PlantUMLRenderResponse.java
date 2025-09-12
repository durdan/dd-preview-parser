package com.example.plantuml.dto;

public class PlantUMLRenderResponse {
    
    private String imageData; // Base64 encoded image
    private String format;
    private long renderTimeMs;
    
    public PlantUMLRenderResponse() {}
    
    public PlantUMLRenderResponse(String imageData, String format, long renderTimeMs) {
        this.imageData = imageData;
        this.format = format;
        this.renderTimeMs = renderTimeMs;
    }
    
    public String getImageData() {
        return imageData;
    }
    
    public void setImageData(String imageData) {
        this.imageData = imageData;
    }
    
    public String getFormat() {
        return format;
    }
    
    public void setFormat(String format) {
        this.format = format;
    }
    
    public long getRenderTimeMs() {
        return renderTimeMs;
    }
    
    public void setRenderTimeMs(long renderTimeMs) {
        this.renderTimeMs = renderTimeMs;
    }
}