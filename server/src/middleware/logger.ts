import { Elysia } from 'elysia'

export const requestLogger = () => new Elysia()
    .onRequest(({ request }) => {
        console.log(`${new Date().toISOString()} ${request.method} ${request.url}`)
    })