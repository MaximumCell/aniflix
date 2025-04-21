import { getMovieDetails } from "../services/tmbd.service.js"


export const getTrendingMovies = async (req, res) => {
    try {
        const data = await getMovieDetails('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1');
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
};

export const getMovieTrailers = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getMovieDetails(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`);
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
};

export const getMoviesDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getMovieDetails(`https://api.themoviedb.org/3/movie/${id}?language=en-US`);
        

        res.status(200).json({
            success: true,
            content: data
        });
    } catch (error) {
        if(error.message.includes("404")) {
            return res.status(404).send(null);
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getSimilarMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getMovieDetails(`https://api.themoviedb.org/3/movie/${id}/similar?language=en-US`);
        const results = data?.results;

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No similar movies found"
            });
        }

        res.status(200).json({
            success: true,
            similar: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getMovieByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const data = await getMovieDetails(`https://api.themoviedb.org/3/movie/${category}?language=en-US`);
        const results = data?.results;

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No movies found in this category"
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