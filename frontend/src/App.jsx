import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage.jsx"
import SignupPage from "./pages/SignupPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"

function App() {
  

  return (
     <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
     </Routes>
  )
}

export default App
