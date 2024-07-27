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

enum BoardId {
    공지 = 1,
    자유 = 2,
    유머 = 3,
    질문 = 4,
    자랑 = 5,
    후기 = 6,
}

interface Postinfo {
    id: number
    board_id: number
    registered_by: number
    registered_date: number
    title: string
    content: string
    formatted_date?: Dayjs
}

export type { Userinfo, ApiResponse, CountResult, Postinfo }
export { BoardId }
