import React, { useState, useEffect } from 'react';
import { Heart, Trophy, Camera, Share2, Clock, Search, X, ZoomIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { toast } from '../components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryPost {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  image_url: string;
  task?: string;
  prompt?: string;
  difficulty: string;
  likes: string[];
  created_at: string;
  choices?: string[];
  correct_index?: number;
}

const Gallery = () => {
  const [photos, setPhotos] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<GalleryPost | null>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchPhotos = async () => {
    try {
      const res = await fetch('http://localhost:8081/gallery/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      } else {
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Error
            </div>
            <div className="text-sm text-gray-800">Failed to fetch photos</div>
          </div>
        );
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Error
          </div>
          <div className="text-sm text-gray-800">Failed to fetch photos. Please try again.</div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling setup
  useEffect(() => {
    fetchPhotos();

    // Set up polling every 10 seconds
    const intervalId = setInterval(() => {
      fetchPhotos();
    }, 10000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Fetch when component gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPhotos();
      }
    };

    const handleFocus = () => {
      fetchPhotos();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const res = await fetch('http://localhost:8081/gallery/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          post_id: id,
          email: user.email
        })
      });

      if (res.ok) {
        // Refresh photos to get updated likes
        fetchPhotos();
      } else {
        const data = await res.json();
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Error
            </div>
            <div className="text-sm text-gray-800">{data.error || "Failed to like photo"}</div>
          </div>
        );
      }
    } catch (error) {
      console.error('Error liking photo:', error);
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Error
          </div>
          <div className="text-sm text-gray-800">Failed to like photo. Please try again.</div>
        </div>
      );
    }
  };

  const handleShare = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const res = await fetch('http://localhost:8081/gallery/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          post_id: id,
          email: user.email
        })
      });

      if (res.ok) {
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Success
            </div>
            <div className="text-sm text-gray-800">Share link sent to your email!</div>
          </div>
        );
      } else {
        const data = await res.json();
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Error
            </div>
            <div className="text-sm text-gray-800">{data.error || "Failed to share photo"}</div>
          </div>
        );
      }
    } catch (error) {
      console.error('Error sharing photo:', error);
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Error
          </div>
          <div className="text-sm text-gray-800">Failed to share photo. Please try again.</div>
        </div>
      );
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      
      return `${month} ${day}, ${year} at ${formattedHours}:${minutes} ${ampm}`;
    }
  };

  // Function to handle image click for lightbox
  const handleImageClick = (photo: GalleryPost) => {
    setSelectedImage(photo);
    document.body.style.overflow = 'hidden';
  };

  // Function to close lightbox
  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const filteredPhotos = photos.filter(photo => {
    const searchLower = searchQuery.toLowerCase();
    const taskOrPrompt = (photo.task || photo.prompt || '').toLowerCase();
    const userName = (photo.user_name || '').toLowerCase();
    return taskOrPrompt.includes(searchLower) || userName.includes(searchLower);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FEF6E9] to-orange-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-orange-800 mb-6 tracking-tight">
            Photo Gallery
          </h1>
          <p className="text-lg text-orange-600 mb-8 max-w-2xl mx-auto">
            Explore amazing photos from our community and try to guess their prompts!
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative mb-12">
            <input
              type="text"
              placeholder="Search photos or photographers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-full border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 h-5 w-5" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full">
                  <div 
                    className="relative cursor-pointer aspect-[4/3] overflow-hidden" 
                    onClick={() => handleImageClick(photo)}
                  >
                    <img 
                      src={photo.image_url} 
                      alt={photo.task}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center space-x-3 mb-4">
                      <img 
                        src={photo.user_avatar || '/default-avatar.png'} 
                        alt={photo.user_name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-100"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-orange-800 text-sm truncate">
                          {photo.user_name}
                        </h3>
                        <div className="flex items-center text-xs text-orange-500">
                          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{formatDate(photo.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 font-medium mb-4 line-clamp-2 flex-1">
                      {photo.task}
                    </p>
                    
                    <div className="space-y-4 mt-auto">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={(e) => handleLike(photo.id, e)}
                            className="flex items-center space-x-1.5 hover:text-red-500 transition-colors group/like"
                          >
                            <Heart 
                              className={`h-5 w-5 transition-all duration-300 ${
                                photo.likes.includes(user.email) 
                                  ? 'fill-red-500 text-red-500 scale-110' 
                                  : 'group-hover/like:scale-110'
                              }`} 
                            />
                            <span className="font-medium">{photo.likes.length}</span>
                          </button>
                          <button 
                            onClick={(e) => handleShare(photo.id, e)}
                            className="hover:text-orange-500 transition-colors group/share"
                          >
                            <Share2 className="h-5 w-5 group-hover/share:scale-110 transition-transform duration-300" />
                          </button>
                        </div>
                        <div className="flex items-center text-orange-500 font-medium">
                          <Trophy className="h-5 w-5 mr-1.5" />
                          100
                        </div>
                      </div>
                      
                      <Link to={`/challenges/guess/${photo.id}`} className="block">
                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          Try Challenge
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-orange-600">No photos found matching your search.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-7xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="absolute -top-12 right-0 text-white hover:text-orange-400 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={selectedImage.image_url}
                alt={selectedImage.task}
                className="max-h-[85vh] w-auto object-contain rounded-lg"
              />
              <div className="mt-4 bg-white/10 backdrop-blur-md rounded-lg p-4 w-full max-w-2xl">
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={selectedImage.user_avatar || '/default-avatar.png'}
                    alt={selectedImage.user_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-100"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{selectedImage.user_name}</h3>
                    <p className="text-orange-300 text-sm">{formatDate(selectedImage.created_at)}</p>
                  </div>
                </div>
                {selectedImage.task && (
                  <p className="text-white/90">{selectedImage.task}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
};

export default Gallery;
