import { RowDataPacket } from "mysql2"

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

interface CountResult extends RowDataPacket {
    count: number
}

export type { Userinfo, ApiResponse, CountResult }
