import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Camera, Trophy, Zap, AlertCircle, Sparkles, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { toast } from '../components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/axios';

interface Challenge {
  prompt: string;
  mode: string;
}

interface ChallengeStatus {
  daily_challenges: number;
  max_challenges: number;
  remaining_challenges: number;
  is_reset: boolean;
}

const Challenges = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [randomChallenge, setRandomChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [challengeStatus, setChallengeStatus] = useState<ChallengeStatus | null>(null);
  const navigate = useNavigate();

  // Get user email from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user.email || '';

  // Fetch user's challenge status
  const fetchChallengeStatus = useCallback(async (showToast = false) => {
    if (!userEmail) return;

    try {
      const response = await api.get(`/challenge/status?email=${userEmail}`);
      const newStatus = response.data;

      // Update state only if data has changed
      setChallengeStatus(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newStatus)) {
          if (showToast) {
            toast(
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Status Updated
                </div>
                <div className="text-sm text-gray-800">
                  You have completed {newStatus.daily_challenges} challenges today
                </div>
              </div>
            );
          }
          return newStatus;
        }
        return prev;
      });

    } catch (error) {
      if (showToast) {
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
              <AlertCircle className="w-5 h-5" />
              Error
            </div>
            <div className="text-sm text-gray-800">
              Failed to fetch latest challenge status
            </div>
          </div>
        );
      }
    }
  }, [userEmail]);

  // Accept challenge function
  const acceptChallenge = async () => {
    if (!randomChallenge || !userEmail) return;

    if (challengeStatus && challengeStatus.daily_challenges >= challengeStatus.max_challenges) {
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <AlertCircle className="w-5 h-5" />
            Daily Limit Reached
          </div>
          <div className="text-sm text-gray-800">
            You've reached your daily limit of {challengeStatus.max_challenges} challenges. 
            Come back tomorrow for more!
          </div>
        </div>
      );
      return;
    }

    setLoading(true);
    try {
      const acceptRes = await api.post('/challenge/accept', {
        email: userEmail,
        prompt: randomChallenge.prompt,
        mode: randomChallenge.mode,
      });

      // Immediately fetch updated status
      await fetchChallengeStatus(true);

      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Success
          </div>
          <div className="text-sm text-gray-800">
            Challenge accepted! {acceptRes.data.remaining_challenges} challenges remaining today.
          </div>
        </div>
      );

      // Reset states
      setRandomChallenge(null);
      setSelectedDifficulty(null);

      // Navigate with challenge data
      setTimeout(() => {
        navigate('/challenges/create', { 
          state: { 
            challenge: {
              prompt: randomChallenge.prompt,
              mode: randomChallenge.mode
            }
          } 
        });
      }, 1000);

    } catch (error: any) {
      // Try to fetch latest status in case of error
      await fetchChallengeStatus(true);

      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <X className="w-5 h-5 text-red-500" />
            Error
          </div>
          <div className="text-sm text-gray-800">
            {error.response?.data?.error || "Failed to accept challenge"}
          </div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling setup
  useEffect(() => {
    if (!userEmail) return;

    // Initial fetch
    fetchChallengeStatus(false);

    // Set up polling
    const intervalId = setInterval(() => {
      fetchChallengeStatus(false);
    }, 5000); // Poll every 5 seconds

    // Cleanup
    return () => clearInterval(intervalId);
  }, [userEmail, fetchChallengeStatus]);

  // Fetch status when component gains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchChallengeStatus(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchChallengeStatus]);

  const handleDifficultySelect = (difficulty: string) => {
    setSelectedDifficulty(difficulty.toLowerCase());
    setRandomChallenge(null);
  };

  const getRandomChallenge = async () => {
    if (!selectedDifficulty) {
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <AlertCircle className="w-5 h-5" />
            Error
          </div>
          <div className="text-sm text-gray-800">Please select a difficulty level first.</div>
        </div>
      );
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/challenge/roll?mode=${selectedDifficulty}`);
      setRandomChallenge(res.data);
    } catch (error) {
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <AlertCircle className="w-5 h-5" />
            Error
          </div>
          <div className="text-sm text-gray-800">Failed to fetch challenge. Please try again.</div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FEF6E9] via-orange-50 to-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-600 mb-3 tracking-tight">
              Daily Photography Challenges
            </h1>
            <p className="text-sm md:text-base text-orange-600/80 max-w-2xl mx-auto">
              Complete challenges to earn points and climb the leaderboard
            </p>
          </motion.div>

          {/* Stats Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 gap-6 mb-8"
          >
            <Card className="bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden border border-orange-100/50 max-w-sm mx-auto">
              <CardContent className="p-5">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-3 shadow-md"
                >
                  <Trophy className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-orange-800 mb-2">Today's Progress</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    {challengeStatus ? challengeStatus.daily_challenges : 0}
                  </span>
                  <span className="text-3xl font-bold text-orange-300">/</span>
                  <span className="text-3xl font-bold text-orange-600">
                    {challengeStatus ? challengeStatus.max_challenges : 5}
                  </span>
                </div>
                <p className="text-orange-600/80 text-sm">Challenges completed</p>
                {challengeStatus && challengeStatus.daily_challenges >= challengeStatus.max_challenges && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-orange-600/90 bg-orange-50 p-2.5 rounded-lg inline-flex items-center gap-1.5 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Daily limit reached. Come back tomorrow!
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Difficulty Filter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            <Badge 
              className={`${
                selectedDifficulty === 'easy' 
                  ? 'ring-2 ring-green-400 bg-green-100 text-green-700' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
              } px-6 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
              onClick={() => handleDifficultySelect('Easy')}
            >
              Easy (100 pts)
            </Badge>
            <Badge 
              className={`${
                selectedDifficulty === 'medium' 
                  ? 'ring-2 ring-yellow-400 bg-yellow-100 text-yellow-700' 
                  : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700'
              } px-6 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
              onClick={() => handleDifficultySelect('Medium')}
            >
              Medium (100 pts)
            </Badge>
            <Badge 
              className={`${
                selectedDifficulty === 'hard' 
                  ? 'ring-2 ring-red-400 bg-red-100 text-red-700' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
              } px-6 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
              onClick={() => handleDifficultySelect('Hard')}
            >
              Hard (100 pts)
            </Badge>
          </motion.div>

          {/* Challenge Card */}
          <AnimatePresence mode="wait">
            {randomChallenge && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mb-8"
              >
                <Card className="bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden border border-orange-100/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold text-orange-800">{randomChallenge.prompt}</h2>
                            <Badge className={`${
                              randomChallenge.mode === 'easy' 
                                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                : randomChallenge.mode === 'medium'
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                : 'bg-gradient-to-r from-red-500 to-red-600'
                            } text-white px-3 py-0.5 text-xs font-medium rounded-full shadow-sm`}>
                              {randomChallenge.mode.charAt(0).toUpperCase() + randomChallenge.mode.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-orange-600/80">
                            <Trophy className="w-4 h-4 mr-1.5" />
                            <span>100 points</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] w-full md:w-auto"
                        onClick={acceptChallenge}
                        disabled={loading || (challengeStatus?.daily_challenges || 0) >= (challengeStatus?.max_challenges || 5)}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {loading ? 'Accepting...' : 'Accept Challenge'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Random Challenge Generator */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Card className={`bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden border border-orange-100/50 max-w-lg mx-auto ${!randomChallenge ? 'mt-6' : ''}`}>
              <CardContent className="p-6">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="mx-auto w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-3 shadow-md"
                >
                  <Zap className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-orange-800 mb-2">Feeling Lucky?</h3>
                <p className="text-sm text-orange-600/80 mb-4">
                  {selectedDifficulty 
                    ? `Get a random ${selectedDifficulty} challenge`
                    : 'Get a random challenge tailored to your skill level'}
                </p>
                <Button 
                  onClick={getRandomChallenge}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={loading || (challengeStatus?.daily_challenges || 0) >= (challengeStatus?.max_challenges || 5)}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {loading ? 'Loading...' : 'Random Challenge'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Challenges;
