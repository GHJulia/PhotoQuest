import { Button } from '@/components/ui/button';
import { Camera, Trophy, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#FEF6E9]">
      <Navigation />
      
        {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-orange-800">
            Transform photography into an exciting game!
          </h1>
            <p className="text-lg text-orange-700">
            Get creative with random photo prompts, guess what inspired others' shots, and rack up points as you play.
          </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
                <Link to="/challenges" className="flex items-center">
                <Camera className="mr-2 h-5 w-5" />
                Start Playing
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-orange-500 text-orange-700 hover:bg-orange-50">
              <Link to="/how-to-play" className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Learn How To Play
              </Link>
            </Button>
          </div>
        </div>
          <div className="grid grid-cols-2 gap-4">
            <img 
              src="https://cdn.pixabay.com/photo/2018/11/09/08/08/forest-3804001_1280.jpg" 
              alt="Misty forest landscape" 
              className="rounded-lg w-full h-48 object-cover" 
            />
            <img 
              src="https://cdn.pixabay.com/photo/2015/12/01/20/28/road-1072821_1280.jpg" 
              alt="Foggy forest road" 
              className="rounded-lg w-full h-48 object-cover mt-8" 
            />
            <img 
              src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg" 
              alt="Tree silhouette at sunset" 
              className="rounded-lg w-full h-48 object-cover" 
            />
              <img 
              src="https://cdn.pixabay.com/photo/2015/12/01/20/28/forest-1072828_1280.jpg" 
              alt="Autumn forest path" 
              className="rounded-lg w-full h-48 object-cover mt-8" 
              />
            </div>
        </div>
      </section>

      {/* Random Question Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://cdn.pixabay.com/photo/2016/01/09/18/27/camera-1130731_1280.jpg" 
                alt="Vintage camera in nature" 
                className="rounded-lg w-full h-40 object-cover" 
              />
              <img 
                src="https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_1280.jpg" 
                alt="Photography journal" 
                className="rounded-lg w-full h-40 object-cover mt-8" 
              />
              <img 
                src="https://cdn.pixabay.com/photo/2016/03/26/13/09/workspace-1280538_1280.jpg" 
                alt="Photography workspace" 
                className="rounded-lg w-full col-span-2 h-48 object-cover" 
                />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-orange-800">
                Random question, shoot directly to the target
              </h2>
              <p className="text-lg text-orange-700">
                Take photos with intent, practice your ideas and challenge your misunderstanding!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section className="py-16 bg-[#FEF6E9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-orange-800">
                Collection of works that inspire
              </h2>
              <p className="text-lg text-orange-700">
                Show your photography work, view photos from different challenges, like, share, and create new inspirations
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://cdn.pixabay.com/photo/2017/02/01/22/02/mountain-landscape-2031539_1280.jpg" 
                alt="Mountain sunset" 
                className="rounded-lg w-full h-40 object-cover" 
              />
              <img 
                src="https://cdn.pixabay.com/photo/2014/09/07/22/17/forest-438432_1280.jpg" 
                alt="Mystical forest path" 
                className="rounded-lg w-full h-40 object-cover" 
              />
              <img 
                src="https://cdn.pixabay.com/photo/2016/11/06/05/36/lake-1802337_1280.jpg" 
                alt="Foggy lake sunrise" 
                className="rounded-lg w-full h-40 object-cover" 
              />
              <img 
                src="https://cdn.pixabay.com/photo/2015/12/01/20/28/forest-1072823_1280.jpg" 
                alt="Autumn forest mist" 
                className="rounded-lg w-full h-40 object-cover" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <img 
              src="https://cdn.pixabay.com/photo/2015/01/09/11/08/startup-594090_1280.jpg" 
              alt="Achievement concept" 
              className="w-full max-w-md mx-auto rounded-lg shadow-lg" 
            />
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-orange-800">
                Compete to be number one on the leaderboard!
              </h2>
              <p className="text-lg text-orange-700">
                Compete for points, prove yourself at the top, and earn points by guessing and shooting!
              </p>
              <div className="flex gap-4">
                <img 
                  src="https://cdn.pixabay.com/photo/2016/11/30/20/58/programming-1873854_1280.png"
                  alt="Competition" 
                  className="w-24 h-24 object-contain" 
                />
                <img 
                  src="https://cdn.pixabay.com/photo/2017/01/28/11/43/cup-2015198_1280.png" 
                  alt="Trophy" 
                  className="w-24 h-24 object-contain" 
                />
          </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
