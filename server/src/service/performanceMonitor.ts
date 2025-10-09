interface PerformanceMetrics {
    timestamp: number;
    responseTime: number;
    endpoint: string;
    method: string;
    statusCode: number;
    memoryUsage: NodeJS.MemoryUsage;
    activeConnections: number;
}

export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: PerformanceMetrics[] = [];
    private readonly maxMetrics = 1000; // Keep last 1000 metrics

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    recordMetric(metric: Omit<PerformanceMetrics, 'timestamp' | 'memoryUsage'>): void {
        const fullMetric: PerformanceMetrics = {
            ...metric,
            timestamp: Date.now(),
            memoryUsage: process.memoryUsage()
        };

        this.metrics.push(fullMetric);

        // Keep only recent metrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
    }

    getMetrics(timeRangeMs: number = 3600000): PerformanceMetrics[] { // Default 1 hour
        const cutoff = Date.now() - timeRangeMs;
        return this.metrics.filter(m => m.timestamp > cutoff);
    }

    getAverageResponseTime(timeRangeMs: number = 3600000): number {
        const recentMetrics = this.getMetrics(timeRangeMs);
        if (recentMetrics.length === 0) return 0;

        const total = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0);
        return total / recentMetrics.length;
    }

    getErrorRate(timeRangeMs: number = 3600000): number {
        const recentMetrics = this.getMetrics(timeRangeMs);
        if (recentMetrics.length === 0) return 0;

        const errors = recentMetrics.filter(m => m.statusCode >= 400).length;
        return errors / recentMetrics.length;
    }

    getSystemHealth(): {
        memoryUsage: NodeJS.MemoryUsage;
        uptime: number;
        averageResponseTime: number;
        errorRate: number;
        totalRequests: number;
    } {
        return {
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
            averageResponseTime: this.getAverageResponseTime(),
            errorRate: this.getErrorRate(),
            totalRequests: this.metrics.length
        };
    }

    getEndpointStats(timeRangeMs: number = 3600000): Record<string, {
        count: number;
        averageResponseTime: number;
        errorRate: number;
    }> {
        const recentMetrics = this.getMetrics(timeRangeMs);
        const stats: Record<string, { times: number[]; errors: number; count: number }> = {};

        recentMetrics.forEach(metric => {
            if (!stats[metric.endpoint]) {
                stats[metric.endpoint] = { times: [], errors: 0, count: 0 };
            }

            stats[metric.endpoint].times.push(metric.responseTime);
            stats[metric.endpoint].count++;
            if (metric.statusCode >= 400) {
                stats[metric.endpoint].errors++;
            }
        });

        const result: Record<string, { count: number; averageResponseTime: number; errorRate: number }> = {};

        Object.entries(stats).forEach(([endpoint, data]) => {
            const avgTime = data.times.reduce((a, b) => a + b, 0) / data.times.length;
            result[endpoint] = {
                count: data.count,
                averageResponseTime: avgTime,
                errorRate: data.errors / data.count
            };
        });

        return result;
    }
}

export const performanceMonitor = PerformanceMonitor.getInstance();