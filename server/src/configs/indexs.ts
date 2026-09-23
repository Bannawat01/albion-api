export const INDEX_DEFINITIONS = {
    users: [
        { fields: { googleId: 1 }, options: { unique: true } },
        { fields: { email: 1 }, options: { unique: true } }
    ],
    oauth_states: [
        { fields: { state: 1 }, options: { unique: true } },
        { fields: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } }
    ],
    analytics_events: [
        { fields: { createdAt: 1, visitorId: 1 }, options: {} },
        { fields: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } }
    ]
}
