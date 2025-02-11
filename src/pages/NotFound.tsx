
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto fade-in">
        <h1 className="text-6xl font-bold text-primary mb-6">404</h1>
        <p className="text-xl text-text-secondary mb-8">
          The page you're looking for couldn't be found.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors duration-300"
        >
          <Home className="w-5 h-5 mr-2" />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
