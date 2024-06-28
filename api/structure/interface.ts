interface ApiResponse {
    code: string
    errorcode?: string
    message: string
    data?: any
}

interface Userinfo {
    email: string
    password: string
    id?: number
    username?: string
}

export { Userinfo, ApiResponse }
