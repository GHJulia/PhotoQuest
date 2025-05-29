
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Search, Trophy, Share2, X } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPlayModal = ({ isOpen, onClose }: HowToPlayModalProps) => {
  if (!isOpen) return null;

  const steps = [
    {
      icon: <Camera className="h-8 w-8 text-orange-600" />,
      title: "1. Get a Prompt & Capture the Moment",
      description: 'Hit "Roll Challenge" to receive a randomized photo prompt. Then, unleash your creativity and snap a photo that brings the prompt to life.'
    },
    {
      icon: <Search className="h-8 w-8 text-orange-600" />,
      title: "2. Guess Other Players' Prompts Behind Each of Their Photos",
      description: "Explore photos submitted by other players and try to guess the prompt from four options. Score 10 points for each correct answer!"
    },
    {
      icon: <Trophy className="h-8 w-8 text-orange-600" />,
      title: "3. Climb Up the Leaderboard",
      description: "Earn 10 points whenever you guess the prompts correctly. Rack up points and rise through the ranks on the leaderboard."
    },
    {
      icon: <Share2 className="h-8 w-8 text-orange-600" />,
      title: "4. Share Your Photos",
      description: "Showcase your photos on social media to your fellow friends."
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="auth-card max-w-2xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="absolute right-4 top-4 text-white hover:text-orange-200"
          >
            <X className="h-5 w-5" />
          </Button>
          <CardTitle className="text-2xl font-bold text-white text-center">How to Play Photo Quest</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="bg-orange-300 rounded-xl p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-800 mb-2">{step.title}</h3>
                    <p className="text-orange-700">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button className="w-full game-button mt-6" onClick={onClose}>
            <Camera className="mr-2 h-5 w-5" />
            Start Playing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HowToPlayModal;
