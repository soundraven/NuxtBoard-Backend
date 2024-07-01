interface ApiResponse {
    code: string
    message: string
    errorCode?: string
    data?: any
}

interface Userinfo {
    email: string
    password: string
    id?: number
    username?: string
}

export type { Userinfo, ApiResponse }
