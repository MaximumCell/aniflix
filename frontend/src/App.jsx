import { Navigate, Route, Routes } from "react-router-dom"
import HomePage from "./pages/home/HomePage.jsx"
import SignupPage from "./pages/SignupPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import Footer from "./components/Footer.jsx"
import { Toaster } from "react-hot-toast"
import { useAuthStore } from "./store/authUser.js"
import { useEffect } from "react"
import LoadingSpinner from "./components/LoadingSpinner.jsx"
import WatchPage from "./pages/WatchPage.jsx"
import SearchPage from "./pages/SearchPage.jsx"
import HistoryPage from "./components/HistoryPage.jsx"
import NotFoundPage from "./pages/NotFoundPage.jsx"
import AnimeHome from "./pages/anime/animeHome.jsx"
import WatchAnimePage from "./pages/anime/WatchAnimePage.jsx"

function App() {
  
  const {user, isCheckingAuth, authCheck} = useAuthStore();
  
  useEffect(() => {
    authCheck();
  }
  , [])
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
      <LoadingSpinner size="lg" />
    </div>
    
    )
  }
  return (
    <>
     <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={"/"} />} />
      <Route path="/anime" element={user ? <AnimeHome /> : <Navigate to={"/"} />} />
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to={"/"} />} />
      <Route path="/watch/:id" element={user ? <WatchPage /> : <Navigate to={"/login"} />} />
      <Route path="/watch/anime/:id" element={user ? <WatchAnimePage /> : <Navigate to={"/login"} />} />
      <Route path="/search" element={user ? <SearchPage /> : <Navigate to={"/login"} />} />
      <Route path="/history" element={user ? <HistoryPage /> : <Navigate to={"/login"} />} />
      <Route path="/*" element={<NotFoundPage />} />
     </Routes>
     <Footer />
     <Toaster />
     </>
  )
}

export default App
