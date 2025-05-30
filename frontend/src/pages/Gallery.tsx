import { useState } from 'react';
import { Heart, Trophy, Camera, Share2, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Gallery = () => {
  const [likedPhotos, setLikedPhotos] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLike = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedPhotos(prev => 
      prev.includes(id) ? prev.filter(photoId => photoId !== id) : [...prev, id]
    );
  };

  const handleShare = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Sharing photo:', id);
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

  const photos = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      prompt: "Golden Hour Magic",
      photographer: "Alex Chen",
      profilePic: "https://images.unsplash.com/profile-1577912636186-c3c7cdb37c8cimage",
      likes: 142,
      points: 100,
      guessedCorrectly: true,
      timestamp: "2024-03-15T14:30:00Z"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
      prompt: "Street Photography",
      photographer: "Maria Rodriguez",
      profilePic: "https://images.unsplash.com/profile-1577912636186-c3c7cdb37c8cimage",
      likes: 89,
      points: 100,
      guessedCorrectly: false,
      timestamp: "2024-03-15T12:15:00Z"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
      prompt: "Macro World",
      photographer: "David Kim",
      profilePic: "https://images.unsplash.com/profile-1577912636186-c3c7cdb37c8cimage",
      likes: 203,
      points: 100,
      guessedCorrectly: true,
      timestamp: "2024-03-15T10:45:00Z"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9",
      prompt: "Black & White Classic",
      photographer: "Sarah Johnson",
      profilePic: "https://images.unsplash.com/profile-1577912636186-c3c7cdb37c8cimage",
      likes: 156,
      points: 100,
      guessedCorrectly: false,
      timestamp: "2024-03-15T09:20:00Z"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786",
      prompt: "Portrait Perfection",
      photographer: "Mike Zhang",
      profilePic: "https://images.unsplash.com/profile-1577912636186-c3c7cdb37c8cimage",
      likes: 178,
      points: 100,
      guessedCorrectly: true,
      timestamp: "2024-03-15T08:05:00Z"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
      prompt: "Nature's Symphony",
      photographer: "Emma Wilson",
      profilePic: "https://images.unsplash.com/profile-1577912636186-c3c7cdb37c8cimage",
      likes: 234,
      points: 100,
      guessedCorrectly: false,
      timestamp: "2024-03-15T07:30:00Z"
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      prompt: "Urban Exploration",
      photographer: "Carlos Martinez",
      profilePic: "https://images.unsplash.com/profile-1577912636186-c3c7cdb37c8cimage",
      likes: 167,
      points: 100,
      guessedCorrectly: true,
      timestamp: "2024-03-15T06:15:00Z"
    },
    {
      id: 8,
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      prompt: "Competition Spirit",
      photographer: "Lisa Park",
      profilePic: "https://images.unsplash.com/profile-1577912636186-c3c7cdb37c8cimage",
      likes: 198,
      points: 100,
      guessedCorrectly: false,
      timestamp: "2024-03-15T05:45:00Z"
    }
  ];

  const filteredPhotos = photos.filter(photo =>
    photo.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photo.photographer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPhotos.map((photo) => (
            <div 
              key={photo.id} 
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={photo.image} 
                    alt={photo.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={photo.profilePic} 
                    alt={photo.photographer}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-orange-800 text-sm truncate">
                      {photo.photographer}
                    </h3>
                    <div className="flex items-center text-xs text-orange-500">
                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{formatDate(photo.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 font-medium">
                  {photo.prompt}
                </p>
                
                <div className="flex items-center justify-between pt-3 border-t border-orange-100">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={(e) => handleLike(photo.id, e)}
                      className="flex items-center space-x-1.5 hover:text-red-500 transition-colors group/like"
                    >
                      <Heart 
                        className={`h-5 w-5 transition-all duration-300 ${
                          likedPhotos.includes(photo.id) 
                            ? 'fill-red-500 text-red-500 scale-110' 
                            : 'group-hover/like:scale-110'
                        }`} 
                      />
                      <span className="font-medium">{photo.likes}</span>
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
                    {photo.points}
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
          ))}
        </div>

        {filteredPhotos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-orange-600">No photos found matching your search.</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Gallery;
