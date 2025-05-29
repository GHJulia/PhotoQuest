import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Trophy, ArrowLeft, Check, Clock, Calendar, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const GuessChallenge = () => {
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // Mock data - in a real app, this would come from an API
  const challenge = {
    id: 1,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
    question: 'What was the main inspiration for this photo?',
    options: [
      { id: 'a', text: 'Urban Architecture', isCorrect: true },
      { id: 'b', text: 'Natural Patterns' },
      { id: 'c', text: 'Street Life' },
      { id: 'd', text: 'Modern Art' }
    ],
    difficulty: 'Medium',
    points: 100,
    createdAt: '2024-03-15T14:30:00Z', // ISO date string
    author: 'John Doe'
  };

  // Format date to elegant English format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    // Add ordinal suffix to day
    const ordinal = (n: number) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return {
      date: `${ordinal(day)} ${month} ${year}`,
      time: `${hours}:${minutes}`
    };
  };

  // Handle answer selection
  const handleAnswerSelect = (optionId: string) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(optionId);
    }
  };

  // Handle answer submission
  const handleSubmit = () => {
    if (selectedAnswer) {
      setIsAnswerSubmitted(true);
      // In a real app, you would make an API call here
    }
  };

  // Get next challenge
  const handleNextChallenge = () => {
    // In a real app, you would fetch the next challenge
    navigate('/gallery');
  };

  // Option color mapping
  const optionColors = {
    a: 'bg-blue-500 hover:bg-blue-600',
    b: 'bg-emerald-500 hover:bg-emerald-600',
    c: 'bg-yellow-500 hover:bg-yellow-600',
    d: 'bg-pink-500 hover:bg-pink-600'
  };

  const formattedDateTime = formatDate(challenge.createdAt);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FEF6E9] to-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/gallery')}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Gallery
            </Button>
          </div>

          {/* Challenge Card */}
          <Card className="bg-white shadow-xl rounded-2xl overflow-hidden">
            {/* Challenge Image */}
            <div className="relative h-[400px] w-full group">
              <img
                src={challenge.image}
                alt="Challenge"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                  challenge.difficulty === 'Easy' 
                    ? 'bg-green-500' 
                    : challenge.difficulty === 'Medium'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}>
                  {challenge.difficulty}
                </span>
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  {challenge.points}
                </span>
              </div>

              {/* Date and Author Info with Gradient Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 transform translate-y-0 transition-transform group-hover:translate-y-0">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-300" />
                      <span className="text-white font-medium">{formattedDateTime.date}</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-300" />
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-300" />
                      <span className="text-white">{formattedDateTime.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-orange-300" />
                    <span className="text-white">Created by <span className="font-medium text-orange-300">{challenge.author}</span></span>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              {/* Question */}
              <h2 className="text-2xl font-bold text-orange-800 mb-6">
                {challenge.question}
              </h2>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {challenge.options.map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    className={`
                      relative
                      ${optionColors[option.id as keyof typeof optionColors]}
                      ${selectedAnswer === option.id ? 'ring-4 ring-white ring-offset-2 shadow-lg scale-[1.02]' : ''}
                      ${isAnswerSubmitted && option.isCorrect ? 'bg-green-500 hover:bg-green-600' : ''}
                      ${isAnswerSubmitted && selectedAnswer === option.id && !option.isCorrect ? 'bg-red-500 hover:bg-red-600' : ''}
                      text-white p-6 rounded-xl text-lg font-medium text-center w-full transition-all duration-200
                      transform hover:scale-[1.02] hover:shadow-lg
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isAnswerSubmitted}
                  >
                    {/* Option Text */}
                    <div className="relative">
                      {option.text}
                      
                      {/* Selected Indicator */}
                      {selectedAnswer === option.id && !isAnswerSubmitted && (
                        <div className="absolute -right-2 -top-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Check className="h-5 w-5 text-orange-500" />
                        </div>
                      )}
                    </div>

                    {/* Result Indicators */}
                    {isAnswerSubmitted && (
                      <div className="mt-2 text-sm font-medium">
                        {option.isCorrect && (
                          <span className="flex items-center justify-center gap-1">
                            <Check className="h-4 w-4" />
                            Correct Answer
                          </span>
                        )}
                        {selectedAnswer === option.id && !option.isCorrect && (
                          <span>✗ Incorrect</span>
                        )}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Submit/Next Button */}
              {!isAnswerSubmitted ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 rounded-xl disabled:opacity-50"
                >
                  Submit Answer
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg text-center ${
                    challenge.options.find(opt => opt.id === selectedAnswer)?.isCorrect
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {challenge.options.find(opt => opt.id === selectedAnswer)?.isCorrect
                      ? `🎉 Congratulations! You earned ${challenge.points} points!`
                      : '😔 Not quite right. Keep trying!'}
                  </div>
                  <Button
                    onClick={handleNextChallenge}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 rounded-xl"
                  >
                    Next Challenge
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GuessChallenge; 