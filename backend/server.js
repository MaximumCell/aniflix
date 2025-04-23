import express from "express";
import authRouter from "./routes/auth.route.js";
import movieRouter from "./routes/movie.route.js";
import tvRouter from "./routes/tv.route.js";
import searchRouter from "./routes/search.route.js";
import { ENV_VARS } from "./config/envVars.js";
import { connectDB } from "./config/db.js";
import { protectRoute } from "./middleware/protectRoute.js";
import cookieParser from "cookie-parser";
import path from "path";

const app = express();

const PORT = ENV_VARS.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/movie", protectRoute, movieRouter);
app.use("/api/v1/tv", protectRoute, tvRouter);
app.use("/api/v1/search", protectRoute, searchRouter);

if (ENV_VARS.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "/frontend/dist");
  console.log("Serving static files from:", staticPath);
  app.use(express.static(staticPath));

  // Change the fallback route to use a regex pattern
  const fallbackPattern = /^(.*)$/; // This regex matches any path
  console.log("Registering fallback route with pattern:", fallbackPattern);
  app.get(fallbackPattern, (req, res) => {
    const indexPath = path.resolve(__dirname, "frontend", "dist", "index.html");
    console.log("Sending index.html from:", indexPath);
    res.sendFile(indexPath);
  });

  console.log("Production static and fallback routes registered.");
}

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
  connectDB();
});
