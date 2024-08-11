interface ApiResponse {
    code: "S" | "E" | "F"
    message: string
    errorCode?: string
    user?: UserInfo
    token?: string
    postList?: Postinfo[]
    totalCount?: number
}

interface UserInfo {
    email: string
    password: string
    id?: number
    username?: string
    active?: number
}

enum BoardId {
    공지 = 1,
    자유 = 2,
    유머 = 3,
    질문 = 4,
    자랑 = 5,
    후기 = 6,
}

interface PostInfo {
    id: number
    board_id: number
    registered_by: number
    registered_date: number
    title: string
    content: string
    formatted_date?: Dayjs
}

interface GroupedPost {
    [key: number]: PostInfo[]
}

export type { UserInfo, ApiResponse, CountResult, PostInfo, GroupedPost }
export { BoardId }
