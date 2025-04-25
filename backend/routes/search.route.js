import express from "express";
import { deleteSearchHistory, getSearchHistory, searchAnime, searchMovie, searchPerson, searchTV } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/movie/:query",searchMovie);
router.get("/person/:query",searchPerson);
router.get("/anime/:query",searchAnime); // Uncomment and implement if needed
router.get("/tv/:query",searchTV);

router.get("/history", getSearchHistory);
router.delete("/history/:id", deleteSearchHistory);

export default router;