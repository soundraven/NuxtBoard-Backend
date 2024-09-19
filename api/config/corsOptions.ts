const corsOptions = {
  origin: "https://nuxt-board-frontend.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "requiresToken"],
}

export default corsOptions
