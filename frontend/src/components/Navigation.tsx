import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Camera, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { name: 'Challenges', path: '/challenges' },
    { name: 'Photo Gallery', path: '/gallery' },
    { name: 'Leaderboard', path: '/leaderboard' }
  ];

  return (
    <nav className="bg-orange-500 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="md:hidden">
              <Button variant="ghost" size="sm" className="text-white hover:text-orange-100 hover:bg-white/10" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
            <Link to="/" className="flex items-center space-x-3 group">
              <Camera className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
              <span className="text-white text-xl font-bold group-hover:text-orange-100 transition-colors duration-300">Photo Quest</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-white font-medium transition-all duration-300 relative px-1 py-2
                  hover:text-orange-100
                  ${location.pathname === item.path 
                    ? 'after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-white' 
                    : 'after:content-[""] after:absolute after:left-1/2 after:bottom-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 hover:after:w-full hover:after:left-0'}
                `}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white hover:text-orange-100 hover:bg-white/10 transition-all duration-300 flex items-center space-x-2"
                    >
                      <Avatar className="h-8 w-8 border-2 border-white/80">
                        <AvatarImage src={user.avatar_url} alt={user.username} />
                        <AvatarFallback className="bg-orange-300 text-orange-800">
                          {user.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="w-full flex items-center px-3 py-2 hover:bg-orange-100 rounded-md transition-colors duration-200">
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-photos" className="w-full flex items-center px-3 py-2 hover:bg-orange-100 rounded-md transition-colors duration-200">
                        <Camera className="h-4 w-4 mr-2" />
                        My Photos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="flex items-center px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button asChild variant="ghost" size="sm" 
                  className="text-white hover:text-orange-100 hover:bg-white/10 transition-all duration-300 px-6"
                >
                  <Link to="/signup">Sign up</Link>
                </Button>
                <Button asChild variant="ghost" size="sm"
                  className="text-white bg-white/5 hover:text-orange-100 hover:bg-white/20 transition-all duration-300 px-6"
                >
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Animated Sidebar - Left */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl rounded-r-2xl transform transition-transform duration-300 z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 flex justify-between items-center border-b border-orange-200">
          <span className="text-xl font-bold text-orange-600">📋 Menu</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-600 hover:text-orange-500 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-base font-medium">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`block px-4 py-2 rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-800 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              {item.name}
            </Link>
          ))}

          <hr className="my-4 border-orange-200" />

          {user && (
            <>
              <Link
                to="/profile"
                onClick={() => setSidebarOpen(false)}
                className="block px-4 py-2 rounded-md text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition"
              >
                My Profile
              </Link>
              <Link
                to="/my-photos"
                onClick={() => setSidebarOpen(false)}
                className="block px-4 py-2 rounded-md text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition"
              >
                My Photos
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setSidebarOpen(false);
                }}
                className="w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-50 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
