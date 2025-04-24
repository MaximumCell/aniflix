import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { Info, Play } from "lucide-react";
import useContent from "../../hooks/useContent";
import { MOVIE_CATEGORIES, ORIGINAL_IMG_BASE_URL, TV_CATEGORIES } from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useContentStore } from "../../store/content";
import MovieSlider from "../../components/MovieSlider";
import { useState } from "react";

const HomeScreen = () => {
  const { trendingContent } = useContent();
  const { contentType } = useContentStore();
  const [imgLoading, setImageLoading] = useState(true);
  if (!trendingContent) return (
    <div className="h-screen text-white relative">
      <Navbar />
      <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center -z-10 shimmer">
      <LoadingSpinner size="lg" /></div>
    </div>
  );
  const genreMap = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
  };
  return (
    <>
      <div className="relative h-screen text-white">
        <Navbar />
        {imgLoading && (
          <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center -z-10 shimmer">
            <LoadingSpinner size="lg" />
          </div>
        )}
        <img
          src={ORIGINAL_IMG_BASE_URL + trendingContent?.backdrop_path}
          alt="Extraction"
          className="absolute top-0 left-0 w-full h-full object-cover -z-50" onLoad={() => setImageLoading(false)}
        />
        <div
          className="absolute top-0 left-0 w-full h-full bg-black/50 -z-50"
          aria-hidden="true"
        />
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-32">
          <div className="bg-gradient-to-b from-black via-transparent to-transparent absolute w-full h-full top-0 left-0 z-10" />

          <div className="max-w-2xl">
            <h1 className="mt-4 text-6xl font-extrabold text-balance">
              {trendingContent?.title || trendingContent?.name}
            </h1>
            <p className="mt-2 text-lg">
              {trendingContent?.release_date?.split("-")[0] ||
                trendingContent?.first_air_date?.split("-")[0] ||
                " "}{" "}
              | {trendingContent?.adult ? "18+" : "PG-13"} |{" "}
              {trendingContent?.genre_ids
                ?.slice(0, 2)
                .map((id) => genreMap[id])
                .join(" , ")}
            </p>
            <p className="mt-4 text-lg">
              {trendingContent?.overview?.split(" ").length > 20
                ? trendingContent.overview.split(" ").slice(0, 20).join(" ") +
                  "..."
                : trendingContent?.overview}
            </p>
          </div>
          <div className="flex mt-8 z-20">
            <Link
              to={`/watch/${trendingContent?.id}`}
              className="bg-white hover:bg-white/80 text-black font-bold py-2 px-4 rounded-md mr-4 flex items-center"
            >
              <Play className="size-6 inline-block mr-2 fill-black" />
              Watch Now
            </Link>

            <Link
              to={`/watch/${trendingContent?.id}`}
              className="bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded-md flex items-center"
            >
              <Info className="size-6 mr-2" />
              More Info
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10 bg-black py-10">
                {contentType === "movie" ? (MOVIE_CATEGORIES.map((category) => <MovieSlider key={category} category={category}/>)) : (TV_CATEGORIES.map((category) => <MovieSlider key={category} category={category}/>))}
      </div>
    </>
  );
};

export default HomeScreen;
