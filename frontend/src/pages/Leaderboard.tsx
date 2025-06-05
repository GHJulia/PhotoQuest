import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { toast } from '../components/ui/sonner';
import { Trophy, Crown, Medal, Star, Search, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/axios';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar_url: string;
  total_score: number;
}

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/leaderboard');
        setLeaderboardData(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Error
            </div>
            <div className="text-sm text-gray-800">Failed to load leaderboard data</div>
          </div>
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500";
      case 2:
        return "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400";
      case 3:
        return "bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500";
      default:
        return "bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 hover:from-orange-100 hover:via-orange-200 hover:to-orange-300";
    }
  };

  const getTextColor = (rank: number) => {
    return rank <= 3 ? "text-white" : "text-orange-800";
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-7 w-7 text-yellow-300 drop-shadow-glow-yellow" />;
      case 2:
        return <Medal className="h-7 w-7 text-gray-300 drop-shadow-glow-gray" />;
      case 3:
        return <Medal className="h-7 w-7 text-amber-400 drop-shadow-glow-amber" />;
      default:
        return <Star className="h-6 w-6 text-orange-400" />;
    }
  };

  const filteredLeaderboard = leaderboardData.filter(player =>
    player.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FEF6E9] via-orange-50 to-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-3 relative">
            <Trophy className="h-10 w-10 text-orange-500 relative z-10" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-600 tracking-tight">
              Leaderboard
            </h1>
          </div>
          <p className="text-sm md:text-base text-orange-600/80 max-w-2xl mx-auto mb-8">
            Compete with other photographers and climb the ranks!
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative group mt-8">
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-full border-2 border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 group-hover:border-orange-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 h-5 w-5 transition-colors group-hover:text-orange-500" />
          </div>
        </motion.div>

        {/* Leaderboard Container */}
        <div className="max-w-4xl mx-auto">
          {/* Top 3 Players Podium */}
          {!loading && leaderboardData.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-8 mb-12 relative pt-20"
            >
              {/* Second Place */}
              {leaderboardData[1] && (
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative group">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <Medal className="h-10 w-10 text-gray-400 drop-shadow-glow-gray" />
                    </div>
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-300 shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                      {leaderboardData[1].avatar_url ? (
                        <img 
                          src={leaderboardData[1].avatar_url} 
                          alt={leaderboardData[1].username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <User className="h-14 w-14 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white text-lg">
                        2
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 text-center transform group-hover:scale-105 transition-transform bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-gray-200">
                    <h3 className="font-bold text-xl text-gray-700 mb-2 truncate max-w-[200px]">{leaderboardData[1].username}</h3>
                    <p className="text-gray-500 font-medium text-lg">{leaderboardData[1].total_score.toLocaleString()} pts</p>
                  </div>
                </motion.div>
              )}

              {/* First Place */}
              {leaderboardData[0] && (
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center -mt-16"
                >
                  <div className="relative group">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <Crown className="h-14 w-14 text-yellow-400 drop-shadow-glow-yellow animate-pulse" />
                    </div>
                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-yellow-400 shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                      {leaderboardData[0].avatar_url ? (
                        <img 
                          src={leaderboardData[0].avatar_url} 
                          alt={leaderboardData[0].username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-yellow-300 flex items-center justify-center">
                          <User className="h-20 w-20 text-yellow-500" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white">
                        1
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 text-center transform group-hover:scale-105 transition-transform bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl px-8 py-4 shadow-lg border border-yellow-200">
                    <h3 className="font-bold text-2xl text-orange-800 mb-2 truncate max-w-[200px]">{leaderboardData[0].username}</h3>
                    <p className="text-orange-600 font-semibold text-xl">{leaderboardData[0].total_score.toLocaleString()} pts</p>
                  </div>
                </motion.div>
              )}

              {/* Third Place */}
              {leaderboardData[2] && (
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center mt-4"
                >
                  <div className="relative group">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <Medal className="h-10 w-10 text-amber-400 drop-shadow-glow-amber" />
                    </div>
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                      {leaderboardData[2].avatar_url ? (
                        <img 
                          src={leaderboardData[2].avatar_url} 
                          alt={leaderboardData[2].username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center">
                          <User className="h-12 w-12 text-amber-500" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white text-lg">
                        3
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 text-center transform group-hover:scale-105 transition-transform bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-amber-200">
                    <h3 className="font-bold text-xl text-gray-700 mb-2 truncate max-w-[200px]">{leaderboardData[2].username}</h3>
                    <p className="text-gray-500 font-medium text-lg">{leaderboardData[2].total_score.toLocaleString()} pts</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Rest of Leaderboard */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-orange-100">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="animate-pulse"
                  >
                    <div className="bg-orange-100/60 h-24 rounded-2xl"></div>
                  </motion.div>
                ))}
              </div>
            ) : filteredLeaderboard.length > 0 ? (
          <div 
                className="space-y-4 max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100"
              >
                <AnimatePresence>
                  {filteredLeaderboard.slice(3).map((player, index) => (
                    <motion.div
                      key={player.rank}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
            <Card 
                        className={`${getRankBg(player.rank)} shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl border-0 transform hover:scale-[1.02]`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold ${getTextColor(player.rank)} shadow-inner`}>
                                {getRankIcon(player.rank)}
                    </div>
                    
                              <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-white/30">
                                  {player.avatar_url ? (
                                    <img 
                                      src={player.avatar_url} 
                                      alt={player.username} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-8 h-8 text-orange-500" />
                                  )}
                      </div>
                      <div>
                                  <div className={`font-bold text-lg ${getTextColor(player.rank)} group-hover:scale-105 transition-transform`}>
                          {player.username}
                        </div>
                                  <div className={`text-sm ${player.rank <= 3 ? 'text-white/90' : 'text-orange-700'}`}>
                                    Rank #{player.rank}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm ${player.rank <= 3 ? 'text-white/90' : 'text-orange-700'} mb-1`}>
                                Total Score
                    </div>
                              <div className={`font-bold text-2xl ${getTextColor(player.rank)} group-hover:scale-105 transition-transform`}>
                                {player.total_score.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
                    </motion.div>
          ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-4">
                  <Search className="h-10 w-10 text-orange-400" />
                </div>
                <p className="text-xl text-orange-600 font-medium">
                  {searchQuery ? 'No players found matching your search.' : 'No leaderboard data available.'}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;

// Add these styles to your global CSS
/*
.drop-shadow-glow-yellow {
  filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.5));
}
.drop-shadow-glow-gray {
  filter: drop-shadow(0 0 8px rgba(156, 163, 175, 0.5));
}
.drop-shadow-glow-amber {
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.5));
}
.drop-shadow-glow-orange {
  filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.5));
}
*/
