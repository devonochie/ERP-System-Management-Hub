
declare namespace NODEJS {
    interface ProcessEnv {
        PORT? : string
        NODE_ENV?: 'development' | 'production' | 'test'
        MONGO_URI? : string
        TEST_MONGO_URI?: string
        ACCESS_TOKEN_SECRET?: string
        STRIPE_KEY?: string
        STRIPE_WEBHOOK_SECRET?: string
        GROQ_API_KEY?: string
    }
}