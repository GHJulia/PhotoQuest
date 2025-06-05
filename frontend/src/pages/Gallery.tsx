import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Heart, Trophy, Camera, Share2, Clock, Search, X, ZoomIn, User, Filter, Instagram, Facebook, Twitter, Link as LinkIcon, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { toast } from '../components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

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
  const [showScrollTop, setShowScrollTop] = useState(false);
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

  const handleShare = async (id: string, platform: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const photo = photos.find(p => p.id === id);
    if (!photo) return;

    const shareUrl = `${window.location.origin}/photo/${id}`;
    const shareText = photo.prompt || 'Check out this amazing photo on PhotoQuest!';
    
    try {
      switch (platform) {
        case 'instagram':
          // Instagram sharing typically opens the app/website
          window.open(`https://instagram.com`, '_blank');
          toast(
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 font-semibold text-orange-700 text-base">
                <Instagram className="h-5 w-5 text-orange-500" />
                Instagram
              </div>
              <div className="text-sm text-gray-800">
                Open Instagram and paste the copied link to share!
              </div>
            </div>
          );
          break;
          
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
          
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
          break;
          
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast(
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
                <LinkIcon className="h-5 w-5 text-green-500" />
                Success
              </div>
              <div className="text-sm text-gray-800">Link copied to clipboard!</div>
            </div>
          );
          break;
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <X className="h-5 w-5 text-red-500" />
            Error
          </div>
          <div className="text-sm text-gray-800">Failed to share. Please try again.</div>
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

  const filteredPhotos = photos.filter(photo => {
    const searchLower = searchQuery.toLowerCase();
    const taskOrPrompt = (photo.task || photo.prompt || '').toLowerCase();
    const userName = (photo.user_name || '').toLowerCase();
    return taskOrPrompt.includes(searchLower) || userName.includes(searchLower);
  });

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FEF6E9] via-orange-50 to-white">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-600 mb-3 tracking-tight">
            Photo Gallery
          </h1>
          <p className="text-sm md:text-base text-orange-600/80 max-w-2xl mx-auto mb-8">
            Explore amazing photos from our community and challenge yourself with creative prompts
          </p>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
            <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search photos or photographers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-11 rounded-full border-2 border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 h-5 w-5" />
          </div>
        </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-orange-600 mt-4 animate-pulse">Loading amazing photos...</p>
          </div>
        ) : filteredPhotos.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((photo, index) => (
                <motion.div
              key={photo.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card className="group overflow-hidden bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 border-orange-100 rounded-xl">
                    <CardContent className="p-0">
                      <div 
                        className="aspect-[4/3] overflow-hidden relative cursor-pointer"
                        onClick={() => setSelectedImage(photo)}
                      >
                        <img 
                          src={photo.image_url} 
                          alt={photo.prompt || 'Gallery photo'}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                        <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex flex-col gap-2">
                          <h3 className="text-white text-base font-semibold drop-shadow-lg line-clamp-2">
                            {photo.prompt || 'Untitled Photo'}
                          </h3>
                          {photo.task && (
                            <p className="text-white/90 text-sm line-clamp-2 font-medium drop-shadow-lg">
                              {photo.task}
                            </p>
                          )}
                        </div>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <span className="px-3 py-1 rounded-full text-white text-sm font-medium bg-orange-500/80 backdrop-blur-sm shadow-lg">
                            {photo.difficulty}
                          </span>
                        </div>
                      </div>
              
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 p-0.5 shadow-lg group-hover:shadow-xl transition-all duration-500">
                              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                {photo.user_avatar ? (
                                  <img 
                                    src={photo.user_avatar} 
                                    alt={photo.user_name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-orange-50">
                                    <User className="h-5 w-5 text-orange-500" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-orange-800">@{photo.user_name}</p>
                              <div className="flex items-center text-orange-500 text-sm">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(photo.created_at)}
                              </div>
                    </div>
                  </div>
                </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => handleLike(photo.id, e)}
                              className="flex items-center gap-2 hover:text-red-500 transition-colors group/like"
                    >
                      <Heart 
                        className={`h-5 w-5 transition-all duration-300 ${
                                  photo.likes.includes(user.email) 
                            ? 'fill-red-500 text-red-500 scale-110' 
                                    : 'group-hover/like:scale-125'
                        }`} 
                      />
                              <span className="font-medium">{photo.likes.length}</span>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="hover:text-orange-500 transition-colors group/share">
                          <Share2 className="h-5 w-5 transition-transform duration-300 group-hover/share:scale-125" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white rounded-xl shadow-xl border border-orange-100">
                        <DropdownMenuItem onClick={(e) => handleShare(photo.id, 'instagram', e)} className="flex items-center gap-2 py-2 cursor-pointer hover:bg-orange-50">
                          <Instagram className="h-4 w-4 text-pink-600" />
                          <span>Share to Instagram</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleShare(photo.id, 'facebook', e)} className="flex items-center gap-2 py-2 cursor-pointer hover:bg-orange-50">
                          <Facebook className="h-4 w-4 text-blue-600" />
                          <span>Share to Facebook</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleShare(photo.id, 'twitter', e)} className="flex items-center gap-2 py-2 cursor-pointer hover:bg-orange-50">
                          <Twitter className="h-4 w-4 text-blue-400" />
                          <span>Share to Twitter</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleShare(photo.id, 'copy', e)} className="flex items-center gap-2 py-2 cursor-pointer hover:bg-orange-50">
                          <LinkIcon className="h-4 w-4 text-gray-600" />
                          <span>Copy Link</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                          <Link to={`/challenges/guess/${photo.id}`}>
                  <Button 
                    size="sm" 
                              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-xl transition-all duration-300 rounded-full px-6"
                  >
                    Try Challenge
                  </Button>
                </Link>
              </div>
            </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="mb-6">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <Camera className="w-full h-full text-orange-400" />
                </motion.div>
        </div>
              <h3 className="text-2xl font-bold text-orange-800 mb-3">No photos found</h3>
              <p className="text-orange-600 text-lg mb-8">Try adjusting your search terms</p>
          </div>
          </motion.div>
        )}
      </main>

      {/* Enhanced Photo Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative max-w-5xl w-full bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="relative flex flex-col items-center">
                <div className="w-full h-[75vh] relative">
                  <img
                    src={selectedImage.image_url}
                    alt={selectedImage.prompt || 'Photo detail'}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50">
                      {selectedImage.user_avatar ? (
                        <img 
                          src={selectedImage.user_avatar} 
                          alt={selectedImage.user_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-500">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">@{selectedImage.user_name}</h3>
                      <p className="text-orange-200">{formatDate(selectedImage.created_at)}</p>
                    </div>
                  </div>
                  <h2 className="text-white text-2xl font-bold mb-2">
                    {selectedImage.prompt || 'Untitled Photo'}
                  </h2>
                  {selectedImage.task && (
                    <p className="text-white/90 text-xl font-medium leading-relaxed">
                      {selectedImage.task}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-all duration-300 z-40"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
};

export default Gallery;
