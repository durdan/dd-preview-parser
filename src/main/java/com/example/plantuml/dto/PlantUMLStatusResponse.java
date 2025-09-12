package com.example.plantuml.dto;

public class PlantUMLStatusResponse {
    
    private String status;
    private String version;
    private long uptime;
    private int activeConnections;
    
    public PlantUMLStatusResponse() {}
    
    public PlantUMLStatusResponse(String status, String version, long uptime, int activeConnections) {
        this.status = status;
        this.version = version;
        this.uptime = uptime;
        this.activeConnections = activeConnections;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getVersion() {
        return version;
    }
    
    public void setVersion(String version) {
        this.version = version;
    }
    
    public long getUptime() {
        return uptime;
    }
    
    public void setUptime(long uptime) {
        this.uptime = uptime;
    }
    
    public int getActiveConnections() {
        return activeConnections;
    }
    
    public void setActiveConnections(int activeConnections) {
        this.activeConnections = activeConnections;
    }
}