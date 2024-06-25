interface ApiResponse<T> {
    status: number
    message: string
    data?: T
    error?: string
}

interface Userinfo {
    email: string
    password: string
    id?: number
    username?: string
}

export { Userinfo, ApiResponse }
