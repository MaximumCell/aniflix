const LoadingSpinner = ({ size = "md" }) => {
	const sizes = {
	  sm: "h-4 w-4 border-2",
	  md: "h-6 w-6 border-2",
	  lg: "h-8 w-8 border-4",
	};
  
	return (
	  <div
		className={`rounded-full animate-spin border-red-600 border-t-transparent ${sizes[size]} `}
	  />
	);
  };
  
  export default LoadingSpinner;
  