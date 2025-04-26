import { use, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { Info, Play } from "lucide-react";
import useContent from "../../hooks/useContent"; // Assuming this hook fetches data based on content type
import LoadingSpinner from "../../components/LoadingSpinner";
import MovieSlider from "../../components/MovieSlider";
import {
  ANIME_CATEGORIES, // Only need anime categories here
  // ANIME_IMG_BASE_URL // Not directly used here, but good to have in constants
} from "../../utils/constants";
import { useContentStore } from "../../store/content";
import AnimeSlider from "../../components/AnimeSlider";

// Assuming useContent hook now returns isLoading and error states as discussed
// import { useContentStore } from "../../store/content"; // May not be strictly needed here

const AnimeHome = () => {
  // Use the hook to fetch content. Assuming the hook is configured
  // (perhaps via context or a parameter) to fetch anime trending content.
  // If useContent still relies on useContentStore, ensure contentType is set to 'anime'
  // before this component renders.
  const { trendingContent, isLoading, error,  } = useContent();
  const { setContentType } = useContentStore();
  const [imgLoading, setImageLoading] = useState(true);

  useEffect(() => {
    // Set the content type to anime when this component mounts
    setContentType("anime");
    }, [setContentType]);
  // --- CORRECTED HOOK PLACEMENT ---
  // Move the useEffect hook here, before any conditional returns.
  // This hook will now run consistently on every render where trendingContent might change.
  useEffect(() => {
      // Only set imgLoading to true if we have new content arriving
      if (trendingContent) {
          setImageLoading(true);
      }
      // If trendingContent becomes null/undefined due to error or loading,
      // we might want to keep the loading state or handle it differently.
      // The initial isLoading check handles the very first load.
  }, [trendingContent]);
  // --- END CORRECTED HOOK PLACEMENT ---


  // Handle loading state
  if (isLoading || (!trendingContent && !error)) {
    return (
      <div className="h-screen text-white relative">
        <Navbar />
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center -z-10 shimmer">
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
       return (
           <div className="h-screen text-white relative">
                <Navbar />
                <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center -z-10">
                    <p className="text-red-500 text-xl">Error loading trending anime: {error.message}</p>
                </div>
           </div>
       );
  }

  // If we reach here, we have trendingContent (or it's null/undefined after loading/error)

  // Access properties directly, but use optional chaining for safety
  // as trendingContent might still be null or not have the full structure
  // if the backend returned success: true but content: null/undefined,
  // or if there's a brief moment before the state is fully updated.
  const title = trendingContent?.attributes?.canonicalTitle || '';
  const year = trendingContent?.attributes?.startDate?.split("-")[0] || '';
  const rating = trendingContent?.attributes?.ageRating || "";
  const overview = trendingContent?.attributes?.synopsis || '';

  // No need for genreMap or genres logic as this is anime specific

  // Get the image URL safely
  const imageUrl = trendingContent?.attributes?.posterImage?.original;


  console.log("Anime Trending Content:", trendingContent); // Log to inspect the data


  return (
    <>
      {/* Hero / Trending Section */}
      <div className="relative h-screen text-white">
        <Navbar />

        {/* Image loading spinner specific to the image */}
        {/* Only show image loading if we have a valid image URL to load */}
        {imgLoading && imageUrl && (
          <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center -z-10 shimmer">
          </div>
        )}

        {/* Render image only if URL is available */}
        {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className="absolute top-0 left-0 w-full h-full object-cover -z-50"
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                 console.error("Error loading anime image:", e);
                 setImageLoading(false); // Stop shimmer even on error
                 // Optionally, set a fallback image source here if the main one failed
                 // e.target.src = 'https://placehold.co/160x240?text=No+Image';
              }}
            />
        ) }


        <div
          className="absolute top-0 left-0 w-full h-full bg-black/50 -z-50"
          aria-hidden="true"
        />

        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-32">
          <div className="bg-gradient-to-b from-black via-transparent to-transparent absolute w-full h-full top-0 left-0 z-10" />

          <div className="max-w-2xl z-20">
            <h1 className="mt-4 text-6xl font-extrabold text-balance">{title}</h1>
            <p className="mt-2 text-lg">
              {year && `${year} | `} {rating && `${rating} `} {/* No genres for anime in this view */}
            </p>
            <p className="mt-4 text-lg">
              {/* Display full overview or truncated version */}
              {overview.split(" ").length > 20
                ? overview.split(" ").slice(0, 20).join(" ") + "..."
                : overview}
            </p>
            <div className="flex mt-8 z-20">
               {/* Ensure trendingContent.id exists before using it in Link */}
              {trendingContent?.id && (
                <>
                  <Link
                    to={`/watch/anime/${trendingContent.id}`}
                    className="bg-white hover:bg-white/80 text-black font-bold py-2 px-4 rounded-md mr-4 flex items-center"
                  >
                    <Play className="size-6 inline-block mr-2 fill-black" />
                    Watch Now
                  </Link>

                  <Link
                    to={`/watch/anime/${trendingContent.id}`}
                    className="bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded-md flex items-center"
                  >
                    <Info className="size-6 mr-2" />
                    More Info
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sliders Section - Only Anime Categories */}
      
      <div className="flex flex-col gap-10 bg-black py-10">
        {ANIME_CATEGORIES.map((category) => (
           // Use the new AnimeSlider component
           <AnimeSlider key={category} category={category} />
        ))}
      </div>
     
    </>
  );
};

export default AnimeHome;
