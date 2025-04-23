import { getMovieDetails } from "../services/tmbd.service.js";

export const getTrendingTv = async (req, res) => {
    try {
            const data = await getMovieDetails('https://api.themoviedb.org/3/tv/popular?language=en-US&page=1');
            const results = data?.results;
    
            if (!results || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No movies found"
                });
            }
    
            const randomIndex = Math.floor(Math.random() * results.length);
            const randomMovie = results[randomIndex];
    
            res.status(200).json({
                success: true,
                content: randomMovie
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
}

export const getTvTrailers = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getMovieDetails(`https://api.themoviedb.org/3/tv/${id}/videos?language=en-US`);
        const results = data?.results;

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No trailers found"
            });
        }

        res.status(200).json({
            success: true,
            trailers: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getTvDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getMovieDetails(`https://api.themoviedb.org/3/tv/${id}?language=en-US`);
        
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "No tv show found"
            });
        }

        res.status(200).json({
            success: true,
            content: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getSimilarTv = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getMovieDetails(`https://api.themoviedb.org/3/tv/${id}/similar?language=en-US&page=1`);
        const results = data?.results;

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No similar tv shows found"
            });
        }

        res.status(200).json({
            success: true,
            content: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getTvByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params;
        const data = await getMovieDetails(`https://api.themoviedb.org/3/tv/${categoryName}?language=en-US&page=1`);
        const results = data?.results;

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No tv shows found"
            });
        }

        res.status(200).json({
            success: true,
            content: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}