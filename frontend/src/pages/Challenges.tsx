import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Trophy, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Challenges = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [randomChallenge, setRandomChallenge] = useState<any | null>(null);

  const challenges = [
    // Easy Challenges
    {
      id: 1,
      title: "Golden Hour Portrait",
      description: "Capture a stunning portrait during golden hour with natural lighting",
      difficulty: "Easy",
      points: 100,
      color: "bg-green-500"
    },
    {
      id: 2,
      title: "Urban Lines",
      description: "Find and photograph interesting straight lines in urban architecture",
      difficulty: "Easy",
      points: 100,
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "Nature's Colors",
      description: "Capture the vibrant colors of flowers or plants in your surroundings",
      difficulty: "Easy",
      points: 100,
      color: "bg-green-500"
    },
    {
      id: 4,
      title: "Shadow Play",
      description: "Create interesting compositions using natural shadows",
      difficulty: "Easy",
      points: 100,
      color: "bg-green-500"
    },
    {
      id: 5,
      title: "Street Life",
      description: "Document everyday life scenes in your neighborhood",
      difficulty: "Easy",
      points: 100,
      color: "bg-green-500"
    },

    // Medium Challenges
    {
      id: 6,
      title: "Urban Architecture",
      description: "Find and capture complex geometric patterns in city buildings",
      difficulty: "Medium",
      points: 100,
      color: "bg-yellow-500"
    },
    {
      id: 7,
      title: "Motion Blur",
      description: "Experiment with slow shutter speeds to create artistic motion blur",
      difficulty: "Medium",
      points: 100,
      color: "bg-yellow-500"
    },
    {
      id: 8,
      title: "Night Lights",
      description: "Capture the city lights and neon signs after dark",
      difficulty: "Medium",
      points: 100,
      color: "bg-yellow-500"
    },
    {
      id: 9,
      title: "Reflections",
      description: "Find and photograph interesting reflections in water or glass",
      difficulty: "Medium",
      points: 100,
      color: "bg-yellow-500"
    },
    {
      id: 10,
      title: "Street Portrait",
      description: "Capture candid portraits of people in urban settings",
      difficulty: "Medium",
      points: 100,
      color: "bg-yellow-500"
    },

    // Hard Challenges
    {
      id: 11,
      title: "Wildlife in Motion",
      description: "Capture sharp photos of animals in their natural behavior",
      difficulty: "Hard",
      points: 100,
      color: "bg-red-500"
    },
    {
      id: 12,
      title: "Star Trails",
      description: "Create long exposure photographs of star movements at night",
      difficulty: "Hard",
      points: 100,
      color: "bg-red-500"
    },
    {
      id: 13,
      title: "Double Exposure",
      description: "Create an artistic double exposure effect in-camera",
      difficulty: "Hard",
      points: 100,
      color: "bg-red-500"
    },
    {
      id: 14,
      title: "Macro Details",
      description: "Capture extreme close-up shots of tiny subjects",
      difficulty: "Hard",
      points: 100,
      color: "bg-red-500"
    },
    {
      id: 15,
      title: "Light Painting",
      description: "Create artistic photos using light painting techniques",
      difficulty: "Hard",
      points: 100,
      color: "bg-red-500"
    }
  ];

  const handleDifficultySelect = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    setRandomChallenge(null);
  };

  const getRandomChallenge = () => {
    const filteredChallenges = selectedDifficulty 
      ? challenges.filter(c => c.difficulty === selectedDifficulty)
      : challenges;
    
    const randomIndex = Math.floor(Math.random() * filteredChallenges.length);
    setRandomChallenge(filteredChallenges[randomIndex]);
  };

  return (
    <div className="min-h-screen bg-[#FEF6E9] flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-orange-800 mb-2">
              Daily Challenges
            </h1>
            <p className="text-orange-700">
              Complete challenges to earn points and climb the leaderboard
            </p>
        </div>

        {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
            <Card className="bg-orange-100 border-orange-200 max-w-sm mx-auto w-full">
            <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mb-3">
                <Trophy className="w-6 h-6 text-orange-600" />
              </div>
                <h3 className="font-bold text-orange-800 text-lg mb-1">Today's Progress</h3>
                <p className="text-2xl font-bold text-orange-600 mb-1">2/5</p>
                <p className="text-orange-600 text-sm">Challenges completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Difficulty Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge 
              className={`${
                selectedDifficulty === 'Easy' 
                  ? 'ring-2 ring-green-400 bg-green-100 text-green-700' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              } px-6 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200`}
              onClick={() => handleDifficultySelect('Easy')}
            >
              Easy (100 pts)
          </Badge>
            <Badge 
              className={`${
                selectedDifficulty === 'Medium' 
                  ? 'ring-2 ring-yellow-400 bg-yellow-100 text-yellow-700' 
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              } px-6 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200`}
              onClick={() => handleDifficultySelect('Medium')}
            >
              Medium (100 pts)
          </Badge>
            <Badge 
              className={`${
                selectedDifficulty === 'Hard' 
                  ? 'ring-2 ring-red-400 bg-red-100 text-red-700' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              } px-6 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200`}
              onClick={() => handleDifficultySelect('Hard')}
            >
              Hard (100 pts)
          </Badge>
        </div>

        {/* Challenge Cards */}
          <div className="space-y-6 mb-8">
            {randomChallenge && (
              <Card className="bg-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-16 h-16 bg-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Camera className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-xl font-bold text-orange-800">{randomChallenge.title}</h2>
                          <Badge className={`${randomChallenge.color} text-white px-2 py-1 text-xs font-medium`}>
                            {randomChallenge.difficulty}
                        </Badge>
                      </div>
                        <p className="text-orange-700 text-sm mb-3">{randomChallenge.description}</p>
                        <div className="flex items-center text-sm text-orange-600">
                          <Trophy className="w-4 h-4 mr-1" />
                          <span>{randomChallenge.points} points</span>
                      </div>
                    </div>
                  </div>
                  
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full md:w-auto">
                      <Link to={`/challenges/create?difficulty=${randomChallenge.difficulty}`} className="flex items-center justify-center gap-2">
                        <Camera className="w-4 h-4" />
                      Accept Challenge
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}
        </div>

        {/* Random Challenge Generator */}
        <div className="text-center">
            <Card className={`bg-orange-100 border-orange-200 max-w-lg mx-auto ${!randomChallenge ? 'mt-8' : ''}`}>
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6 text-orange-600" />
              </div>
                <h3 className="text-xl font-bold text-orange-800 mb-2">Feeling Lucky?</h3>
                <p className="text-orange-700 text-sm mb-4">
                  {selectedDifficulty 
                    ? `Get a random ${selectedDifficulty} challenge`
                    : 'Get a random challenge tailored to your skill level'}
                </p>
                <Button 
                  onClick={getRandomChallenge}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Camera className="mr-2 h-4 w-4" />
                Random Challenge
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Challenges;
