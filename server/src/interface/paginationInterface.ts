// Query parameters ที่ client ส่งมา
export interface PaginationQuery {
    page?: number
    limit?: number
    offset?: number      // จำนวนรายการที่ข้าม (alternative to page)
}

// Metadata ที่ส่งกลับไปยัง client
export interface PaginationMeta {
    currentPage: number      
    totalPages: number       
    totalItems: number       
    itemsPerPage: number     
    hasNextPage: boolean     
    hasPreviousPage: boolean 
    nextPage: number | null  
    previousPage: number | null 
}

// Generic response structure สำหรับ paginated data
export interface PaginatedResponse<T> {
    data: T[]                // ข้อมูลที่ส่งกลับ
    pagination: PaginationMeta // ข้อมูล
    success: boolean        
    message?: string         
}

// Configuration สำหรับ pagination
export interface PaginationConfig {
    defaultLimit: number     
    maxLimit: number         
    minLimit: number         
}