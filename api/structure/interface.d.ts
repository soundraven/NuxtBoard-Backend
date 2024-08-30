interface GeneralServerResponse<T = undefined> {
    success: boolean
    message: string
    data?: T
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
    formattedDate: Dayjs
    boardName: string
    registeredByUserName: string
    active: number
    files: string[]
}

interface FileUrls {
    originalName: string
    url: string
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

interface LikeInfo {
    totalLikes: number
    totalDislikes: number
}

interface LikedHistory {
    liked: number
    disliked: number
}

export type {
    UserInfo,
    GeneralServerResponse,
    NewUser,
    LoginUserInfo,
    PostInfo,
    GroupedPost,
    CommentInfo,
    ReplyInfo,
    BoardInfo,
    LikeInfo,
    LikedHistory,
    FileUrls,
}
