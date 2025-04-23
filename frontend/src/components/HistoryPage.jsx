import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { SMALL_IMG_BASE_URL } from "../utils/constants";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";

function formatDate(dateString) {
  // Create a Date object from the input date string
  const date = new Date(dateString);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Extract the month, day, and year from the Date object
  const month = monthNames[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  // Return the formatted date string
  return `${month} ${day}, ${year}`;
}

const HistoryPage = () => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSearchHistory = async () => {
      try {
        const res = await axios.get(`/api/v1/search/history`);
        if (res.data && Array.isArray(res.data.content)) {
            const sortedHistory = [...res.data.content].sort((a, b) => {
                return new Date(b.createAt).getTime() - new Date(a.createAt).getTime();
            });
            setSearchHistory(sortedHistory);
        } else {
            console.error("Received invalid search history data:", res.data);
            setSearchHistory([]);
        }
      } catch (error) {
        toast.error("Could not load search history.");
        setSearchHistory([]);
      } finally {
        setIsLoading(false);
      }
    };
    getSearchHistory();
  }, []);

  const handleDelete = async (entry) => {
    try {
      await axios.delete(`/api/v1/search/history/${entry.id}`);
      setSearchHistory(searchHistory.filter((item) => item.id !== entry.id));
    } catch (error) {
      toast.error("Failed to delete search item");
    }
  };

  if (isLoading) {
     return (
       <div className="bg-black min-h-screen text-white">
         <Navbar />
         <div className="max-w-6xl mx-auto px-4 py-8 text-center">
             Loading search history...
         </div>
       </div>
     );
  }
  if (!isLoading && searchHistory?.length === 0) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Search History</h1>
          <div className="flex justify-center items-center h-96">
            <p className="text-xl">No search history found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Search History</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3  gap-4">
          {searchHistory?.map((entry) => (
            // Add gap-x-4 (or similar) to the parent for spacing between elements
            <div
              key={`${entry.id}-${entry.createAt}`}
              className="bg-gray-800 p-4 rounded flex items-start gap-x-4"
            >
              <img
                src={SMALL_IMG_BASE_URL + entry.Image}
                alt="History image"
                // Add flex-shrink-0 to prevent image shrinking
                className="size-16 rounded-full object-cover flex-shrink-0"
              />

              {/* This container will grow, but its content (title) can be truncated */}
              {/* min-w-0 is crucial for allowing truncation within flex items */}
              <div className="flex flex-col flex-grow min-w-0">
                {/* Apply truncation styles to the title itself */}
                <span className="text-white text-lg overflow-hidden text-ellipsis whitespace-nowrap">
                  {entry.title}
                </span>
                <span className="text-gray-400 text-sm">
                  {formatDate(entry.createAt)}
                </span>
              </div>

              {/* Tag - Ensure it doesn't shrink */}
              <span
                className={`py-1 px-3 min-w-20 text-center rounded-full text-sm ml-auto flex-shrink-0 ${
                  // Added flex-shrink-0
                  entry.searchType === "movie"
                    ? "bg-red-600"
                    : entry.searchType === "tv"
                    ? "bg-blue-600"
                    : "bg-green-600"
                }`}
              >
                {entry.searchType[0].toUpperCase() + entry.searchType.slice(1)}
              </span>

              {/* Trash Icon - Ensure it doesn't shrink */}
              <Trash
                // Added flex-shrink-0, removed ml-4 as parent gap handles spacing
                className="size-5 cursor-pointer hover:fill-red-600 hover:text-red-600 flex-shrink-0"
                onClick={() => handleDelete(entry)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default HistoryPage;
