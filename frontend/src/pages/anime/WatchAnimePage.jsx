import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactPlayer from "react-player"; // Assuming you have anime trailers as YouTube/Vimeo links
import { useContentStore } from "../../store/content.js"; // Still needed to potentially set content type or use other store features
import axios from "axios";
import Navbar from "../../components/Navbar";
import {
  ChevronLeft,
  ChevronRight,
  Star, // Import Star icon
  Calendar, // Import Calendar icon
  Clock, // Import Clock icon (if used for episode length)
  Film // Import Film icon (if used for episode count)
} from "lucide-react"; // Import necessary icons
import {
  // Import Kitsu specific constants if needed for fallbacks
  // ANIME_IMG_BASE_URL,
  // ANIME_IMAGE_SIZES,
  // TMDB constants might not be needed here
  // ORIGINAL_IMG_BASE_URL,
  // SMALL_IMG_BASE_URL
} from "../../utils/constants";
// Import the Anime specific components
import AnimeSlider from "../../components/AnimeSlider.jsx"; // For similar anime slider
import AnimeHoverCard from "../../components/AnimeHoverCard.jsx"; // For hover details on similar anime
import WatchPageSkeleton from "../../components/skeletons/WatchPageSkeleton.jsx"; // Assuming you have a skeleton component

