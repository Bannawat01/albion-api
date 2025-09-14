import { file } from 'bun'
import path from 'path'

/*
 * TLS enabling rules:
 *  - ENABLE_TLS=true => always attempt to load cert/key
 *  - otherwise remain HTTP even in dev (simpler + explicit)
 *  - Path resolution: from server/src/configs -> ../../ssl/localhost*.pem
 *  - If certs missing => log warning + return empty object (HTTP fallback)
 */

const enable = String(Bun.env.ENABLE_TLS || '').toLowerCase() === 'true'
let _tls: Record<string, any> = {}

if (enable) {
    try {
        const sslDir = path.join(import.meta.dir, '..', '..', 'ssl')
        const cert = file(path.join(sslDir, 'localhost.pem'))
        const key = file(path.join(sslDir, 'localhost-key.pem'))
        _tls = { cert, key }
    } catch (e) {
        console.warn('[tls] ENABLE_TLS=true but certificates not found; continuing without TLS')
        _tls = {}
    }
}

export const tlsConfig = { ..._tls }