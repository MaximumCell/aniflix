import { useState } from "react";
import Navbar from "../components/Navbar";
import { useContentStore } from "../store/content";
import { Search } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ORIGINAL_IMG_BASE_URL } from "../utils/constants"; // Used for TMDB images

const SearchPage = () => {
    // Initialize activeTab state, including 'anime'
    const [ activeTab, setActiveTab ] = useState("movie");
    const [ searchTerm, setSearchTerm ] = useState("");

    const [ results, setResults ] = useState([]);
    const { setContentType } = useContentStore();

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        // Set content type in the store based on the active tab
        // Using a switch statement for clarity
        switch (tab) {
            case "movie":
                setContentType("movie");
                break;
            case "tv":
                setContentType("tv");
                break;
            case "anime":
                setContentType("anime");
                break;
            case "person": // Assuming 'person' also needs a content type set, though it's not used for fetching content details
                 setContentType("person"); // Or null, depending on useContentStore's needs
                 break;
            default:
                console.warn(`Unknown tab clicked: ${tab}`);
                setContentType(null); // Set to null or a default if the tab is unrecognized
        }

        setResults([]); // Clear results when changing tabs
        setSearchTerm(""); // Clear search term when changing tabs
    }

    const handleSearch = async (e) => {
        e.preventDefault();
        // Only search if there's a search term
        if (!searchTerm.trim()) {
            toast.error("Please enter a search term.");
            return;
        }

        try {
            // Construct the API URL based on the active tab
            // The backend router is expected to handle /api/v1/search/:type/:query
            const apiUrl = `/api/v1/search/${activeTab}/${encodeURIComponent(searchTerm)}`;


            const res = await axios.get(apiUrl);

            // Assuming backend response structure is { success: true, content: [...] } for anime
            // and { success: true, data: [...] } for TMDB types based on your existing code
            if (res.data?.success) {
                 // Access results based on backend response structure
                 const fetchedResults = res.data.content || res.data.data || [];
                 setResults(fetchedResults);

                 if (fetchedResults.length === 0) {
                     toast("No results found for your search.", { icon: 'ℹ️' });
                 }

            } else {
                 // Handle backend reporting failure (success: false)
                 toast.error(res.data?.message || "Search failed.");
                 setResults([]); // Clear results on backend failure
            }


        } catch (error) {
            // Handle network errors or backend errors (e.g., 404)
            console.error("Error during search:", error.response?.data || error.message);
            if(axios.isAxiosError(error) && error.response?.status === 404) {
                toast.error(`No results found for "${searchTerm}" in ${activeTab} category.`);
            } else {
                toast.error("An error occurred while searching. Please try again later.");
            }
            setResults([]); // Clear results on error
        }
    }


  return (
    <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center gap-3 mb-4">
                {/* Buttons for selecting content type */}
                <button className={`py-2 px-4 rounded ${activeTab === "movie" ? "bg-red-500" : "bg-gray-800"} hover:bg-red-700` } onClick={() => handleTabClick("movie")}>
                    Movies
                </button>

                <button className={`py-2 px-4 rounded ${activeTab === "tv" ? "bg-red-500" : "bg-gray-800"} hover:bg-red-700` } onClick={() => handleTabClick("tv")}>
                    TV Shows
                </button>

                {/* Anime Search Button */}
                <button className={`py-2 px-4 rounded ${activeTab === "anime" ? "bg-red-500" : "bg-gray-800"} hover:bg-red-700` } onClick={() => handleTabClick("anime")}>
                    Anime
                </button>

                <button className={`py-2 px-4 rounded ${activeTab === "person" ? "bg-red-500" : "bg-gray-800"} hover:bg-red-700` } onClick={() => handleTabClick("person")}>
                    People
                </button>
            </div>
            <form className="flex gap-2 items-stretch max-w-2xl mx-auto mb-8" onSubmit={handleSearch}>
                <input
                    type="text"
                    className="w-full p-2 rounded-md bg-gray-800 text-white"
                    placeholder={`Search for ${activeTab}`} // Placeholder updates with active tab
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md">
                    <Search className="size-6" />
                </button>
            </form>

             {/* Display results grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {results.map((result) => {
                         // Handle different data structures based on active tab
                         let imageUrl = null;
                         let title = "Untitled";
                         let linkTo = "#"; // Default link

                         if (activeTab === "movie" || activeTab === "tv") {
                             // TMDB Movie/TV structure
                             imageUrl = result.poster_path ? ORIGINAL_IMG_BASE_URL + result.poster_path : null;
                             title = result.title || result.name;
                             linkTo = `/watch/${result.id}`; // Link to TMDB watch page
                         } else if (activeTab === "person") {
                             // TMDB Person structure
                             imageUrl = result.profile_path ? ORIGINAL_IMG_BASE_URL + result.profile_path : null;
                             title = result.name;
                             // No watch page for person in this setup, maybe link to a person details page?
                             linkTo = "#"; // Or `/person/${result.id}` if you have that route
                         } else if (activeTab === "anime") {
                             // Kitsu Anime structure
                             // Use optional chaining as attributes might be missing
                             imageUrl = result.attributes?.posterImage?.original || result.attributes?.posterImage?.large || result.attributes?.posterImage?.small || result.attributes?.posterImage?.tiny || null;
                             title = result.attributes?.canonicalTitle || result.attributes?.titles?.en || "Untitled Anime"; // Use canonical or English title
                             linkTo = `/watch/anime/${result.id}`; // Link to Anime watch page
                         }

                         // Only render if we have an image URL and an ID
                         // For person, check profile_path, for others check poster_path or Kitsu equivalent
                         const hasImage = activeTab === "person" ? result.profile_path : (result.poster_path || result.attributes?.posterImage);

                         if (!hasImage || !result.id) return null;


                         return (
                             <div key={`${activeTab}-${result.id}`} className='bg-gray-800 p-4 rounded'>
                                 {/* Conditional rendering for person vs content with links */}
                                 {activeTab === "person" ? (
                                     <div className='flex flex-col items-center'>
                                         <img src={imageUrl} alt={title} className='max-h-96 rounded mx-auto object-cover'/> {/* Added object-cover */}
                                         <h2 className='mt-2 text-xl font-bold text-center'>{title}</h2> {/* Added text-center */}
                                     </div>
                                 ) : (
                                     // Use Link for movie, tv, and anime results
                                     <Link to={linkTo}> {/* No need for onClick here, setContentType is handled in handleTabClick */}
                                         <img
                                             src={imageUrl}
                                             alt={title}
                                             className='w-full h-auto rounded object-cover' // Ensure object-cover
                                             onError={(e) => {
                                                console.error("Error loading search result image:", e);
                                                // Provide a fallback image on error
                                                e.target.src = 'https://placehold.co/300x450?text=No+Image'; // Placeholder
                                             }}
                                         />
                                         <h2 className='mt-2 text-xl font-bold text-center'>{title}</h2> {/* Added text-center */}
                                     </Link>
                                 )}
                             </div>
                         );
                    })}
                </div>
        </div>
    </div>
  )
}

export default SearchPage;
