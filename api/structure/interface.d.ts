interface ApiResponse {
    code: "S" | "E" | "F"
    message: string
    errorCode?: string
    user?: UserInfo
    token?: string
    postList?: PostInfo[]
    totalCount?: number
}

interface NewUser {
    email: string
    password: string
    userName?: string
}

interface UserInfo {
    email: string
    id: number
    userName?: string
    active: number
}

interface LoginUserInfo extends UserInfo {
    password: string
}

interface BoardInfo {
    boardId: number
    boardName: string
}

interface PostInfo {
    id: number
    boardId: number
    registeredBy: number
    registeredDate: number
    title: string
    content: string
    formattedDate?: Dayjs
    boardName: string
    registeredByUserName: string
}

interface GroupedPost {
    [key: number]: PostInfo[]
}

interface CommentInfo {
    id: number
    postId: number
    registeredBy: number
    userName: string
    registeredDate: number
    content: string
    formattedDate?: Dayjs
}
interface ReplyInfo {
    id: number
    postId: number
    commentId: number
    registeredBy: number
    userName: string
    registeredDate: number
    content: string
    formattedDate?: Dayjs
}

export type {
    UserInfo,
    ApiResponse,
    NewUser,
    LoginUserInfo,
    PostInfo,
    GroupedPost,
    CommentInfo,
    ReplyInfo,
    BoardInfo,
}
