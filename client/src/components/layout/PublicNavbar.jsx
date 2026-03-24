import { Link } from 'react-router-dom';

export default function PublicNavbar() {
  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform shadow-md shadow-primary/30">
              T
            </div>
            <span className="font-bold text-xl text-dark tracking-tight">TravelBuddy</span>
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/#features" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Features</Link>
            <Link to="/#how-it-works" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">How It Works</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-primary font-medium transition-colors hidden sm:block">Log in</Link>
            <Link to="/signup" className="btn-primary px-5 py-2">Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
