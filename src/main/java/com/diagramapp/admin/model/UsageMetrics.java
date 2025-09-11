package com.diagramapp.admin.model;

import java.time.LocalDate;

public class UsageMetrics {
    private LocalDate date;
    private long totalDiagrams;
    private long activeDiagrams;
    private long newDiagrams;
    private long deletedDiagrams;
    private double avgViewsPerDiagram;
    private long totalViews;
    
    public UsageMetrics(LocalDate date, long totalDiagrams, long activeDiagrams, 
                       long newDiagrams, long deletedDiagrams, double avgViewsPerDiagram, long totalViews) {
        this.date = date;
        this.totalDiagrams = totalDiagrams;
        this.activeDiagrams = activeDiagrams;
        this.newDiagrams = newDiagrams;
        this.deletedDiagrams = deletedDiagrams;
        this.avgViewsPerDiagram = avgViewsPerDiagram;
        this.totalViews = totalViews;
    }
    
    // Getters
    public LocalDate getDate() { return date; }
    public long getTotalDiagrams() { return totalDiagrams; }
    public long getActiveDiagrams() { return activeDiagrams; }
    public long getNewDiagrams() { return newDiagrams; }
    public long getDeletedDiagrams() { return deletedDiagrams; }
    public double getAvgViewsPerDiagram() { return avgViewsPerDiagram; }
    public long getTotalViews() { return totalViews; }
}