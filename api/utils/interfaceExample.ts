export interface ServerResponse<T> {
    success: boolean
    response_code: number
    message?: string
    data?: T
}

// ----

const result = (await $axios.get("/asdasd")) as ServerResponse<PostList[]>
result.data
