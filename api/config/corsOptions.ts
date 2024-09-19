const allowedOrigins = [
  "https://nuxt-board-frontend.vercel.app",
  "http://localhost:3000",
]

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true) // 허용된 도메인일 경우
    } else {
      callback(new Error("Not allowed by CORS")) // 허용되지 않은 도메인일 경우
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "requiresToken"],
  preflightContinue: false, // 프리플라이트 요청에서 다음 미들웨어로 가지 않도록 설정
  optionsSuccessStatus: 204, // 프리플라이트 요청이 성공할 경우 상태 코드 설정
}

export default corsOptions
