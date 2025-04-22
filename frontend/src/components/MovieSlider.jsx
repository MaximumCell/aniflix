import { useEffect, useRef, useState } from "react";
import { useContentStore } from "../store/content"
import axios from "axios";
import { Link } from "react-router-dom";
import { SMALL_IMG_BASE_URL } from "../utils/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";


const MovieSlider = ({category}) => {
    const {contentType} = useContentStore();
    const [content, setContent] = useState([]);
    const [showArrows, setShowArrows] = useState(false);
    const formatContentType = contentType === "movie" ? "Movies" : "TV Shows";
    const formatCategory = category.replaceAll("_", " ")[0].toUpperCase() + category.replaceAll("_", " ").slice(1);
    useEffect(() => {
        const getContent = async () => {
            const res = await axios.get(`/api/v1/${contentType}/${category}`);
            setContent(res.data.content);
        }
        getContent();
    }, [contentType,category])
    const slideRef = useRef(null);
    const scrollLeft = () => {
        slideRef.current.scrollBy({
            left: -slideRef.current.clientWidth,
            behavior: "smooth",
        });
    };
    const scrollRight = () => {
        slideRef.current.scrollBy({
            left: slideRef.current.clientWidth,
            behavior: "smooth",
        });
    }
  return (
    <div className="bg-black text-white relative px-5 md:px-20" onMouseEnter={() => setShowArrows(true)} onMouseLeave={() => setShowArrows(false)}>
        <h2 className="text-2xl font-bold mt-10 mb-5">
            {formatCategory} {formatContentType}
        </h2>
        <div className="flex space-x-4 overflow-x-scroll scrollbar-hide" ref={slideRef}>
            {content.map((item) => (
                <Link to={`/watch/${item.id}`} key={item.id} className="min-w-[250px] relative group">
                    <div className="rounded-lg overflow-hidden">
                        <img src={SMALL_IMG_BASE_URL+item.backdrop_path} alt="movie poster" className="transition-transform duration-300 ease-in-out group-hover:scale-125"/>
                    </div>
                    <p className="mt-2 text-center">
                        {item.title || item.name}
                    </p>
                </Link>
            ))}
        </div>
        {showArrows && (
				<>
					<button
						className='absolute top-1/2 -translate-y-1/2 left-5 md:left-24 flex items-center justify-center
            size-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10
            '
						onClick={scrollLeft}
					>
						<ChevronLeft size={24} />
					</button>

					<button
						className='absolute top-1/2 -translate-y-1/2 right-5 md:right-24 flex items-center justify-center
            size-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10
            '
						onClick={scrollRight}
					>
						<ChevronRight size={24} />
					</button>
				</>
			)}
    </div>
  )
}

export default MovieSlider