import dotenv from "dotenv";

if (process.env.NODE_ENV !== 'production') {
    dotenv.config(); // Only loads .env file in development/testing
}

export const ENV_VARS = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/myapp", 
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
};