import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Heart, Share2, Clock, Camera, Loader2, ImagePlus, User, X, Instagram, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '../components/ui/use-toast';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

interface MyPhoto {
  id: string;
  image_url: string;
  created_at: string;
  likes: string[];
  task?: string;
  prompt?: string;
}

const MyPhotos = () => {
  const [photos, setPhotos] = useState<MyPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<MyPhoto | null>(null);

  useEffect(() => {
    fetchMyPhotos();
  }, []);

  const fetchMyPhotos = async () => {
    try {
      const response = await api.get('/my-photos');
      setPhotos(response.data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your photos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (photo: MyPhoto, platform: string) => {
    try {
      const shareUrl = `${window.location.origin}/photo/${photo.id}`;
      const shareText = photo.prompt || 'Check out my photo on PhotoQuest!';

      switch (platform) {
        case 'instagram':
          // Instagram sharing typically opens the app/website
          window.open(`https://instagram.com`, '_blank');
          toast({
            title: "Instagram",
            description: "Open Instagram and paste the copied link to share!",
          });
          break;
          
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
          
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
          break;
          
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Success",
            description: "Link copied to clipboard!",
          });
          break;
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error",
        description: "Could not share the photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      if (diffHours === 0) {
        return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('en-US', options);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FEF6E9] to-white">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-600 mb-3 tracking-tight">
              My Photos
            </h1>
            <p className="text-sm md:text-base text-orange-600/80">Your creative journey in pictures</p>
          </div>
          <Link to="/challenges">
            <Button 
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <ImagePlus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              Add New Photo
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
            <p className="text-orange-600 animate-pulse">Loading your photos...</p>
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="group overflow-hidden bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-orange-100">
                    <CardContent className="p-0">
                      <div 
                        className="aspect-[4/3] overflow-hidden relative cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <img 
                          src={photo.image_url} 
                          alt={photo.prompt || 'My photo'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 p-0.5 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                {user?.avatar_url ? (
                                  <img 
                                    src={user.avatar_url} 
                                    alt={user.username || 'Profile'} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-orange-500" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-orange-800">@{user?.username || 'user'}</p>
                              <div className="flex items-center text-orange-500 text-sm">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(photo.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-orange-600">
                            <Heart className="h-5 w-5 fill-red-500 text-red-500 transition-transform duration-300 group-hover:scale-110" />
                            <span className="font-medium">{photo.likes.length}</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-all duration-300"
                              >
                                <Share2 className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white rounded-xl shadow-xl border border-orange-100">
                              <DropdownMenuItem onClick={() => handleShare(photo, 'instagram')} className="flex items-center gap-2 py-2 cursor-pointer hover:bg-orange-50">
                                <Instagram className="h-4 w-4 text-pink-600" />
                                <span>Share to Instagram</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(photo, 'facebook')} className="flex items-center gap-2 py-2 cursor-pointer hover:bg-orange-50">
                                <Facebook className="h-4 w-4 text-blue-600" />
                                <span>Share to Facebook</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(photo, 'twitter')} className="flex items-center gap-2 py-2 cursor-pointer hover:bg-orange-50">
                                <Twitter className="h-4 w-4 text-blue-400" />
                                <span>Share to Twitter</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(photo, 'copy')} className="flex items-center gap-2 py-2 cursor-pointer hover:bg-orange-50">
                                <LinkIcon className="h-4 w-4 text-gray-600" />
                                <span>Copy Link</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="mb-6">
              <Camera className="h-16 w-16 text-orange-400 mx-auto mb-4" />
              <p className="text-xl text-orange-800 font-medium mb-2">No photos yet</p>
              <p className="text-orange-600 mb-8">Start your journey by completing a challenge!</p>
            </div>
            <Link to="/challenges">
              <Button 
                variant="default"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8"
              >
                Start a Challenge
              </Button>
            </Link>
          </motion.div>
        )}
      </main>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-5xl w-full bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="relative flex flex-col items-center">
                <div className="w-full h-[75vh] relative">
                  <img
                    src={selectedPhoto.image_url}
                    alt={selectedPhoto.prompt || 'Photo detail'}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50">
                      {user?.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.username || 'Profile'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-500">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">@{user?.username || 'user'}</h3>
                      <p className="text-orange-200">{formatDate(selectedPhoto.created_at)}</p>
                    </div>
                  </div>
                  <h2 className="text-white text-2xl font-bold mb-2">
                    {selectedPhoto.prompt || 'Untitled Photo'}
                  </h2>
                  {selectedPhoto.task && (
                    <p className="text-white/90 text-xl font-medium leading-relaxed">
                      {selectedPhoto.task}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default MyPhotos;
