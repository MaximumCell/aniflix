import { User } from "../models/user.model.js";
import { getMovieDetails } from "../services/tmbd.service.js";

export const searchPerson = async (req, res) => {
    try {
        const { query } = req.params;
        const response = await getMovieDetails(`https://api.themoviedb.org/3/search/person?query=${query}&include_adult=false&language=en-US&page=1`);
        if (response.results.length === 0) {
            return res.status(404).json({ success: false, message: "No Person Found" });
        }
        await User.findByIdAndUpdate(req.user._id, {
            $push: { searchHistory: {
                id: response.results[0].id,
                Image: response.results[0].profile_path,
                title: response.results[0].name,
                searchType: "person",
                createAt: new Date(),     
            } },
        });
        return res.status(200).json({ success: true, data: response.results });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const searchMovie = async (req, res) => {
    try {
        const { query } = req.params;
        const response = await getMovieDetails(`https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`);
        if (response.results.length === 0) {
            return res.status(404).json({ success: false, message: "No Movie Found" });
        }
        await User.findByIdAndUpdate(req.user._id, {
            $push: { searchHistory: {
                id: response.results[0].id,
                Image: response.results[0].poster_path,
                title: response.results[0].title,
                searchType: "movie",
                createAt: new Date(),     
            } },
        });
        return res.status(200).json({ success: true, data: response.results });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const searchTV = async (req, res) => {
    try {
        const { query } = req.params;
        const response = await getMovieDetails(`https://api.themoviedb.org/3/search/tv?query=${query}&include_adult=false&language=en-US&page=1`);
        if (response.results.length === 0) {
            return res.status(404).json({ success: false, message: "No TV Show Found" });
        }
        await User.findByIdAndUpdate(req.user._id, {
            $push: { searchHistory: {
                id: response.results[0].id,
                Image: response.results[0].poster_path,
                title: response.results[0].name,
                searchType: "tv",
                createAt: new Date(),     
            } },
        });
        return res.status(200).json({ success: true, data: response.results });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const getSearchHistory = async (req, res) => {
    try {
        res.status(200).json({ success: true, content: req.user.searchHistory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const deleteSearchHistory = async (req, res) => {
    let { id } = req.params;
    id = parseInt(id);
    try {
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { searchHistory: { id: id } }
        })

        res.status(200).json({ success: true, message: "Search History Deleted" });

    } catch (error) {
        console.log("Error in deleting search history", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

