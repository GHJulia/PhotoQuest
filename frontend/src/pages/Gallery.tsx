import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Gallery = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  const photos = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f",
      title: "LovelyFlower",
      author: "LovelyGamer",
      date: "2024-06-01",
      score: 100,
      likes: 100
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80",
      title: "DeviceBook", 
      author: "BunnyBlush",
      date: "2024-05-31",
      score: 100,
      likes: 100
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      title: "PeactyPaws",
      author: "PeactyPaws", 
      date: "2024-05-30",
      score: 100,
      likes: 100
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1551024506-0bccd828d307",
      title: "DrinkBarEcho",
      author: "StrawberryJam",
      date: "2024-05-29", 
      score: 100,
      likes: 100
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1481833761820-0509d3217039",
      title: "BookOfMany",
      author: "SweetHoney",
      date: "2024-05-28",
      score: 100,
      likes: 100
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b",
      title: "GyenHaboi",
      author: "GyenHaboi",
      date: "2024-05-27",
      score: 100,
      likes: 100
    }
  ];

  return (
    <div className="min-h-screen bg-[#FEF6E9]">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-orange-800 mb-4">Photo Gallery</h1>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <Card key={photo.id} className="photo-card cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden rounded-t-xl">
                  <img 
                    src={photo.src} 
                    alt={photo.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {photo.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-orange-800">{photo.author}</p>
                      <p className="text-sm text-orange-600">{photo.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500 fill-current" />
                      <span className="text-orange-700 font-medium">{photo.likes}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Photo Detail Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPhoto(null)}>
            <Card className="auth-card max-w-2xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <CardContent className="p-0">
                <div className="flex justify-between items-center p-4 pb-0">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {selectedPhoto.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{selectedPhoto.author}</p>
                      <p className="text-sm text-orange-100">{selectedPhoto.date}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedPhoto(null)}
                    className="text-white hover:text-orange-200"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="p-4">
                  <img 
                    src={selectedPhoto.src} 
                    alt={selectedPhoto.title}
                    className="w-full aspect-square object-cover rounded-lg mb-4"
                  />
                  
                  <h3 className="text-xl font-bold text-white mb-4">{selectedPhoto.title}</h3>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Badge className="bg-red-400 hover:bg-red-500 text-white justify-center">Red Carnations</Badge>
                    <Badge className="bg-green-500 hover:bg-green-600 text-white justify-center">Red Roses</Badge>
                    <Badge className="bg-red-400 hover:bg-red-500 text-white justify-center">Red Tulips</Badge>
                    <Badge className="bg-red-400 hover:bg-red-500 text-white justify-center">Red Geranium</Badge>
                  </div>
                  
                  <Button className="w-full game-button mb-4">
                    Submit
                  </Button>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                      <span className="text-white font-medium">{selectedPhoto.likes}</span>
                    </div>
                    <span className="text-white">Score: +10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Gallery;
