import axios from "axios";
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

    export const searchAnime = async (req, res) => {
        try {
            // Extract the search query from the URL parameters
            const { query } = req.params;
    
            // Validate if a search query is provided
            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: "Search query is required."
                });
            }
    
            // Construct the Kitsu API URL for text search
            const apiUrl = `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}`;
    
            // Make the HTTP GET request to the Kitsu API
            const apiResponse = await axios.get(apiUrl, {
                headers: {
                    'accept': 'application/vnd.api+json' // Kitsu API requires this header
                }
            });
    
            // Kitsu API response for a list of items is typically in apiResponse.data.data
            const searchResults = apiResponse.data?.data || []; // Ensure it's always an array
    
            // Check if any results were found
            if (!searchResults || searchResults.length === 0) {
                 return res.status(404).json({
                    success: false,
                    message: `No anime found for query "${query}".`
                });
            }
    
            // --- Save to User Search History ---
            // We'll save the first result to history, similar to your TMDB controllers
            const firstResult = searchResults[0];
    
            // Prepare the history item data from the Kitsu anime object
            const historyItem = {
                // Kitsu ID is a string, ensure your schema handles this or convert if necessary
                id: firstResult.id,
                // Use a small poster image URL from Kitsu attributes
                Image: firstResult.attributes?.posterImage?.small || firstResult.attributes?.posterImage?.tiny || null,
                // Use canonicalTitle for the title
                title: firstResult.attributes?.canonicalTitle || 'Untitled Anime',
                searchType: "anime", // Mark this as an anime search
                createAt: new Date(), // Timestamp
            };
    
            // Ensure req.user exists (assuming your middleware provides req.user)
            if (req.user?._id) {
                 // Update the user document: add the new history item only if it doesn't already exist
                 await User.updateOne(
                     {
                         _id: req.user._id,
                         // Condition: Add only if no element in searchHistory matches both id and searchType
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
                 // Note: This only adds if not exists. If you want to update the timestamp
                 // for existing items, the update logic would be more complex (e.g., $pull then $push).
            } else {
                console.warn("searchAnime: req.user is not available. Cannot save search history.");
                // You might choose to return an error or just proceed without saving history
            }
            // --- End Save to History ---
    
    
            // Respond with the search results
            res.status(200).json({
                success: true,
                content: searchResults // Send the array of anime results
            });
    
        } catch (error) {
            // Log the error on the server side
            console.error(`Error searching anime for query "${req.params.query}":`, error);
    
            // Handle specific Axios errors (e.g., network issues, Kitsu API errors)
            // You might want more specific error handling here based on Kitsu's responses
    
            // Respond with a generic 500 Internal Server Error for unexpected issues
            res.status(500).json({
                success: false,
                message: error.message || 'An unexpected error occurred while searching for anime.'
            });
        }
    };