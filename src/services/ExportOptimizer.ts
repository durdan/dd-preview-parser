import { OptimizationReport } from '../types/export';

export class ExportOptimizer {
  private exportTimes: number[] = [];
  private cacheHits = 0;
  private cacheMisses = 0;

  recordExport(renderTime: number, cached: boolean): void {
    this.exportTimes.push(renderTime);
    
    if (cached) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }
  }

  generateReport(): OptimizationReport {
    const totalExports = this.cacheHits + this.cacheMisses;
    const cacheHitRate = totalExports > 0 ? this.cacheHits / totalExports : 0;
    const averageRenderTime = this.exportTimes.length > 0 
      ? this.exportTimes.reduce((a, b) => a + b, 0) / this.exportTimes.length 
      : 0;

    const recommendations = this.generateRecommendations(cacheHitRate, averageRenderTime);

    return {
      totalExports,
      cacheHitRate,
      averageRenderTime,
      recommendations
    };
  }

  private generateRecommendations(cacheHitRate: number, avgRenderTime: number): string[] {
    const recommendations: string[] = [];

    if (cacheHitRate < 0.3) {
      recommendations.push('Low cache hit rate. Consider increasing cache TTL or size.');
    }

    if (avgRenderTime > 2000) {
      recommendations.push('High average render time. Consider optimizing diagram complexity.');
    }

    if (this.exportTimes.length > 10) {
      const recentTimes = this.exportTimes.slice(-10);
      const recentAvg = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
      
      if (recentAvg > avgRenderTime * 1.5) {
        recommendations.push('Recent exports are slower than average. Check system resources.');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Export performance is optimal.');
    }

    return recommendations;
  }

  reset(): void {
    this.exportTimes = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}