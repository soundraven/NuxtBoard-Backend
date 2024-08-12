interface ApiResponse {
    code: "S" | "E" | "F"
    message: string
    errorCode?: string
    user?: UserInfo
    token?: string
    postList?: Postinfo[]
    totalCount?: number
}

interface NewUser {
    email: string
    password: string
    username?: string
}

interface UserInfo {
    email: string
    id?: number
    username?: string
    active?: number
}

interface LoginUserInfo extends UserInfo {
    password: string
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

export type {
    UserInfo,
    ApiResponse,
    NewUser,
    LoginUserInfo,
    PostInfo,
    GroupedPost,
}
export { BoardId }
