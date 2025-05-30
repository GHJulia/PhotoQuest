import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const MyPhotos = () => {
  const handleShare = async (photo: any) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: photo.title,
          text: photo.description,
          url: window.location.href
        });
      } else {
        // Fallback to copying link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "The photo link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Sharing failed",
        description: "Could not share the photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const myPhotos = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f",
      title: "Morning Sunflower",
      description: "A beautiful sunflower basking in the morning light",
      date: "2024-03-15T08:30:00Z",
      likes: 156,
      location: "Garden Park"
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80",
      title: "Workspace Harmony",
      description: "Modern workspace setup with natural lighting",
      date: "2024-03-14T15:45:00Z",
      likes: 142,
      location: "Home Office"
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      title: "Mountain Majesty",
      description: "Breathtaking view of mountain peaks at sunset",
      date: "2024-03-13T17:20:00Z",
      likes: 189,
      location: "Mountain Range"
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1551024506-0bccd828d307",
      title: "Urban Vibes",
      description: "City life captured in a single moment",
      date: "2024-03-12T12:10:00Z",
      likes: 167,
      location: "Downtown"
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1481833761820-0509d3217039",
      title: "Reading Corner",
      description: "Cozy reading spot with vintage books",
      date: "2024-03-11T09:15:00Z",
      likes: 134,
      location: "Library"
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b",
      title: "Culinary Delight",
      description: "Homemade pizza with fresh ingredients",
      date: "2024-03-10T19:30:00Z",
      likes: 178,
      location: "Kitchen"
    }
  ];

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
    <div className="min-h-screen bg-gradient-to-b from-[#FEF6E9] to-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-orange-800 mb-2">My Photos</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPhotos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="group overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img 
                      src={photo.src} 
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <h3 className="text-white font-semibold text-lg mb-1">{photo.title}</h3>
                      <p className="text-white/80 text-sm line-clamp-2">{photo.description}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {photo.title[0]}
                        </div>
                        <div>
                          <p className="font-medium text-orange-800">{photo.location}</p>
                          <div className="flex items-center text-orange-500 text-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(photo.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-orange-600">
                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                        <span className="font-medium">{photo.likes}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-orange-600 hover:text-orange-700"
                        onClick={() => handleShare(photo)}
                      >
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyPhotos;
