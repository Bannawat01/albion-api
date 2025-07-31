// Error response from API
export interface ApiError {
    error: string
    message?: string
    statusCode?: number
}

export interface ApiErrorResponse {
    error: ApiError
}

export interface ApiSuccessResponse<T> {
    data: T
    text?: string
}
