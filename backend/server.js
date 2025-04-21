import express from "express";
import authRouter from "./routes/auth.route.js";
import movieRouter from "./routes/movie.route.js";
import tvRouter from "./routes/tv.route.js";
import searchRouter from "./routes/search.route.js";
import { ENV_VARS } from "./config/envVars.js";
import { connectDB } from "./config/db.js";
import { protectRoute } from "./middleware/protectRoute.js";
import cookieParser from "cookie-parser";

const app = express();

const PORT = ENV_VARS.PORT;
app.use(express.json());
app.use(cookieParser());


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/movie", protectRoute, movieRouter);
app.use("/api/v1/tv", protectRoute, tvRouter);
app.use("/api/v1/search", protectRoute, searchRouter);


app.listen(PORT, () => {
    console.log("Server is running on port",PORT);
    connectDB();
})

