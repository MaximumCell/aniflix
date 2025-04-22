import { Navigate, Route, Routes } from "react-router-dom"
import HomePage from "./pages/home/HomePage.jsx"
import SignupPage from "./pages/SignupPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import Footer from "./components/Footer.jsx"
import { Toaster } from "react-hot-toast"
import { useAuthStore } from "./store/authUser.js"
import { useEffect } from "react"
import LoadingSpinner from "./components/LoadingSpinner.jsx"

function App() {
  
  const {user, isCheckingAuth, authCheck} = useAuthStore();
  
  useEffect(() => {
    authCheck();
  }
  , [])
  console.log("Auth user in app", user);
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
      <Route path="/" element={user ? <HomePage /> :  <Navigate to={"/login"} />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={"/"} />} />
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to={"/"} />} />
     </Routes>
     <Footer />
     <Toaster />
     </>
  )
}

export default App
