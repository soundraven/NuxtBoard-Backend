const allowedOrigins = [
  "https://nuxt-board-frontend.vercel.app",
  "http://localhost:3000",
]

const corsOptions = {
  origin: function (origin: any, callback: any) {
    // 요청의 origin이 허용된 목록에 있는지 확인
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true) // 허용된 도메인일 경우
    } else {
      callback(new Error("Not allowed by CORS")) // 허용되지 않은 도메인일 경우
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "requiresToken"],
}

export default corsOptions
