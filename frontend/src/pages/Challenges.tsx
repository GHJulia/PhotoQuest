import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Camera, Trophy, Zap, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { toast } from '../components/ui/sonner';
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
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
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

    } catch (error: any) {
      console.error('Error fetching challenge status:', error);
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
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
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
      console.error('Error accepting challenge:', error);
      
      // Try to fetch latest status in case of error
      await fetchChallengeStatus(true);

      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <AlertCircle className="w-5 h-5" />
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
      console.error('Error fetching challenge:', error);
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
                <p className="text-2xl font-bold text-orange-600 mb-1">
                  {challengeStatus ? challengeStatus.daily_challenges : 0}/
                  {challengeStatus ? challengeStatus.max_challenges : 5}
                </p>
                <p className="text-orange-600 text-sm">Challenges completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Difficulty Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge 
              className={`${
                selectedDifficulty === 'easy' 
                  ? 'ring-2 ring-green-400 bg-green-100 text-green-700' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              } px-6 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200`}
              onClick={() => handleDifficultySelect('Easy')}
            >
              Easy (100 pts)
          </Badge>
            <Badge 
              className={`${
                selectedDifficulty === 'medium' 
                  ? 'ring-2 ring-yellow-400 bg-yellow-100 text-yellow-700' 
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              } px-6 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200`}
              onClick={() => handleDifficultySelect('Medium')}
            >
              Medium (100 pts)
          </Badge>
            <Badge 
              className={`${
                selectedDifficulty === 'hard' 
                  ? 'ring-2 ring-red-400 bg-red-100 text-red-700' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              } px-6 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200`}
              onClick={() => handleDifficultySelect('Hard')}
            >
              Hard (100 pts)
          </Badge>
        </div>

          {/* Challenge Card */}
            {randomChallenge && (
            <Card className="bg-orange-100 border-orange-200 mb-8">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-16 h-16 bg-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Camera className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-bold text-orange-800">{randomChallenge.prompt}</h2>
                        <Badge className={`${
                          randomChallenge.mode === 'easy' 
                            ? 'bg-green-500' 
                            : randomChallenge.mode === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        } text-white px-2 py-1 text-xs font-medium`}>
                          {randomChallenge.mode.charAt(0).toUpperCase() + randomChallenge.mode.slice(1)}
                        </Badge>
                      </div>
                        <div className="flex items-center text-sm text-orange-600">
                          <Trophy className="w-4 h-4 mr-1" />
                        <span>100 points</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600 text-white w-full md:w-auto"
                    onClick={acceptChallenge}
                    disabled={loading || (challengeStatus?.daily_challenges || 0) >= (challengeStatus?.max_challenges || 5)}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {loading ? 'Accepting...' : 'Accept Challenge'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}

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
                  disabled={loading || (challengeStatus?.daily_challenges || 0) >= (challengeStatus?.max_challenges || 5)}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {loading ? 'Loading...' : 'Random Challenge'}
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
