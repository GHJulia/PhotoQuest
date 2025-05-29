import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Challenges', path: '/challenges' },
    { name: 'Photo Gallery', path: '/gallery' },
    { name: 'Leaderboard', path: '/leaderboard' }
  ];

  return (
    <nav className="bg-orange-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <Camera className="h-8 w-8 text-white" />
            <span className="text-white text-xl font-bold">Photo Quest</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-white hover:text-orange-200 font-medium transition-colors duration-200 ${
                  location.pathname === item.path ? 'border-b-2 border-white pb-1' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm" className="text-white hover:text-orange-800 hover:bg-orange-200 transition-colors duration-300">
              <Link to="/signup">Sign up</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-white hover:text-orange-800 hover:bg-orange-200 transition-colors duration-300">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
