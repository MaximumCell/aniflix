import express from "express";
import { getMovieByCategory, getMoviesDetails, getMovieTrailers, getSimilarMovie, getTrendingMovies } from "../controllers/movie.controller.js";

const router = express.Router();

router.get("/trending", getTrendingMovies);
router.get("/:id/trailers", getMovieTrailers);
router.get("/:id/details", getMoviesDetails);
router.get("/:id/similar", getSimilarMovie);
router.get("/:category", getMovieByCategory);

export default router;