interface ApiResponse {
    code: "S" | "E" | "F"
    message: string
    errorCode?: string
    user?: Userinfo
    token?: string
}

interface Userinfo {
    email: string
    password: string
    id?: number
    username?: string
}

interface CountResult {
    count: number
}

export type { Userinfo, ApiResponse, CountResult }