// Helper function to format Kitsu dates (can reuse or adapt)
function formatAnimeDate(dateString) {
    if (!dateString) return "N/A";
    try {
        // Kitsu dates are often justYYYY-MM-DD
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch (e) {
        console.error("Error formatting anime date:", dateString, e);
        return "Invalid Date";
    }
}

// Helper function to format anime episode info
function formatAnimeEpisodeInfo(episodeCount, episodeLength) {
    let info = [];
    if (episodeCount) {
        info.push(`${episodeCount} episodes`);
    }
    if (episodeLength) {
        info.push(`${episodeLength} min/ep`);
    }
    return info.join(' | ') || 'N/A';
}


const WatchAnimePage = () => {
  // Get the anime ID from the URL parameters
  const { id } = useParams();
  // Get the setter function from the store
  const { setContentType } = useContentStore();

  const [trailers, setTrailers] = useState([]); // Assuming an anime trailer endpoint exists
  const [currentTrailerIdx, setCurrentTrailerIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState(null); // Use null as initial state for content
  const [similarContent, setSimilarContent] = useState([]);

  const sliderRef = useRef(null); // Ref for the similar anime slider

  // --- State for Hover Card ---
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [isCardVisible, setIsCardVisible] = useState(false);
  const hoverTimeoutRef = useRef(null);

  // --- Set Content Type to 'anime' on Mount ---
  // This ensures the contentType is always correct for this page
  useEffect(() => {
      setContentType('anime');
      // No cleanup needed for this simple state setting
  }, [setContentType]); // Dependency on setContentType (stable function)


  // --- Fetch Anime Details ---
  useEffect(() => {
    const getAnimeDetails = async () => {
      setIsLoading(true); // Start loading for details
      setContent(null); // Clear previous content
      try {
        // Call the backend endpoint for anime details by ID
        // The contentType is now guaranteed to be 'anime' by the effect above
        const res = await axios.get(`/api/v1/anime/${id}/details`);
        if (res.data?.success && res.data?.content) {
             setContent(res.data.content);
        } else {
             // Handle cases where backend reports success but no content
             console.error("Backend reported success but no anime content found:", res.data);
             setContent(null); // Ensure content is null
             // Optionally set an error state here if this is an unexpected scenario
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching anime details:", error.response?.data || error.message);
        setIsLoading(false);
        setContent(null); // Ensure content is null on error
        // Optionally set a more persistent error state to display an error message
      }
    };
    // Fetch details whenever the ID changes
    // This effect will also re-run if contentType changes, but the effect above
    // will immediately set it back to 'anime', so it effectively runs when ID changes.
    if (id) {
        getAnimeDetails();
    }
  }, [id]); // Dependency on ID

  // --- Fetch Anime Trailers (Assuming Backend Endpoint) ---
  useEffect(() => {
    const getAnimeTrailers = async () => {
      // No loading state change here, as main loading is for details
      try {
        // Assuming a backend endpoint like /api/v1/anime/:id/trailers
        // The contentType is now guaranteed to be 'anime'
        const res = await axios.get(`/api/v1/anime/${id}/trailers`);
        // Assuming the response structure is { success: true, trailers: [...] }
        if (res.data?.success && Array.isArray(res.data?.trailers)) {
             setTrailers(res.data.trailers);
             // Reset trailer index when new trailers are loaded
             setCurrentTrailerIdx(0);
        } else {
             console.log("No anime trailers found or invalid format:", res.data);
             setTrailers([]); // Ensure trailers is an empty array if not found or invalid
        }
      } catch (error) {
        console.error("Error fetching anime trailers:", error.response?.data || error.message);
        setTrailers([]); // Ensure trailers is an empty array on error
      }
    };
    // Fetch trailers whenever the ID changes
     if (id) {
        getAnimeTrailers();
     }
  }, [id]); // Dependency on ID

  // --- Fetch Similar Anime (Assuming Backend Endpoint) ---
  useEffect(() => {
    const getSimilarAnime = async () => {
      // No loading state change here, as main loading is for details
      try {
        // Assuming a backend endpoint like /api/v1/anime/:id/similar
        // The contentType is now guaranteed to be 'anime'
        const res = await axios.get(`/api/v1/anime/${id}/similar`);
         // Assuming the response structure is { success: true, similar: [...] }
        if (res.data?.success && Array.isArray(res.data?.similar)) {
             setSimilarContent(res.data.similar);
        } else {
             console.log("No similar anime found or invalid format:", res.data);
             setSimilarContent([]); // Ensure similarContent is an empty array
        }
      } catch (error) {
        console.error("Error fetching similar anime:", error.response?.data || error.message);
        setSimilarContent([]); // Ensure similarContent is an empty array on error
      }
    };
    // Fetch similar content whenever the ID changes
     if (id) {
        getSimilarAnime();
     }
  }, [id]); // Dependency on ID

  // --- Trailer Navigation Handlers ---
  const handleNextTrailer = () => {
    setCurrentTrailerIdx((prevIdx) => (prevIdx < trailers.length - 1 ? prevIdx + 1 : prevIdx));
  };

  const handlePrevTrailer = () => {
    setCurrentTrailerIdx((prevIdx) => (prevIdx > 0 ? prevIdx - 1 : prevIdx));
  };

  // --- Similar Content Slider Scroll Handlers ---
  const scrollLeftSimilar = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };
  const scrollRightSimilar = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };


  // --- Hover Card Logic ---
  // This logic is similar to MovieSlider, but uses AnimeHoverDetailCard
  const handleMouseEnter = (e, item) => {
      clearTimeout(hoverTimeoutRef.current);

      const rect = e.currentTarget.getBoundingClientRect();

      // --- CORRECTED POSITION CALCULATION ---
      // Calculate position for the hover card relative to the hovered element
      const initialX = rect.left;
      const initialY = rect.top + 1000; // Position slightly below the element + 10px margin

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const cardWidth = 280; // Width of the AnimeHoverDetailCard (matches the component's width style)
      const estimatedCardHeight = 250; // Estimate height (adjust based on your card's content)

      let adjustedX = initialX;
      let adjustedY = initialY;

      // Adjust x-position to keep card within viewport horizontally
      if (initialX + cardWidth > viewportWidth) {
          adjustedX = viewportWidth - cardWidth - 10; // 10px margin from right edge
      }
      if (initialX < 0) {
          adjustedX = 10; // 10px margin from left edge
      }

      // Adjust y-position if card overflows bottom edge of the *visible viewport*
      


      setCardPosition({
          x: adjustedX,
          y: adjustedY,
      });

      // Ensure item.id exists before setting hoveredItemId
      if (item?.id) {
          setHoveredItemId(item.id);
          setIsCardVisible(true);
      }
  };
  // --- END CORRECTED POSITION CALCULATION ---


  const handleMouseLeave = () => {
      // Set a delay before hiding the card
      hoverTimeoutRef.current = setTimeout(() => {
          setIsCardVisible(false);
          // Optionally reset hoveredItemId after hide animation finishes if needed
          // setHoveredItemId(null); // Keep the ID for potential re-hover if the card stays visible briefly
      }, 2000); // 200ms delay - adjust as needed for smoother feel
  };

  // Effect to hide hover card on scroll
  useEffect(() => {
      const hideOnScroll = () => {
        clearTimeout(hoverTimeoutRef.current);
        setIsCardVisible(false);
        setHoveredItemId(null); // Reset hovered item when scrolling
      };

      // Use passive: true for better scroll performance
      window.addEventListener("scroll", hideOnScroll, { passive: true });
      return () => window.removeEventListener("scroll", hideOnScroll);
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount


  // --- Conditional Rendering for Loading/Not Found ---

  // Show skeleton while loading
  if (isLoading) {
    return (
        <div className='min-h-screen bg-black p-10'>
            <WatchPageSkeleton />
        </div>
    );
  }

  // Show not found message if not loading and content is null/undefined
  if (!content) {
    return (
      <div className="bg-black text-white h-screen">
        <div className="max-w-6xl mx-auto">
          <Navbar />
          <div className="text-center mx-auto px-4 py-8 h-full mt-40">
            <h2 className="text-2xl sm:text-5xl font-bold text-balance">
              Anime with ID {id} not found 😥
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // --- Accessing Anime specific details from 'content.attributes' ---
  // Use optional chaining extensively as content might be present but attributes missing (though unlikely for a valid anime)
  const animeAttributes = content?.attributes;

  const title = animeAttributes?.canonicalTitle || 'Untitled Anime';
  const startDate = formatAnimeDate(animeAttributes?.startDate);
  const endDate = formatAnimeDate(animeAttributes?.endDate);
  const synopsis = animeAttributes?.synopsis || 'No synopsis available.';
  const ageRating = animeAttributes?.ageRating || 'NR'; // Kitsu has ageRating directly
  const averageRating = animeAttributes?.averageRating ? parseFloat(animeAttributes.averageRating).toFixed(1) : 'N/A';
  const episodeCount = animeAttributes?.episodeCount;
  const episodeLength = animeAttributes?.episodeLength;
  const episodeInfo = formatAnimeEpisodeInfo(episodeCount, episodeLength);

  // Kitsu genres are under attributes.genres (relationship), might need to fetch separately or include in details endpoint
  // Assuming genres are included directly in the details response like [{ name: "Action" }, ...] under content.attributes.genres
  const genres = animeAttributes?.genres?.data || animeAttributes?.genres || []; // Adjust based on actual Kitsu relationship structure

  // Get poster image URL - Kitsu provides different sizes under posterImage or coverImage
  // Choose the size appropriate for the main details view (e.g., original or large)
  const posterImageUrl = animeAttributes?.posterImage?.original || animeAttributes?.posterImage?.large;


  // --- Render the Anime Watch Page ---

  return (
    <div className="bg-black min-h-screen text-white">

      <div className="mx-auto container px-4 py-8 h-full">
        <Navbar />

        {/* Trailer Section */}
        {/* Only show trailer player and navigation if trailers are available */}
        {trailers.length > 0 && (
            <>
                <div className="flex justify-between items-center mb-4">
                    <button
                      className={`bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded ${
                        currentTrailerIdx === 0 ? "opacity-50 cursor-not-allowed " : ""
                      }}
                      `}
                      disabled={currentTrailerIdx === 0}
                      onClick={handlePrevTrailer} // Use anime specific handler name
                      aria-label="Previous Trailer"
                    >
                      <ChevronLeft size={24} />
                    </button>

                    <button
                      className={`bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded ${
                        currentTrailerIdx === trailers.length - 1
                          ? "opacity-50 cursor-not-allowed "
                          : ""
                      }}
                      `}
                      disabled={currentTrailerIdx === trailers.length - 1}
                      onClick={handleNextTrailer} // Use anime specific handler name
                      aria-label="Next Trailer"
                    >
                      <ChevronRight size={24} />
                    </button>
                </div>

                <div className="aspect-video mb-8 p-2 sm:px-10 md:px-32">
                  {trailers[currentTrailerIdx]?.key ? ( // Check if key exists for the current trailer
                    <ReactPlayer
                      controls={true}
                      width={"100%"}
                      height={"70vh"}
                      className="mx-auto overflow-hidden rounded-lg"
                      // Ensure the URL is correctly formatted for YouTube based on the key
                      url={`https://www.youtube.com/watch?v=${trailers[currentTrailerIdx].key}`} // Correct YouTube URL format
                    />
                  ) : (
                     // Show message if the current trailer key is missing (shouldn't happen with backend fix, but for safety)
                     <div className="w-full h-[70vh] bg-gray-800 rounded-lg flex items-center justify-center">
                         <h2 className="text-xl text-center">
                            Trailer not available for {title} 😥
                         </h2>
                     </div>
                  )}
                </div>
            </>
        )}

        {/* Show message if no trailers were found at all */}
        {!isLoading && trailers.length === 0 && (
             <div className="w-full h-[70vh] bg-gray-800 rounded-lg flex items-center justify-center mb-8"> {/* Added mb-8 for spacing */}
                 <h2 className="text-xl text-center">
                    No trailers available for{" "}
                    <span className="font-bold text-red-600">{title}</span> 😥
                 </h2>
             </div>
        )}


        {/* Anime details */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-10
          max-w-6xl mx-auto" // Adjusted gap
        >
          {/* Text details section */}
          <div className="mb-4 md:mb-0 md:flex-1"> {/* Added flex-1 to allow text to take space */}
            <h2 className="text-4xl md:text-5xl font-bold text-balance mb-4"> {/* Adjusted text size */}
              {title}
            </h2>

            {/* Metadata: Dates, Rating, Episode Info */}
            <div className="flex flex-wrap items-center text-lg text-gray-400 mb-4 gap-x-4 gap-y-2">
                 {/* Dates */}
                 {(startDate !== 'N/A' || endDate !== 'N/A') && (
                    <div className="flex items-center gap-1">
                         <Calendar className="w-5 h-5" />
                         <span>{startDate}{startDate !== 'N/A' && endDate !== 'N/A' && ' - '}{endDate !== 'N/A' && startDate === 'N/A' && 'Ends '}{endDate !== 'N/A' && startDate !== 'N/A' && endDate}{startDate === 'N/A' && endDate === 'N/A' && 'N/A'}</span>
                    </div>
                 )}
                 {/* Age Rating */}
                 {ageRating !== 'NR' && (
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${ageRating === 'R' ? 'bg-red-600' : 'bg-green-600'}`}>
                        {ageRating}
                    </span>
                 )}
                 {/* Average Rating */}
                 {averageRating !== 'N/A' && (
                    <div className="flex items-center gap-1">
                         <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                         <span>{averageRating}</span>
                    </div>
                 )}
                 {/* Episode Info */}
                 {episodeInfo !== 'N/A' && (
                    <div className="flex items-center gap-1">
                         <Film className="w-5 h-5" /> {/* Using Film icon */}
                         <span>{episodeInfo}</span>
                    </div>
                 )}
            </div>

             {/* Genres */}
             {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {genres.map((genre, index) => (
                        // Kitsu genre structure might be different, adjust key and name access
                        <span key={genre.id || index} className="bg-gray-700 text-sm px-2 py-1 rounded">
                            {genre.attributes?.name || genre.name || 'Genre'} {/* Access name based on structure */}
                        </span>
                    ))}
                </div>
             )}


<p className="mt-4 text-lg text-gray-300">
              {synopsis.split(" ").length > 50 // Check word count (adjust 50 as needed)
                ? synopsis.split(" ").slice(0, 50).join(" ") + "..." // Truncate and add ellipsis
                : synopsis}
            </p>
          </div>

          {/* Poster Image */}
          {posterImageUrl ? (
              <img
                src={posterImageUrl}
                alt={`${title} Poster`}
                className="max-h-[500px] rounded-md object-cover md:max-w-xs" // Adjusted max-height and added max-w-xs for better layout
                onError={(e) => {
                   console.error("Error loading anime poster image:", e);
                   // Provide a fallback image on error
                   e.target.src = 'https://placehold.co/300x500?text=No+Image'; // Placeholder matching common poster size
                }}
              />
          ) : (
               // Fallback div if no poster image URL is available
               <div className="max-h-[500px] rounded-md object-cover md:max-w-xs bg-gray-800 flex items-center justify-center text-center p-4">
                    No Poster Available
               </div>
          )}
        </div>

        {/* Similar Anime Slider */}
        {similarContent?.length > 0 && (
          <div className="mt-12 max-w-6xl mx-auto relative"> {/* Adjusted max-width */}
            <h3 className="text-3xl font-bold mb-4">Similar Anime</h3>

            {/* Use the AnimeSlider component here */}
            {/* Pass the similarContent array directly to AnimeSlider if it's designed to take content prop */}
            {/* OR, if AnimeSlider fetches its own data, ensure it's passed the correct category (e.g., 'similar') */}
            {/* For now, let's adapt the rendering loop from MovieSlider for similar content */}
            <div
              className="flex overflow-x-scroll scrollbar-hide gap-4 pb-4 group"
              ref={sliderRef} // Use the ref for scrolling
            >
              {similarContent.map((item) => {
                 // Access anime properties using optional chaining
                 const itemTitle = item?.attributes?.canonicalTitle || 'Untitled Anime';
                 const itemImageUrl = item?.attributes?.posterImage?.small || item?.attributes?.posterImage?.tiny; // Use a smaller size for slider items

                // Only render the link if we have a valid item ID and an image URL
                return (
                  item?.id && itemImageUrl && (
                    <Link
                      key={item.id}
                      // Link to the WatchAnimePage for the similar anime ID
                      to={`/watch/anime/${item.id}`}
                      className="w-40 flex-none" // Adjusted width for slider items
                      onMouseEnter={(e) => handleMouseEnter(e, item)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <img
                        src={itemImageUrl}
                        alt={`${itemTitle} Poster`}
                        className="w-full h-auto rounded-md object-cover" // Ensure object-cover
                         onError={(e) => {
                           console.error("Error loading similar anime image:", e);
                           e.target.src = 'https://placehold.co/160x240?text=No+Image'; // Placeholder
                         }}
                      />
                      {/* Optional: Display title below the image */}
                      {/* <h4 className="mt-2 text-sm font-semibold truncate">{itemTitle}</h4> */}
                    </Link>
                  )
                );
              })}

              {/* Slider Navigation Arrows */}
              {/* Only show arrows if there's enough content to scroll */}
              {similarContent.length > 5 && ( // Adjust threshold based on how many items fit initially
                <>
                  <ChevronRight
                    className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer bg-red-600 text-white rounded-full z-10" // Added z-10
                    onClick={scrollRightSimilar} // Use similar specific handler
                    aria-label="Scroll Right Similar Anime"
                  />
                  <ChevronLeft
                    className="absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer bg-red-600 text-white rounded-full z-10" // Added z-10
                    onClick={scrollLeftSimilar} // Use similar specific handler
                    aria-label="Scroll Left Similar Anime"
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Anime Hover Detail Card */}
        {/* Use the AnimeHoverDetailCard component */}
        <AnimeHoverCard
            isVisible={isCardVisible}
            id={hoveredItemId}
            position={cardPosition}
            // contentType is implicitly 'anime' for this card, no need to pass
        />

      </div>
    </div>
  );
};

export default WatchAnimePage;