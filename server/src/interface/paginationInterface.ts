// Query parameters ที่ client ส่งมา
 interface PaginationQuery {
    page?: number
    limit?: number
    offset?: number      // จำนวนรายการที่ข้าม (alternative to page)
}

// Metadata ที่ส่งกลับไปยัง client
 interface PaginationMeta {
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
 interface PaginatedResponse<T> {
    data: T[]                // ข้อมูลที่ส่งกลับ
    pagination: PaginationMeta // ข้อมูล
    success: boolean        
    message?: string         
}

// Configuration สำหรับ pagination
 interface PaginationConfig {
    defaultLimit: number     
    maxLimit: number         
    minLimit: number         
}

export type { PaginationQuery, PaginationMeta, PaginatedResponse, PaginationConfig }