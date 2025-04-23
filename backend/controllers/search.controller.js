import { User } from "../models/user.model.js";
import { getMovieDetails } from "../services/tmbd.service.js";

export const searchPerson = async (req, res) => {
    try {
        const { query } = req.params;
        const response = await getMovieDetails(`https://api.themoviedb.org/3/search/person?query=${query}&include_adult=false&language=en-US&page=1`);

        if (!response || !response.results || response.results.length === 0) {
            // Added more robust check for response structure
            return res.status(404).json({ success: false, message: "No Person Found or API error" });
        }

        // Prepare the history item data
        const historyItem = {
            id: response.results[0].id,
            Image: response.results[0].profile_path,
            title: response.results[0].name,
            searchType: "person",
            createAt: new Date(), // Keep the timestamp for when it was added/last searched
        };

        // --- Modification Start ---
        // Update the user document only if the specific search item doesn't exist
        await User.updateOne(
            {
                _id: req.user._id,
                // Condition: Add only if no element matches both id and searchType
                'searchHistory': {
                    $not: {
                        $elemMatch: { id: historyItem.id, searchType: historyItem.searchType }
                    }
                }
            },
            {
                // Operation: Add the new history item to the array
                $push: { searchHistory: historyItem }
            }
        );
        // --- Modification End ---

        return res.status(200).json({ success: true, data: response.results });
    } catch (error) {
        console.error("Error in searchPerson:", error); // Log specific error
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const searchMovie = async (req, res) => {
    try {
        const { query } = req.params;
        const response = await getMovieDetails(`https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`);

        if (!response || !response.results || response.results.length === 0) {
            return res.status(404).json({ success: false, message: "No Movie Found or API error" });
        }

        const historyItem = {
            id: response.results[0].id,
            Image: response.results[0].poster_path,
            title: response.results[0].title,
            searchType: "movie",
            createAt: new Date(),
        };

        // --- Modification Start ---
        await User.updateOne(
            {
                _id: req.user._id,
                'searchHistory': {
                    $not: {
                        $elemMatch: { id: historyItem.id, searchType: historyItem.searchType }
                    }
                }
            },
            {
                $push: { searchHistory: historyItem }
            }
        );
        // --- Modification End ---

        return res.status(200).json({ success: true, data: response.results });
    } catch (error) {
        console.error("Error in searchMovie:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const searchTV = async (req, res) => {
    try {
        const { query } = req.params;
        const response = await getMovieDetails(`https://api.themoviedb.org/3/search/tv?query=${query}&include_adult=false&language=en-US&page=1`);

        if (!response || !response.results || response.results.length === 0) {
            return res.status(404).json({ success: false, message: "No TV Show Found or API error" });
        }

        const historyItem = {
            id: response.results[0].id,
            Image: response.results[0].poster_path,
            title: response.results[0].name,
            searchType: "tv",
            createAt: new Date(),
        };

        // --- Modification Start ---
        await User.updateOne(
            {
                _id: req.user._id,
                'searchHistory': {
                    $not: {
                        $elemMatch: { id: historyItem.id, searchType: historyItem.searchType }
                    }
                }
            },
            {
                $push: { searchHistory: historyItem }
            }
        );
        // --- Modification End ---

        return res.status(200).json({ success: true, data: response.results });
    } catch (error) {
        console.error("Error in searchTV:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// getSearchHistory and deleteSearchHistory remain the same
export const getSearchHistory = async (req, res) => {
    try {
        // Ensure req.user and searchHistory exist before accessing
        const searchHistory = req.user?.searchHistory || [];
        res.status(200).json({ success: true, content: searchHistory });
    } catch (error) {
        console.error("Error in getSearchHistory:", error); // Log specific error
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const deleteSearchHistory = async (req, res) => {
    let { id } = req.params;
    // Validate and parse the id
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    try {
        const result = await User.findByIdAndUpdate(req.user._id, {
            // Use the parsed integer ID
            $pull: { searchHistory: { id: parsedId } }
        }, { new: true }); // {new: true} is optional, returns the updated doc if needed

        if (!result) {
            // Optional: Check if user was found
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Consider checking result.modifiedCount if using updateOne/updateMany
        // findByIdAndUpdate doesn't directly return modifiedCount in the doc

        res.status(200).json({ success: true, message: "Search History item deleted (if it existed)" });

    } catch (error) {
        console.log("Error in deleting search history", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }}