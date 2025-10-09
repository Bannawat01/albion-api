#!/usr/bin/env node

/**
 * Performance Benchmark Script for Albion API
 * Tests various endpoints and measures response times
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8800';
const CONCURRENT_REQUESTS = parseInt(process.env.CONCURRENT_REQUESTS) || 10;
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS) || 100;
const WARMUP_REQUESTS = parseInt(process.env.WARMUP_REQUESTS) || 20;

class BenchmarkRunner {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.agent = baseUrl.startsWith('https:') ?
            new https.Agent({ keepAlive: true, maxSockets: 50 }) :
            new http.Agent({ keepAlive: true, maxSockets: 50 });
    }

    async makeRequest(endpoint, method = 'GET') {
        return new Promise((resolve, reject) => {
            const url = `${this.baseUrl}${endpoint}`;
            const startTime = process.hrtime.bigint();

            const req = (url.startsWith('https:') ? https : http).request(url, {
                method,
                agent: this.agent,
                headers: {
                    'User-Agent': 'Albion-API-Benchmark/1.0',
                    'Accept': 'application/json'
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const endTime = process.hrtime.bigint();
                    const responseTime = Number(endTime - startTime) / 1e6; // Convert to milliseconds

                    resolve({
                        endpoint,
                        statusCode: res.statusCode,
                        responseTime,
                        success: res.statusCode >= 200 && res.statusCode < 300,
                        dataLength: data.length
                    });
                });
            });

            req.on('error', reject);
            req.setTimeout(30000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    async runConcurrentRequests(endpoints, concurrency = CONCURRENT_REQUESTS) {
        const results = [];

        for (let i = 0; i < endpoints.length; i += concurrency) {
            const batch = endpoints.slice(i, i + concurrency);
            const batchPromises = batch.map(endpoint => this.makeRequest(endpoint));
            const batchResults = await Promise.allSettled(batchPromises);

            batchResults.forEach(result => {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                } else {
                    results.push({
                        endpoint: 'unknown',
                        statusCode: 0,
                        responseTime: 0,
                        success: false,
                        error: result.reason.message
                    });
                }
            });
        }

        return results;
    }

    calculateStats(results) {
        const successful = results.filter(r => r.success);
        const responseTimes = successful.map(r => r.responseTime);

        if (responseTimes.length === 0) {
            return {
                totalRequests: results.length,
                successfulRequests: 0,
                failedRequests: results.length,
                successRate: 0,
                averageResponseTime: 0,
                minResponseTime: 0,
                maxResponseTime: 0,
                p95ResponseTime: 0,
                p99ResponseTime: 0,
                requestsPerSecond: 0
            };
        }

        responseTimes.sort((a, b) => a - b);

        const totalTime = results.reduce((sum, r) => sum + r.responseTime, 0);
        const avgResponseTime = totalTime / results.length;

        return {
            totalRequests: results.length,
            successfulRequests: successful.length,
            failedRequests: results.length - successful.length,
            successRate: (successful.length / results.length) * 100,
            averageResponseTime: avgResponseTime,
            minResponseTime: Math.min(...responseTimes),
            maxResponseTime: Math.max(...responseTimes),
            p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)],
            p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)],
            requestsPerSecond: results.length / (totalTime / 1000)
        };
    }

    async runBenchmark() {
        console.log('🚀 Starting Albion API Performance Benchmark');
        console.log(`📊 Configuration:`);
        console.log(`   Base URL: ${this.baseUrl}`);
        console.log(`   Concurrent Requests: ${CONCURRENT_REQUESTS}`);
        console.log(`   Total Requests: ${TOTAL_REQUESTS}`);
        console.log(`   Warmup Requests: ${WARMUP_REQUESTS}`);
        console.log('');

        // Test endpoints
        const endpoints = [
            '/',
            '/health/database',
            '/health/performance',
            '/metrics/connections',
            '/api/items?page=1&limit=10',
            '/api/gold'
        ];

        // Warmup phase
        console.log('🔥 Warming up...');
        const warmupEndpoints = Array(WARMUP_REQUESTS).fill('/health/database');
        await this.runConcurrentRequests(warmupEndpoints, 5);
        console.log('✅ Warmup complete\n');

        // Main benchmark
        console.log('🏃 Running benchmark...');
        const testEndpoints = [];
        for (let i = 0; i < TOTAL_REQUESTS; i++) {
            testEndpoints.push(endpoints[i % endpoints.length]);
        }

        const startTime = Date.now();
        const results = await this.runConcurrentRequests(testEndpoints);
        const endTime = Date.now();

        const stats = this.calculateStats(results);
        const totalDuration = (endTime - startTime) / 1000;

        // Display results
        console.log('\n📈 Benchmark Results:');
        console.log('='.repeat(50));
        console.log(`Total Duration: ${totalDuration.toFixed(2)}s`);
        console.log(`Total Requests: ${stats.totalRequests}`);
        console.log(`Successful Requests: ${stats.successfulRequests}`);
        console.log(`Failed Requests: ${stats.failedRequests}`);
        console.log(`Success Rate: ${stats.successRate.toFixed(2)}%`);
        console.log(`Requests/Second: ${stats.requestsPerSecond.toFixed(2)}`);
        console.log('');
        console.log('Response Time Statistics:');
        console.log(`Average: ${stats.averageResponseTime.toFixed(2)}ms`);
        console.log(`Min: ${stats.minResponseTime.toFixed(2)}ms`);
        console.log(`Max: ${stats.maxResponseTime.toFixed(2)}ms`);
        console.log(`95th Percentile: ${stats.p95ResponseTime.toFixed(2)}ms`);
        console.log(`99th Percentile: ${stats.p99ResponseTime.toFixed(2)}ms`);

        // Endpoint breakdown
        console.log('\n📊 Per-Endpoint Statistics:');
        const endpointStats = {};
        results.forEach(result => {
            if (!endpointStats[result.endpoint]) {
                endpointStats[result.endpoint] = [];
            }
            endpointStats[result.endpoint].push(result);
        });

        Object.entries(endpointStats).forEach(([endpoint, endpointResults]) => {
            const endpointStats = this.calculateStats(endpointResults);
            console.log(`\n${endpoint}:`);
            console.log(`  Success Rate: ${endpointStats.successRate.toFixed(2)}%`);
            console.log(`  Average Response Time: ${endpointStats.averageResponseTime.toFixed(2)}ms`);
            console.log(`  Requests/Second: ${endpointStats.requestsPerSecond.toFixed(2)}`);
        });

        return stats;
    }
}

// Run benchmark if called directly
if (require.main === module) {
    const benchmark = new BenchmarkRunner(BASE_URL);
    benchmark.runBenchmark()
        .then(() => {
            console.log('\n✅ Benchmark completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Benchmark failed:', error);
            process.exit(1);
        });
}

module.exports = BenchmarkRunner;