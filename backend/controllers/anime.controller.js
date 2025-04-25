import axios from "axios";

export const getTrendingAnime = async (req, res) => {
    try {
        // Fetch anime data from Kitsu API
        const trendingApiUrl = 'https://kitsu.io/api/edge/anime?page[limit]=10&sort=popularityRank';
        
        const apiResponse = await axios.get(trendingApiUrl, {
            headers: {
                'accept': 'application/vnd.api+json'
            }
        });
        const results = apiResponse.data?.data;

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No trending anime found"
            });
        }

        // Select a random anime from the results
        const randomIndex = Math.floor(Math.random() * results.length);
        const randomAnime = results[randomIndex];

        res.status(200).json({
            success: true,
            content: randomAnime
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



  export const getPopularAnime = async (req, res) => {
      try {
        const url = 'https://kitsu.io/api/edge/anime?page[limit]=10&sort=popularityRank'; // Popular anime query
    
        const response = await axios.get(url, {
          headers: {
            accept: 'application/vnd.api+json'
          }
        });
    
        if (response.status !== 200) {
          throw new Error('Failed to fetch popular anime: ' + response.statusText);
        }
    
        res.status(200).json(response.data);
      } catch (error) {
        console.error('Error fetching popular anime:', error.message);
        res.status(500).json({ error: 'Failed to fetch popular anime' });
      }
    };

    export const getAnimeByCategory = async (req, res) => {
        try {
            const { categoryName } = req.params;
    
            // Adjust the query to match the category based on Kitsu API's parameters.
            let url = '';
            switch (categoryName) {
                case 'popular':
                    // Popular anime sorted by popularity rank ascending (1 is most popular)
                    url = 'https://kitsu.io/api/edge/anime?page[limit]=10&sort=popularityRank';
                    break;
                case 'top_rated':
                    // Top-rated anime sorted by rating rank ascending (1 is highest rated)
                    url = 'https://kitsu.io/api/edge/anime?page[limit]=10&sort=ratingRank';
                    break;
                case 'airing_today':
                    // Currently airing anime
                    url = 'https://kitsu.io/api/edge/anime?page[limit]=10&filter[status]=currently_airing';
                    break;
                case 'new_releases':
                     // New releases sorted by start date descending
                     url = 'https://kitsu.io/api/edge/anime?page[limit]=10&sort=-startDate';
                     break;
                case 'upcoming':
                     // Upcoming anime filtered by status
                     url = 'https://kitsu.io/api/edge/anime?page[limit]=10&filter[status]=upcoming';
                     break;
                case 'trending':
                     // Trending anime sorted by popularity rank (same as popular for Kitsu often)
                     url = 'https://kitsu.io/api/edge/anime?page[limit]=10&sort=popularityRank';
                     break;
                default:
                    // Return 400 for any category name not handled
                    return res.status(400).json({
                        success: false,
                        message: `Invalid category name: ${categoryName}. Supported categories are: popular, top_rated, airing_today, new_releases, upcoming, trending`
                    });
            }
    
            // --- CORRECTED API CALL ---
            // Make the axios call directly with the determined URL
            const apiResponse = await axios.get(url, {
                headers: {
                    'accept': 'application/vnd.api+json' // Kitsu API requires this header
                }
            });
            // --- END CORRECTED API CALL ---
    
            // The data you need is in apiResponse.data.data for Kitsu API
            const results = apiResponse.data?.data;
    
            if (!results || results.length === 0) {
                // Return 404 if the API returned no results for the category
                return res.status(404).json({
                    success: false,
                    message: `No anime found in the "${categoryName}" category`
                });
            }
    
            // Respond with the fetched list of anime for the category
            res.status(200).json({
                success: true,
                content: results // Send the array of anime objects
            });
    
        } catch (error) {
            // Log the error on the server side
            console.error(`Error fetching anime for category ${req.params.categoryName}:`, error);
    
            // Respond with a 500 error for unexpected issues
            res.status(500).json({
                success: false,
                message: error.message || 'An unexpected error occurred while fetching anime.'
            });
        }
    };


    export const getAnimeDetails = async (req, res) => {
        try {
            // Extract the anime ID from the request parameters
            const { id } = req.params;
    
            // Validate if ID is provided
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Anime ID is required."
                });
            }
    
            // Construct the Kitsu API URL for fetching details of a specific anime by ID
            // Kitsu API endpoint for a single anime is /anime/{id}
            const apiUrl = `https://kitsu.io/api/edge/anime/${id}`;
    
            // Make the HTTP GET request to the Kitsu API
            const apiResponse = await axios.get(apiUrl, {
                headers: {
                    'accept': 'application/vnd.api+json' // Kitsu API requires this header
                }
            });
    
            // Kitsu API response for a single item is typically in apiResponse.data.data
            const animeDetails = apiResponse.data?.data;
    
            // Check if details were found
            if (!animeDetails) {
                // If Kitsu API returns no data for the ID, it might still be a 200 but with empty data
                // or a 404. Handle the case where data is null or undefined.
                return res.status(404).json({
                    success: false,
                    message: `Anime with ID ${id} not found.`
                });
            }
    
            // Respond with the fetched anime details
            res.status(200).json({
                success: true,
                content: animeDetails // Send the single anime object
            });
    
        } catch (error) {
            // Log the error on the server side
            console.error(`Error fetching details for anime ID ${req.params.id}:`, error);
    
            // Handle specific Axios errors if needed (e.g., 404 from Kitsu)
            if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
                 return res.status(404).json({
                    success: false,
                    message: `Anime with ID ${req.params.id} not found on Kitsu.`
                });
            }
    
            // Respond with a generic 500 error for other unexpected issues
            res.status(500).json({
                success: false,
                message: error.message || 'An unexpected error occurred while fetching anime details.'
            });
        }
    };


    export const getAnimeTrailers = async (req, res) => {
        try {
            // Extract the anime ID from the request parameters
            const { id } = req.params;
    
            // Validate if ID is provided
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Anime ID is required to fetch trailers."
                });
            }
    
            // --- CORRECTED API CALL FOR TRAILER ---
            // Fetch the main anime details, specifically requesting the youtubeVideoId field.
            // This is often a more reliable way to get the primary trailer ID from Kitsu.
            const apiUrl = `https://kitsu.io/api/edge/anime/${id}?fields[anime]=youtubeVideoId`;
    
            // Make the HTTP GET request to the Kitsu API
            const apiResponse = await axios.get(apiUrl, {
                headers: {
                    'accept': 'application/vnd.api+json' // Kitsu API requires this header
                }
            });
    
            // Kitsu API response for a single item is typically in apiResponse.data.data
            const animeData = apiResponse.data?.data;
    
            // Check if anime data was found
            if (!animeData) {
                // If Kitsu API returns no data for the ID, return 404
                return res.status(404).json({
                    success: false,
                    message: `Anime with ID ${id} not found on Kitsu.`
                });
            }
    
            // Extract the youtubeVideoId from the attributes
            const youtubeVideoId = animeData.attributes?.youtubeVideoId;
    
            let trailers = [];
    
            // If a youtubeVideoId is found, create a trailer object for it
            if (youtubeVideoId) {
                trailers.push({
                    // You can add other properties here if available/needed
                    id: youtubeVideoId, // Using the video ID as the trailer object ID
                    key: youtubeVideoId, // The YouTube video key
                    // Kitsu doesn't provide title/description for this ID directly here,
                    // you might need to fetch from the videos relationship if more details are needed,
                    // but the previous 404 suggests that endpoint is not always reliable.
                    // For now, just providing the key is sufficient for ReactPlayer.
                });
            }
            // --- END CORRECTED API CALL ---
    
    
            // Respond with the fetched trailers (will be an array with 0 or 1 trailer in this approach)
            res.status(200).json({
                success: true,
                trailers: trailers // Send the array of trailer objects (0 or 1)
            });
    
        } catch (error) {
            // Log the error on the server side
            console.error(`Error fetching trailers for anime ID ${req.params.id}:`, error);
    
            // Handle specific Axios errors (e.g., 404 from Kitsu API for the base anime ID)
            if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
                 return res.status(404).json({
                    success: false,
                    message: `Anime with ID ${req.params.id} not found on Kitsu.`
                });
            }
    
            // Respond with a generic 500 Internal Server Error for other unexpected issues
            res.status(500).json({
                success: false,
                message: error.message || 'An unexpected error occurred while fetching anime trailers.'
            });
        }
    };

    export const getSimilarAnime = async (req, res) => {
        try {
            // Extract the anime ID from the request parameters
            const { id } = req.params;
    
            // Validate if ID is provided
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Anime ID is required."
                });
            }
    
            
            const apiUrl = `https://kitsu.io/api/edge/anime/${id}/media-relationships?include=destination`;
    
            // Make the HTTP GET request to the Kitsu API
            const apiResponse = await axios.get(apiUrl, {
                headers: {
                    'accept': 'application/vnd.api+json' // Kitsu API requires this header
                }
            });
    
            // Kitsu API response for relationships with include will have:
            // - 'data': an array of relationship objects
            // - 'included': an array of the included resources (the destination anime in this case)
            const relationships = apiResponse.data?.data || [];
            const includedResources = apiResponse.data?.included || [];
    
            // Filter relationships to find 'similar' or 'recommendation' types if Kitsu provides them.
            // Kitsu relationships have a 'role' attribute (e.g., 'sequel', 'prequel', 'alternative').
            // There isn't a direct 'similar' or 'recommended' role usually.
            // A common approach is to look for relationships where the 'destination' is another anime
            // and perhaps filter by 'role' or just return all related anime.
            // For 'similar', we might just return all related anime that are of type 'anime'.
    
            // Extract the destination anime objects from the 'included' array
            const similarAnime = includedResources.filter(resource =>
                resource.type === 'anime' // Ensure the included resource is an anime
                // You could add further filtering here based on relationship 'role' if needed,
                // by checking the 'relationships' array and matching destination IDs.
            );
    
    
            // Respond with the fetched list of similar anime
            res.status(200).json({
                success: true,
                similar: similarAnime // Send the array of similar anime objects
            });
    
        } catch (error) {
            // Log the error on the server side
            console.error(`Error fetching similar anime for ID ${req.params.id}:`, error);
    
            // Handle specific Axios errors if needed (e.g., 404 from Kitsu)
            if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
                 return res.status(404).json({
                    success: false,
                    message: `Anime with ID ${req.params.id} not found on Kitsu.`
                });
            }
    
            // Respond with a generic 500 error for other unexpected issues
            res.status(500).json({
                success: false,
                message: error.message || 'An unexpected error occurred while fetching similar anime.'
            });
        }
    };

    
    export const getAnimeDetail = async (req, res) => { // It receives req and res objects
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
            // Use the extracted query parameter
            const apiUrl = `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}`;
    
            // Make the HTTP GET request to the Kitsu API
            const apiResponse = await axios.get(apiUrl, {
                headers: {
                    'accept': 'application/vnd.api+json' // Kitsu API requires this header
                }
            });
    
            // Kitsu API response for a list of items is typically in apiResponse.data.data
            const searchResults = apiResponse.data?.data || []; // Ensure it's always an array
    
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
    
    