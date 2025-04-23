import { useEffect, useRef, useState } from "react";
import { useContentStore } from "../store/content"
import axios from "axios";
import { Link } from "react-router-dom";
import { SMALL_IMG_BASE_URL } from "../utils/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HoverDetailCard from "./HoverDetailCard";


const MovieSlider = ({category}) => {
    const {contentType} = useContentStore();
    const [content, setContent] = useState([]);
    const [showArrows, setShowArrows] = useState(false);
    const formatContentType = contentType === "movie" ? "Movies" : "TV Shows";
    const formatCategory = category.replaceAll("_", " ")[0].toUpperCase() + category.replaceAll("_", " ").slice(1);


    // --- State for Hover Card ---
    const [hoveredItemId, setHoveredItemId] = useState(null);
    const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
    const [isCardVisible, setIsCardVisible] = useState(false);
    const hoverTimeoutRef = useRef(null);


    useEffect(() => {
        const getContent = async () => {
            const res = await axios.get(`/api/v1/${contentType}/category/${category}`);
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

    const handleMouseEnter = (e, item) => {
        clearTimeout(hoverTimeoutRef.current);
        
        // Get the coordinates relative to the viewport
        const rect = e.currentTarget.getBoundingClientRect();
        
        // Calculate initial position
        const initialX = rect.left;
        const initialY = rect.top - 10; // Position slightly above the element
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const cardWidth = 280; // Width of the card
        const estimatedCardHeight = 200; // Estimated height of the card (adjust as needed)
        
        // Adjust x-position to keep card within viewport horizontally
        let adjustedX = initialX;
        
        // If card would overflow right edge of viewport
        if (initialX + cardWidth > viewportWidth) {
            adjustedX = viewportWidth - cardWidth - 10; // 10px margin from edge
        }
        
        // If card would overflow left edge of viewport
        if (initialX < 0) {
            adjustedX = 10; // 10px margin from edge
        }
        // if (initialY + estimatedCardHeight > viewportHeight) {
        //     adjustedY = viewportHeight - estimatedCardHeight - 10; // 10px margin from edge
        // }
        // Check if there's enough space above
        const showBelow = initialY - estimatedCardHeight < 0;
        
        setCardPosition({
            x: adjustedX,
            y: initialY,
            showBelow: showBelow // Add this flag to indicate if card should show below
        });
        
        setHoveredItemId(item.id);
        setIsCardVisible(true);
    };
    

    const handleMouseLeave = () => {
        // Set a delay before hiding the card
        hoverTimeoutRef.current = setTimeout(() => {
            setIsCardVisible(false);
            // Optional: Reset hoveredItemId after hide animation finishes if needed
            // setHoveredItemId(null);
        }, 200); // 200ms delay
    };
  return (
    <div className="bg-black text-white relative px-5 md:px-20" onMouseEnter={() => setShowArrows(true)} onMouseLeave={() => setShowArrows(false)}>
        <h2 className="text-2xl font-bold mt-10 mb-5">
            {formatCategory} {formatContentType}
        </h2>
        <div className="flex space-x-4 overflow-x-scroll scrollbar-hide" ref={slideRef}>
            {content.map((item) => (
                <Link to={`/watch/${item.id}`} key={item.id} className="min-w-[250px] relative group"  onMouseEnter={(e) => handleMouseEnter(e, item)}
                onMouseLeave={handleMouseLeave}>
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
						className='absolute top-1/2 -translate-y-1/4 left-6 md:left-24 flex items-center justify-center
            size-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10
            '
						onClick={scrollLeft}
					>
						<ChevronLeft size={24} />
					</button>

					<button
						className='absolute top-1/2 -translate-y-1/4 right-6 md:right-24 flex items-center justify-center
            size-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10
            '
						onClick={scrollRight}
					>
						<ChevronRight size={24} />
					</button>
				</>
			)}
             <HoverDetailCard
                isVisible={isCardVisible}
                // Pass the correct contentType for the whole slider
                contentType={contentType}
                id={hoveredItemId}
                position={cardPosition}
            />
    </div>
  )
}

export default MovieSlider