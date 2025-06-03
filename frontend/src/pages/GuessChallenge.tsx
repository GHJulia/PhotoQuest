import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Camera, Trophy, ArrowLeft, Check, Clock, Calendar, User } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { toast } from '../components/ui/sonner';
import api from '../lib/axios';

interface ChallengeData {
  id: string;
  image_url: string;
  prompt: string;
  choices: string[];
  correct_index: number;
  difficulty: string;
  points: number;
  created_at: string;
  author: string;
}

const GuessChallenge = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await api.get(`/challenge/guess/${id}`);
        setChallenge(response.data);
      } catch (error) {
        console.error('Error fetching challenge:', error);
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Error
            </div>
            <div className="text-sm text-gray-800">Failed to load challenge. Please try again.</div>
          </div>
        );
        navigate('/gallery');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [id, navigate]);

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
  const handleSubmit = async () => {
    if (!selectedAnswer || !challenge) return;

    // Log authentication info
    console.log('Token:', localStorage.getItem('token'));
    console.log('User:', localStorage.getItem('user'));

    // Validate selected answer index
    const selectedIndex = selectedAnswer.charCodeAt(0) - 97;
    if (selectedIndex < 0 || selectedIndex >= challenge.choices.length) {
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Error
          </div>
          <div className="text-sm text-gray-800">Invalid answer selected. Please try again.</div>
        </div>
      );
      return;
    }

    try {
      // Log request data
      const requestData = {
        challenge_id: challenge.id,
        selected_index: selectedIndex,
        email: JSON.parse(localStorage.getItem('user') || '{}').email
      };
      console.log('Submitting answer with data:', requestData);

      const response = await api.post('/challenge/guess/submit', requestData);
      console.log('Response:', response.data);

      setIsAnswerSubmitted(true);

      const isCorrect = response.data.is_correct;
      toast(
        <div className="flex flex-col gap-1">
          <div className={`flex items-center gap-2 font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'} text-base`}>
            <svg className={`w-5 h-5 ${isCorrect ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={isCorrect ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
            </svg>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </div>
          <div className="text-sm text-gray-800">
            {isCorrect ? `You earned ${challenge.points} points!` : 'Keep trying!'}
          </div>
        </div>
      );
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      // Handle specific error cases
      const errorMessage = error.response?.data?.error || 'Failed to submit answer. Please try again.';
      
      if (error.response?.status === 409) {
        // Already submitted case
        setIsAnswerSubmitted(true);
      }
      
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Error
          </div>
          <div className="text-sm text-gray-800">{errorMessage}</div>
        </div>
      );
    }
  };

  // Get next challenge
  const handleNextChallenge = () => {
    navigate('/gallery');
  };

  // Option color mapping
  const optionColors = {
    a: 'bg-blue-500 hover:bg-blue-600',
    b: 'bg-emerald-500 hover:bg-emerald-600',
    c: 'bg-yellow-500 hover:bg-yellow-600',
    d: 'bg-pink-500 hover:bg-pink-600'
  };

  if (loading || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FEF6E9] to-white">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-orange-200 rounded w-48 mx-auto mb-4"></div>
              <div className="h-64 bg-orange-100 rounded-lg mb-4"></div>
              <div className="h-8 bg-orange-200 rounded w-full mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-orange-100 rounded"></div>
                <div className="h-16 bg-orange-100 rounded"></div>
                <div className="h-16 bg-orange-100 rounded"></div>
                <div className="h-16 bg-orange-100 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDateTime = formatDate(challenge.created_at);

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
                src={challenge.image_url}
                alt="Challenge"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                  challenge.difficulty.toLowerCase() === 'easy'
                    ? 'bg-green-500' 
                    : challenge.difficulty.toLowerCase() === 'medium'
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
                {challenge.prompt}
              </h2>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {challenge.choices.map((choice, index) => {
                  const optionId = String.fromCharCode(97 + index);
                  const isCorrect = index === challenge.correct_index;
                  return (
                  <motion.button
                      key={optionId}
                      onClick={() => handleAnswerSelect(optionId)}
                    className={`
                      relative
                        ${optionColors[optionId as keyof typeof optionColors]}
                        ${selectedAnswer === optionId ? 'ring-4 ring-white ring-offset-2 shadow-lg scale-[1.02]' : ''}
                        ${isAnswerSubmitted && isCorrect ? 'bg-green-500 hover:bg-green-600' : ''}
                        ${isAnswerSubmitted && selectedAnswer === optionId && !isCorrect ? 'bg-red-500 hover:bg-red-600' : ''}
                      text-white p-6 rounded-xl text-lg font-medium text-center w-full transition-all duration-200
                      transform hover:scale-[1.02] hover:shadow-lg
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isAnswerSubmitted}
                  >
                    {/* Option Text */}
                    <div className="relative">
                        {choice}
                      
                      {/* Selected Indicator */}
                        {selectedAnswer === optionId && !isAnswerSubmitted && (
                        <div className="absolute -right-2 -top-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Check className="h-5 w-5 text-orange-500" />
                        </div>
                      )}
                    </div>

                    {/* Result Indicators */}
                    {isAnswerSubmitted && (
                      <div className="mt-2 text-sm font-medium">
                          {isCorrect && (
                          <span className="flex items-center justify-center gap-1">
                            <Check className="h-4 w-4" />
                            Correct Answer
                          </span>
                        )}
                          {selectedAnswer === optionId && !isCorrect && (
                          <span>✗ Incorrect</span>
                        )}
                      </div>
                    )}
                  </motion.button>
                  );
                })}
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
                    challenge.correct_index === (selectedAnswer ? selectedAnswer.charCodeAt(0) - 97 : -1)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {challenge.correct_index === (selectedAnswer ? selectedAnswer.charCodeAt(0) - 97 : -1)
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