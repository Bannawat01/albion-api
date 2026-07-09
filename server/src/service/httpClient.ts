import { Agent as HttpAgent } from "http"

const httpsAgent = new HttpAgent({
    keepAlive: true,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 60000,
})

const httpAgent = new HttpAgent({
    keepAlive: true,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 60000,
})

export class HttpClient {
    private static instance: HttpClient

    static getInstance(): HttpClient {
        if (!HttpClient.instance) {
            HttpClient.instance = new HttpClient()
        }
        return HttpClient.instance
    }

    async get(url: string, options: RequestInit & { timeoutMs?: number } = {}): Promise<Response> {
        const agent = url.startsWith('https:') ? httpsAgent : httpAgent
        const { timeoutMs = 10000, signal, ...rest } = options

        // Bound every outbound request so a hung upstream cannot pile up sockets.
        const timeoutSignal = AbortSignal.timeout(timeoutMs)
        const finalSignal = signal
            ? (AbortSignal as any).any?.([signal, timeoutSignal]) ?? timeoutSignal
            : timeoutSignal

        return fetch(url, {
            ...rest,
            signal: finalSignal,
            // @ts-ignore - Bun supports agent
            agent,
            headers: {
                'Connection': 'keep-alive',
                'Accept-Encoding': 'gzip, deflate',
                ...rest.headers
            }
        })
    }

    // ✅ Connection Pool Statistics
    getStats() {
        return {
            https: {
                sockets: httpsAgent.sockets,
                freeSockets: httpsAgent.freeSockets,
                requests: httpsAgent.requests
            },
            http: {
                sockets: httpAgent.sockets,
                freeSockets: httpAgent.freeSockets,
                requests: httpAgent.requests
            }
        }
    }
}
