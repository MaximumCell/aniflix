import express from "express";

import { getAnimeByCategory, getAnimeDetails, getAnimeTrailers, getSimilarAnime, getTrendingAnime, } from "../controllers/anime.controller.js";


const router = express.Router();

router.get("/search/:query", getAnimeDetails);
router.get("/trending", getTrendingAnime);
router.get("/category/:categoryName", getAnimeByCategory); // Adjust the controller function as needed
router.get("/:id/details", getAnimeDetails); // Adjust the controller function as needed
router.get("/movie/:id/details", getAnimeDetails); // Adjust the controller function as needed
router.get("/:id/trailers", getAnimeTrailers); // Adjust the controller function as needed
router.get("/:id/similar", getSimilarAnime);

export default router;