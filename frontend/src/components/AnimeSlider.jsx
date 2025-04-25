import { useEffect, useRef, useState } from "react";
// No need to get contentType from store here as this component is specific to anime
// import { useContentStore } from "../store/content";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  // No need for TMDB base URLs here
  // SMALL_IMG_BASE_URL,
  // ORIGINAL_IMG_BASE_URL,
  // Import Kitsu specific constants
  ANIME_IMG_BASE_URL,
  ANIME_IMAGE_SIZES,
} from "../utils/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnimeHoverCard from "./AnimeHoverCard";

// This component is specifically for Anime sliders, so it doesn't need
// the contentType prop to determine the API endpoint or data structure.
// However, we might still pass contentType to the HoverDetailCard if needed.
const AnimeSlider = ({ category }) => {
  // content type is implicitly 'anime' for this component
  const contentType = "anime";

  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [showArrows, setShowArrows] = useState(false);

  // Format category title - content type is always Anime
  const formatCategory =
    category.replaceAll("_", " ")[0].toUpperCase() +
    category.replaceAll("_", " ").slice(1);
  const formatContentType = "Anime"; // Hardcoded as this component is for Anime

  // --- State for Hover Card ---
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [isCardVisible, setIsCardVisible] = useState(false);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    const getContent = async () => {
      setIsLoading(true); // Start loading
      setError(null); // Clear previous errors
      setContent([]); // Clear previous content

      // API URL is always for anime category
      const apiUrl = `/api/v1/anime/category/${category}`;

      try {
        const res = await axios.get(apiUrl);

        if (res.data.success) {
          // Kitsu data structure is expected here
          setContent(res.data.content);
        } else {
          // Backend indicated failure
          setError(
            new Error(
              res.data.message || `Failed to fetch Anime category: ${category}`
            )
          );
          setContent([]); // Ensure content is empty on error
        }
      } catch (err) {
        // Network or other request error
        console.error(`AnimeSlider: Error fetching category ${category}:`, err);
        setError(err);
        setContent([]); // Ensure content is empty on error
      } finally {
        setIsLoading(false); // End loading
      }
    };
    // Only fetch if category is provided
    if (category) {
      getContent();
    }
  }, [category]); // Effect dependency is only category

  const slideRef = useRef(null);

  const scrollLeft = () => {
    if (slideRef.current) {
      slideRef.current.scrollBy({
        left: -slideRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };
  const scrollRight = () => {
    if (slideRef.current) {
      slideRef.current.scrollBy({
        left: slideRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const handleMouseEnter = (e, item) => {
    clearTimeout(hoverTimeoutRef.current);

    // Get the coordinates relative to the viewport
    const rect = e.currentTarget.getBoundingClientRect();

    // Calculate initial position
    const initialX = rect.left;
    const initialY = rect.top;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const cardWidth = 280; // Width of the card (adjust if your card size is different)

    // Adjust x-position to keep card within viewport horizontally
    let adjustedX = initialX;

    // If card would overflow right edge of viewport
    if (initialX + cardWidth > viewportWidth) {
      adjustedX = viewportWidth - cardWidth - 10; // 10px padding from the right edge
    }

    // If card would overflow left edge of viewport
    if (initialX < 0) {
      adjustedX = 10; // 10px padding from the left edge
    }

    setCardPosition({
      x: adjustedX,
      y: initialY,
    });

    // Ensure item.id exists before setting hoveredItemId
    if (item?.id) {
      setHoveredItemId(item.id);
      setIsCardVisible(true);
    }
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsCardVisible(false);
      // Optionally reset hoveredItemId after the card hides
      // setHoveredItemId(null);
    }, 200); // Delay hiding the card
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

  // Helper to get the correct image URL for Anime
  const getImageUrl = (item) => {
    // For anime, use the posterImage.small or tiny property from attributes
    // Use optional chaining as attributes or posterImage might be missing
    return (
      item.attributes?.posterImage?.small || item.attributes?.posterImage?.tiny
    );
    // You could also use ANIME_IMG_BASE_URL + item.id + ANIME_IMAGE_SIZES.small
    // if the API response only gives the ID and not the full URL
  };

  // Helper to get the correct title for Anime
  const getItemTitle = (item) => {
    return item.attributes?.canonicalTitle || "Untitled Anime";
  };

  // Handle loading, error, and empty states before rendering the slider content
  if (isLoading) {
    return (
      <div className="text-white text-center py-8">
        Loading {formatCategory} {formatContentType}...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        Error loading {formatCategory} {formatContentType}: {error.message}
      </div>
    );
  }

  if (!content || content.length === 0) {
    // Only show this message if not loading and no error, but content is empty
    return (
      <div className="text-gray-400 text-center py-8">
        No {formatContentType} found for category: {formatCategory}.
      </div>
    );
  }

  return (
    <div
      className="bg-black text-white relative px-5 md:px-20"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <h2 className="text-2xl font-bold mt-10 mb-5">
        {formatCategory} {formatContentType}
      </h2>
      <div
        className="flex space-x-4 overflow-x-scroll scrollbar-hide"
        ref={slideRef}
      >
        {content.map((item) => {
          const itemImageUrl = getImageUrl(item);
          const itemTitle = getItemTitle(item);

          // Only render the link if we have a valid item ID and an image URL
          return (
            item?.id &&
            itemImageUrl && (
              <Link
                // --- CORRECTED LINK DESTINATION ---
                to={`/watch/anime/${item.id}`} // <-- Navigate to the Anime Watch Page route
                // --- END CORRECTED LINK DESTINATION ---
                key={item.id}
                className="flex-shrink-0 w-40 relative group" // Adjusted width for potentially smaller anime posters
                onMouseEnter={(e) => handleMouseEnter(e, item)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="rounded-lg overflow-hidden">
                  {/* Use the dynamically determined image URL */}
                  <img
                    src={itemImageUrl}
                    alt={itemTitle}
                    className="transition-transform duration-300 ease-in-out group-hover:scale-125 object-cover w-full h-60" // Ensure object-cover and set height
                    onError={(e) => {
                      console.error("Error loading slider image:", e);
                      // Provide a fallback image on error
                      e.target.src =
                        "https://placehold.co/160x240?text=No+Image";
                    }}
                  />
                </div>
                {/* Optional: Display title below the image */}
                <p className="mt-2 text-center">{itemTitle}</p>
              </Link>
            )
          );
        })}
      </div>
      {showArrows && (
        <>
          <button
            className="absolute top-1/2 -translate-y-1/4 left-6 md:left-24 flex items-center justify-center
                          size-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10
                          "
            onClick={scrollLeft}
            aria-label="Scroll Left" // Add accessibility label
          >
            <ChevronLeft size={24} />
          </button>

          <button
            className="absolute top-1/2 -translate-y-1/4 right-6 md:right-24 flex items-center justify-center
                          size-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10
                          "
            onClick={scrollRight}
            aria-label="Scroll Right" // Add accessibility label
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
      {/* Pass contentType to HoverDetailCard as well if it needs to handle anime data */}
      <AnimeHoverCard
        isVisible={isCardVisible}
        id={hoveredItemId}
        position={cardPosition}
        // No need to pass contentType here as the component is anime-specific
      />
    </div>
  );
};

export default AnimeSlider;
