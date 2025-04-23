import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authUser";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoggingIn } = useAuthStore();
  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };
  const heroBackgroundStyle = {
		backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.1)), url('/hero.png')`,
	};

  return (
    <div className="min-h-screen w-full bg-cover bg-center" style={heroBackgroundStyle}>
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-10 backdrop-blur bg-black/50 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <Link to="/">
            <img src="/netflix-logo.png" alt="logo" className="w-36 sm:w-52" />
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex justify-center items-center min-h-screen pt-20 px-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-black/70 rounded-xl shadow-lg">
          <h1 className="text-center text-white text-3xl font-bold">Log In</h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300 block"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 mt-1 border border-gray-700 rounded-md bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300 block"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 mt-1 border border-gray-700 rounded-md bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              className="w-full py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition duration-200 flex items-center justify-center"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
            </button>
          </form>
          <p className="text-gray-400 text-center">
            Don't have an account?{" "}
            <Link to="/signup" className="text-red-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
