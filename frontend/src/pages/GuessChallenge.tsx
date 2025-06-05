import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Camera, Trophy, ArrowLeft, Check, Clock, Calendar, User, ZoomIn, X, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [submitting, setSubmitting] = useState(false);
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [selectedImage, setSelectedImage] = useState<ChallengeData | null>(null);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    points: number;
    message: string;
    answer: string;
    correctAnswer: string;
  } | null>(null);

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
              <X className="w-5 h-5 text-red-500" />
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
    if (!isAnswerSubmitted && !submitting) {
      setSelectedAnswer(optionId);
    }
  };

  // Handle answer submission
  const handleSubmit = async () => {
    if (!selectedAnswer || !challenge || submitting) return;

    try {
      setSubmitting(true);

      // Get user data and validate
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
              <X className="w-5 h-5 text-red-500" />
              Error
            </div>
            <div className="text-sm text-gray-800">
              Please log in to submit your answer
            </div>
          </div>
        );
        navigate('/login');
        return;
      }

      const user = JSON.parse(userData);
      if (!user.email) {
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
              <X className="w-5 h-5 text-red-500" />
              Error
            </div>
            <div className="text-sm text-gray-800">
              Invalid user data. Please log in again
            </div>
          </div>
        );
        navigate('/login');
        return;
      }

      const submitData = {
        challenge_id: challenge.id,
        selected_index: selectedAnswer.charCodeAt(0) - 97,
        email: user.email
      };

      const response = await api.post('/challenge/guess/submit', submitData);

      setIsAnswerSubmitted(true);
      setResult({
        isCorrect: response.data.is_correct,
        points: response.data.points,
        message: response.data.message,
        answer: response.data.answer,
        correctAnswer: response.data.correct_answer
      });

      toast(
        <div className="flex flex-col gap-1">
          <div className={`flex items-center gap-2 font-semibold ${response.data.is_correct ? 'text-green-700' : 'text-red-700'} text-base`}>
            {response.data.is_correct ? (
              <Sparkles className="w-5 h-5 text-yellow-500" />
            ) : (
              <X className="w-5 h-5 text-red-500" />
            )}
            {response.data.message}
          </div>
          <div className="text-sm text-gray-800">
            {response.data.is_correct 
              ? `You earned ${response.data.points} points!` 
              : `The correct answer was: ${response.data.correct_answer}`}
          </div>
        </div>
      );
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <X className="w-5 h-5 text-red-500" />
            Error
          </div>
          <div className="text-sm text-gray-800">
            {error.response?.data?.error || 'Failed to submit answer. Please try again.'}
          </div>
        </div>
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Get next challenge
  const handleNextChallenge = () => {
    navigate('/gallery');
  };

  // Option color mapping with updated colors
  const optionColors = {
    a: 'from-blue-500 to-blue-600',
    b: 'from-emerald-500 to-emerald-600',
    c: 'from-amber-500 to-amber-600',
    d: 'from-rose-500 to-rose-600'
  };

  // Function to handle image click for lightbox
  const handleImageClick = () => {
    if (challenge) {
      setSelectedImage(challenge);
      document.body.style.overflow = 'hidden';
    }
  };

  // Function to close lightbox
  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
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
    <div className="min-h-screen bg-gradient-to-b from-[#FEF6E9] via-orange-50 to-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-between"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/gallery')}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100/80 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Gallery
            </Button>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg backdrop-blur-sm ${
                challenge.difficulty.toLowerCase() === 'easy'
                  ? 'bg-green-500/90' 
                  : challenge.difficulty.toLowerCase() === 'medium'
                  ? 'bg-yellow-500/90'
                  : 'bg-red-500/90'
              }`}>
                {challenge.difficulty}
              </span>
              <span className="bg-orange-500/90 backdrop-blur-sm shadow-lg text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                {challenge.points} Points
              </span>
            </div>
          </motion.div>

          {/* Challenge Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-orange-100">
              {/* Challenge Image */}
              <div 
                className="relative h-[500px] w-full group cursor-pointer overflow-hidden" 
                onClick={handleImageClick}
              >
                <motion.img
                  src={challenge.image_url}
                  alt="Challenge"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                />

                {/* Zoom Indicator Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="w-12 h-12 text-white transform scale-75 group-hover:scale-100 transition-all duration-300" />
                </div>

                {/* Date and Author Info with Gradient Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-4">
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
                  </motion.div>
                </div>
              </div>

              <CardContent className="p-8">
                {/* Question */}
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl font-bold text-orange-800 mb-8"
                >
                  {challenge.prompt}
                </motion.h2>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {challenge.choices.map((choice, index) => {
                    const optionId = String.fromCharCode(97 + index);
                    const isCorrect = index === challenge.correct_index;
                    return (
                      <motion.button
                        key={optionId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        onClick={() => handleAnswerSelect(optionId)}
                        className={`
                          relative bg-gradient-to-r
                          ${optionColors[optionId as keyof typeof optionColors]}
                          ${selectedAnswer === optionId ? 'ring-4 ring-white ring-offset-2 shadow-lg scale-[1.02]' : ''}
                          ${isAnswerSubmitted && isCorrect ? 'from-green-500 to-green-600' : ''}
                          ${isAnswerSubmitted && selectedAnswer === optionId && !isCorrect ? 'from-red-500 to-red-600' : ''}
                          text-white p-6 rounded-xl text-lg font-medium text-center w-full transition-all duration-300
                          transform hover:scale-[1.02] hover:shadow-lg hover:-translate-y-1
                          disabled:opacity-75 disabled:cursor-not-allowed
                        `}
                        disabled={isAnswerSubmitted}
                      >
                        {/* Option Text */}
                        <div className="relative">
                          {choice}
                          
                          {/* Selected Indicator */}
                          <AnimatePresence>
                            {selectedAnswer === optionId && !isAnswerSubmitted && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -right-2 -top-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                              >
                                <Check className="h-5 w-5 text-orange-500" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Result Indicators */}
                        <AnimatePresence>
                          {isAnswerSubmitted && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-2 text-sm font-medium"
                            >
                              {isCorrect && (
                                <span className="flex items-center justify-center gap-1">
                                  <Sparkles className="h-4 w-4" />
                                  Correct Answer
                                </span>
                              )}
                              {selectedAnswer === optionId && !isCorrect && (
                                <span className="flex items-center justify-center gap-1">
                                  <X className="h-4 w-4" />
                                  Incorrect
                                </span>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Submit/Next Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  {!isAnswerSubmitted ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={!selectedAnswer || submitting}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg py-6 rounded-xl disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </div>
                      ) : (
                        'Submit Answer'
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextChallenge}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg py-6 rounded-xl transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg"
                    >
                      Try Another Challenge
                    </Button>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-7xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="absolute -top-12 right-0 text-white hover:text-orange-400 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <motion.img
                src={selectedImage.image_url}
                alt="Challenge"
                className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
              />
              <motion.div 
                className="mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-4 mb-2">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{selectedImage.author}</h3>
                    <p className="text-orange-300 text-sm">
                      {formatDate(selectedImage.created_at).date} at {formatDate(selectedImage.created_at).time}
                    </p>
                  </div>
                </div>
                {selectedImage.prompt && (
                  <p className="text-white/90 text-center max-w-2xl mx-auto">{selectedImage.prompt}</p>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default GuessChallenge; 