import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LogOut,
  Menu,
  Search,
  Film,
  Tv,
  Clock,
} from "lucide-react";
import { useAuthStore } from "../store/authUser";
import { useContentStore } from "../store/content";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { setContentType } = useContentStore();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className='max-w-6xl mx-auto flex flex-wrap items-center justify-between p-4 h-20 text-white'>
      {/* Left side logo + nav */}
      <div className='flex items-center gap-10 z-50'>
        <Link to='/'>
          <img src='/netflix-logo.png' alt='Netflix Logo' className='w-32 sm:w-40' />
        </Link>

        {/* Desktop Nav Links */}
        <nav className='hidden sm:flex gap-4 items-center text-sm font-medium'>
          <Link
            to='/'
            onClick={() => setContentType("movie")}
            className='flex items-center gap-1 hover:underline'
          >
            <Film className="w-4 h-4" />
            Movies
          </Link>
          <Link
            to='/'
            onClick={() => setContentType("tv")}
            className='flex items-center gap-1 hover:underline'
          >
            <Tv className="w-4 h-4" />
            TV Shows
          </Link>
          <Link
            to='/history'
            className='flex items-center gap-1 hover:underline'
          >
            <Clock className="w-4 h-4" />
            History
          </Link>
        </nav>
      </div>

      {/* Right side user menu */}
      <div className='flex gap-3 items-center z-50'>
        <Link to={"/search"}>
          <Search className='size-5 cursor-pointer hover:text-red-500 transition' />
        </Link>

        {user?.image ? (
          <img
            src={user.image}
            alt='Avatar'
            className='h-8 w-8 rounded-md object-cover border border-gray-600'
          />
        ) : (
          <div className='h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center text-sm'>
            U
          </div>
        )}

        <LogOut
          className='size-5 cursor-pointer hover:text-red-500 transition'
          onClick={logout}
        />

        {/* Mobile Menu Toggle */}
        <div className='sm:hidden'>
          <Menu
            className='size-5 cursor-pointer hover:text-red-500 transition'
            onClick={toggleMobileMenu}
          />
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <nav className='w-full sm:hidden mt-4 z-40 bg-black border rounded-md border-gray-800 p-3 space-y-2 transition-all duration-300'>
          <Link
            to='/'
            onClick={() => {
              setContentType("movie");
              toggleMobileMenu();
            }}
            className='flex items-center gap-2 hover:text-red-500'
          >
            <Film size={18} />
            Movies
          </Link>
          <Link
            to='/'
            onClick={() => {
              setContentType("tv");
              toggleMobileMenu();
            }}
            className='flex items-center gap-2 hover:text-red-500'
          >
            <Tv size={18} />
            TV Shows
          </Link>
          <Link
            to='/history'
            onClick={toggleMobileMenu}
            className='flex items-center gap-2 hover:text-red-500'
          >
            <Clock size={18} />
            History
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
