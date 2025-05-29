import { Card, CardContent } from '@/components/ui/card';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const MyPhotos = () => {
  const myPhotos = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f",
      title: "LovelyFlower",
      date: "2024-06-01",
      likes: 100
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80",
      title: "DeviceBook", 
      date: "2024-05-31",
      likes: 100
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      title: "PeactyPaws",
      date: "2024-05-30",
      likes: 100
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1551024506-0bccd828d307",
      title: "DrinkBarEcho",
      date: "2024-05-29", 
      likes: 100
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1481833761820-0509d3217039",
      title: "BookOfMany",
      date: "2024-05-28",
      likes: 100
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b",
      title: "GyenHaboi",
      date: "2024-05-27",
      likes: 100
    }
  ];

  return (
    <div className="min-h-screen bg-[#FEF6E9]">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-orange-800 mb-4">My Photos</h1>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPhotos.map((photo) => (
            <Card key={photo.id} className="photo-card">
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
                      <span className="text-white text-sm font-bold">L</span>
                    </div>
                    <div>
                      <p className="font-semibold text-orange-800">LovelySummer</p>
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
      </main>

      <Footer />
    </div>
  );
};

export default MyPhotos;
