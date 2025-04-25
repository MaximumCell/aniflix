import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// Import constants if needed for fallback images or base URLs,
// but Kitsu API usually provides full image URLs in the response.
// import { ANIME_IMG_BASE_URL, ANIME_IMAGE_SIZES } from "../utils/constants";
import { Star, Calendar, Clock, Film } from "lucide-react"; // Added Film icon for episode count

// Helper function to format date (can reuse or adapt)
function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    // Kitsu dates are often just YYYY-MM-DD, parsing might be simple
    // Ensure correct timezone handling if necessary, but for display, local is often fine
    try {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            // timeZone: "UTC", // Kitsu dates might not have time info, UTC might not be needed
        });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return "Invalid Date";
    }
}

// Helper function for runtime/episode count display
function formatEpisodeInfo(episodeCount, episodeLength) {
    let info = [];
    if (episodeCount) {
        info.push(`${episodeCount} episodes`);
    }
    if (episodeLength) {
        info.push(`${episodeLength} min/ep`);
    }
    return info.join(' | ') || 'N/A';
}


// This component is specifically for Anime details on hover
// It expects 'id' and 'position' props, and implicitly handles 'anime' content type.
const AnimeHoverCard = ({ isVisible, id, position }) => {
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Store the last fetched ID to prevent re-fetching for the same item if hover flickers
    const [lastFetchedId, setLastFetchedId] = useState(null);

    // Ref for the card element itself to potentially adjust position based on size
    const cardRef = useRef(null);

    useEffect(() => {
        // Only fetch if the card should be visible AND
        // it's a new ID or details haven't been loaded for the current ID
        if (isVisible && id && id !== lastFetchedId) {
            setIsLoading(true);
            setError(null);
            setDetails(null); // Clear previous details immediately
            const source = axios.CancelToken.source(); // Create a cancel token

            // --- API call specifically for Anime details ---
            // Assuming your backend has an endpoint like /api/v1/anime/:id/details
            axios.get(`/api/v1/anime/${id}/details`, { cancelToken: source.token })
                .then(res => {
                    // Kitsu API details are expected in res.data.content
                    if (res.data && res.data.content) {
                        setDetails(res.data.content);
                        setLastFetchedId(id); // Mark this ID as fetched
                    } else {
                        // Handle cases where success is true but content is missing/empty
                         setError("Anime details not found.");
                         setDetails(null);
                         setLastFetchedId(null); // Allow refetch
                    }
                    setIsLoading(false);
                })
                .catch(error => {
                    if (axios.isCancel(error)) {
                        console.log("Anime details fetch canceled", error.message);
                    } else {
                        console.error("Error fetching anime details:", error);
                        setError("Could not load anime details.");
                        setDetails(null); // Ensure details are null on error
                        setLastFetchedId(null); // Allow refetch attempt if hover again
                    }
                    setIsLoading(false);
                });

            // Cleanup function to cancel request if component unmounts or dependencies change
            return () => {
                source.cancel("Fetching canceled due to component update or unmount.");
                // No need to reset state here as it will be handled by the next render cycle
            };
        }

        // If isVisible becomes false, reset the last fetched ID so it fetches again next time
        // Also clear details immediately for a cleaner hide/show transition
        if (!isVisible) {
            setLastFetchedId(null);
            setDetails(null);
        }

    }, [isVisible, id, lastFetchedId]); // Include lastFetchedId in dependency array


    // Render nothing if not visible
    if (!isVisible) {
        return null;
    }

    // Basic positioning - adjust as needed based on how you calculate 'position'
    // You might need to adjust 'top' based on the card's own height if it varies
    const style = {
        position: 'absolute', // Use fixed to position relative to viewport
        top: (position?.y || 0), // Y position from the top of the viewport
        left: (position?.x || 0), // X position from the left of the viewport
        zIndex: 9999, // Ensure it's above other content
        width: '280px', // Fixed width for the card
        pointerEvents: 'none', // Prevent card from interfering with mouse events below it
        // Add transform to position it relative to the hover source (adjust translateY based on your layout)
        // Example: if the card should appear below the hovered item, translateY might be 0 or positive.
        // If it appears above, translateY might be negative.
         transform: 'translateY(0px)', // Adjust this based on desired vertical alignment relative to 'top'
         // You might also need to adjust left/right based on card width to center or align it
         // transform: `translate(-50%, 0)`, // Example to center horizontally above/below
    };

    // --- Accessing Anime specific details from 'details.attributes' ---
    // Use optional chaining extensively
    const animeAttributes = details?.attributes;

    const title = animeAttributes?.canonicalTitle || 'Untitled Anime';
    const averageRating = animeAttributes?.averageRating ? parseFloat(animeAttributes.averageRating).toFixed(1) : 'N/A';
    const startDate = formatDate(animeAttributes?.startDate);
    const endDate = formatDate(animeAttributes?.endDate);
    const synopsis = animeAttributes?.synopsis || 'No synopsis available.';
    const episodeCount = animeAttributes?.episodeCount;
    const episodeLength = animeAttributes?.episodeLength;
    const episodeInfo = formatEpisodeInfo(episodeCount, episodeLength);

    // Kitsu genres are under attributes.genres (relationship), might need to fetch separately or include in details endpoint
    // For simplicity here, we'll assume genres are included directly in the details response if possible.
    // If not, you'd need another fetch or adjust your backend endpoint.
    // Assuming genres are like [{ name: "Action" }, ...] under details.attributes.genres
    const genres = animeAttributes?.genres?.data || animeAttributes?.genres || []; // Adjust based on actual Kitsu relationship structure


    // Get image URL - Kitsu provides different sizes under posterImage or coverImage
    // Choose the size appropriate for the hover card (e.g., small)
    const imageUrl = animeAttributes?.posterImage?.small || animeAttributes?.posterImage?.tiny;


    return (
        <div
            ref={cardRef} // Attach ref to the card element
            style={style}
            // Add transition for smoother appearance
            className="bg-gray-900/95 backdrop-blur-sm text-white rounded-lg shadow-xl overflow-hidden transition-opacity duration-200 ease-in-out animate-fade-in" // Added fade-in animation
        >
            {/* Optional: Small poster or cover image */}
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={`${title} Poster`}
                    className="w-full h-40 object-cover opacity-80" // Adjust height as needed
                    onError={(e) => {
                        console.error("Error loading anime hover image:", e);
                        // Provide a fallback image on error
                        e.target.src = 'https://placehold.co/280x160?text=No+Image'; // Placeholder matching card width
                    }}
                />
            )}

            <div className="p-3">
                {isLoading && <p className="text-center text-gray-400 text-sm py-4">Loading...</p>}
                {error && <p className="text-center text-red-500 text-sm py-4">{error}</p>}

                {details && !isLoading && !error && (
                    <>
                        {/* Display title */}
                        <h3 className="text-base font-bold mb-1 truncate" title={title}>{title}</h3>

                        {/* Display Rating, Dates, Episode Info */}
                        <div className="flex flex-wrap items-center text-xs text-gray-400 mb-2 gap-x-3 gap-y-1">
                            {/* Average Rating */}
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                                <span>{averageRating}</span>
                            </div>
                             {/* Start/End Dates */}
                            {(startDate !== 'N/A' || endDate !== 'N/A') && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{startDate}{startDate !== 'N/A' && endDate !== 'N/A' && ' - '}{endDate !== 'N/A' && startDate === 'N/A' && 'Ends '}{endDate !== 'N/A' && startDate !== 'N/A' && endDate}{startDate === 'N/A' && endDate === 'N/A' && 'N/A'}</span>
                                </div>
                            )}
                             {/* Episode Info */}
                            {episodeInfo !== 'N/A' && (
                                <div className="flex items-center gap-1">
                                    <Film className="w-3 h-3" /> {/* Using Film icon for episode count */}
                                    <span>{episodeInfo}</span>
                                </div>
                            )}
                        </div>

                        {/* Display Genres (assuming genres are available in details.attributes.genres) */}
                        {genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                                {genres.slice(0, 3).map((genre, index) => ( // Limit to first 3 genres
                                    // Kitsu genre structure might be different, adjust key and name access
                                    <span key={genre.id || index} className="bg-gray-700 text-xs px-1.5 py-0.5 rounded">
                                        {genre.attributes?.name || genre.name || 'Genre'} {/* Access name based on structure */}
                                    </span>
                                ))}
                            </div>
                        )}


                        {/* Display Synopsis */}
                        <p className="text-xs text-gray-300 max-h-16 overflow-hidden leading-snug [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]">
                           {synopsis}
                        </p>

                        {/* Optional: Action Buttons (Link to watch page) */}
                        {/* You might want to add buttons here linking to the watch page */}
                        {/* <div className="flex space-x-2 mt-3">
                             {details?.id && (
                                <Link to={`/watch/${details.id}`} className="bg-red-600 px-2 py-1 rounded text-xs">Watch</Link>
                             )}
                             <button className="bg-gray-700 px-2 py-1 rounded text-xs">More Info</button>
                        </div> */}
                    </>
                )}
            </div>
        </div>
    );
};

export default AnimeHoverCard;
