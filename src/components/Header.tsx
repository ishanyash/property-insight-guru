
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ApiKeyModal } from './ApiKeyModal';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 py-4 px-6 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div 
              className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              PropertyInsight
            </motion.div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" label="Home" />
            <NavLink to="/how-it-works" label="How It Works" />
            <NavLink to="/about" label="About" />
          </nav>
          
          <div className="flex items-center space-x-4">
            <ApiKeyModal />
            <Button 
              variant="ghost" 
              className="hidden md:inline-flex hover:bg-blue-50 transition-colors duration-300"
            >
              Login
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300 shadow-sm hover:shadow"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

const NavLink = ({ to, label }: { to: string; label: string }) => {
  return (
    <Link 
      to={to} 
      className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
    >
      {label}
    </Link>
  );
};

export default Header;
