// src/components/HoverDetailCard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { SMALL_IMG_BASE_URL } from "../utils/constants"; // Assuming you have this
import { Star, Calendar, Clock } from "lucide-react";

// Helper function to format date (can reuse your existing one or simplify)
function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC", // Assuming dates are UTC
    });
}

// Helper function to format runtime
function formatRuntime(runtime) {
    if (!runtime) return null;
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    let formatted = "";
    if (hours > 0) formatted += `${hours}h `;
    if (minutes > 0) formatted += `${minutes}m`;
    return formatted.trim() || null; // Return null if runtime is 0
}




const HoverDetailCard = ({ isVisible, contentType, id, position }) => {
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Store the last fetched ID to prevent re-fetching for the same item if hover flickers
    const [lastFetchedId, setLastFetchedId] = useState(null);
    

    useEffect(() => {
        // Only fetch if the card should be visible AND
        // it's a new ID or details haven't been loaded for the current ID
        if (isVisible && id && contentType && id !== lastFetchedId) {
            setIsLoading(true);
            setError(null);
            setDetails(null); // Clear previous details immediately
            const source = axios.CancelToken.source(); // Create a cancel token

            axios.get(`/api/v1/${contentType}/${id}/details`, { cancelToken: source.token })
                .then(res => {
                    if (res.data && res.data.content) {
                        setDetails(res.data.content);
                        setLastFetchedId(id); // Mark this ID as fetched
                    } else {
                        throw new Error("Invalid data format received");
                    }
                    setIsLoading(false);
                })
                .catch(error => {
                    if (axios.isCancel(error)) {
                        console.log("Request canceled", error.message);
                    } else {
                        setError("Could not load details.");
                        setDetails(null); // Ensure details are null on error
                        setLastFetchedId(null); // Allow refetch attempt if hover again
                    }
                    setIsLoading(false);
                });

            // Cleanup function to cancel request if component unmounts or dependencies change
            return () => {
                source.cancel("Fetching canceled due to component update or unmount.");
                // Optionally reset state when effect cleans up / dependencies change
                 // setIsLoading(false); // Avoid state update on unmounted component
            };
        }

        // If isVisible becomes false, reset the last fetched ID so it fetches again next time
        if (!isVisible) {
             setLastFetchedId(null);
             // Optionally clear details immediately when hiding
             // setDetails(null);
        }

    }, [isVisible, contentType, id, lastFetchedId]); // Include lastFetchedId in dependency array


    // Render nothing if not visible
    if (!isVisible) {
        return null;
    }

    // Basic positioning - adjust as needed based on how you calculate 'position'
    const style = {
    position: 'fixed',
    top: position?.y || 0,
    left: position?.x || 0,
    transform: position?.showBelow 
        ? 'translateY(0)' // Don't translate up if showing below
        : 'translateY(-100%)', // Otherwise show above
    zIndex: 999,
    width: '280px',
    pointerEvents: 'auto',
};

    // Determine title and date based on content type (using optional chaining)
    const title = details?.title || details?.name;

    const date = details?.release_date || details?.first_air_date;
    // Handle runtime (movie) vs episode_run_time (TV, often an array)
    const runtime = formatRuntime(details?.runtime || details?.episode_run_time?.[0]);


    return (
        <div
            style={style}
            // Add transition for smoother appearance
            className="bg-gray-900/95 backdrop-blur-sm text-white rounded-lg shadow-xl overflow-hidden transition-opacity duration-200 ease-in-out animate-fade-in" // Added fade-in animation
        >
            {/* Optional: Small backdrop image */}
            {details?.backdrop_path && (
                <img
                    src={SMALL_IMG_BASE_URL + details.backdrop_path}
                    alt=""
                    className="w-full h-24 object-cover opacity-80"
                />
            )}

            <div className="p-3">
                {isLoading && <p className="text-center text-gray-400 text-sm py-4">Loading...</p>}
                {error && <p className="text-center text-red-500 text-sm py-4">{error}</p>}

                {details && !isLoading && !error && (
                    <>
                        <h3 className="text-base font-bold mb-1 truncate" title={title}>{title || 'No title'}</h3>

                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                                <span>{details.vote_average?.toFixed(1) ?? 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(date) || 'N/A'}</span>
                            </div>
                             {runtime && (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{runtime}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                            {details.genres?.slice(0, 3).map((genre) => (
                                <span key={genre.id} className="bg-gray-700 text-xs px-1.5 py-0.5 rounded">
                                    {genre.name}
                                </span>
                            ))}
                        </div>

                        <p className="text-xs text-gray-300 max-h-16 overflow-hidden leading-snug [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]">
                           {details.overview || 'No overview available.'}
                        </p>

                        {/* Optional: Action Buttons */}
                        {/* <div className="flex space-x-2 mt-3">
                            <button className="bg-red-600 px-2 py-1 rounded text-xs">Play</button>
                            <button className="bg-gray-700 px-2 py-1 rounded text-xs">More Info</button>
                        </div> */}
                    </>
                )}
            </div>
        </div>
    );
};

export default HoverDetailCard;


// Add this to your tailwind.config.js or a global CSS file for the animation:
/*
@layer utilities {
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-100%) translateY(-10px) scale(0.95); }
    to { opacity: 1; transform: translateY(-100%) translateY(-10px) scale(1); }
  }
  .animate-fade-in {
    animation: fade-in 0.2s ease-out forwards;
  }
}
*/