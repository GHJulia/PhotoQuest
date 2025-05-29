import { Card, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Leaderboard = () => {
  const leaderboardData = [
    {
      rank: 1,
      username: "LovelySummer",
      totalScore: 10000,
      avatar: "🏆"
    },
    {
      rank: 2, 
      username: "BunnyBlush",
      totalScore: 9000,
      avatar: "🥈"
    },
    {
      rank: 3,
      username: "PeachyPaws", 
      totalScore: 8000,
      avatar: "🥉"
    },
    {
      rank: 4,
      username: "StrawberryJam",
      totalScore: 7000,
      avatar: "🌟"
    },
    {
      rank: 5,
      username: "SweetHoney",
      totalScore: 6000,
      avatar: "⭐"
    },
    {
      rank: 6,
      username: "CherryBlossom",
      totalScore: 5500,
      avatar: "🌸"
    },
    {
      rank: 7,
      username: "LemonDrop",
      totalScore: 5000,
      avatar: "🍋"
    },
    {
      rank: 8,
      username: "MintLeaf",
      totalScore: 4500,
      avatar: "🌿"
    },
    {
      rank: 9,
      username: "CoconutDream",
      totalScore: 4000,
      avatar: "🥥"
    },
    {
      rank: 10,
      username: "VanillaBean",
      totalScore: 3500,
      avatar: "🍶"
    },
    {
      rank: 20,
      username: "BlueberryPie",
      totalScore: 1000,
      avatar: "🫐"
    }
  ];

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600";
      default:
        return "bg-orange-200/80";
    }
  };

  const getTextColor = (rank: number) => {
    return rank <= 3 ? "text-white" : "text-orange-800";
  };

  return (
    <div className="min-h-screen bg-[#FEF6E9] flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-800 mb-4">Leaderboard</h1>
          <p className="text-orange-700">Top players and their achievements</p>
        </div>

        {/* Leaderboard Container with Background */}
        <div className="max-w-2xl mx-auto bg-white/50 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-orange-100">
          {/* Scrollable Area */}
          <div 
            className="space-y-3 max-h-[600px] overflow-y-auto pr-4"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(234, 88, 12, 0.5) rgba(255, 255, 255, 0.4)'
            }}
          >
          {leaderboardData.map((player, index) => (
            <Card 
              key={player.rank} 
                className={`${getRankBg(player.rank)} shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl border-0`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getTextColor(player.rank)}`}>
                      {player.rank}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl">
                        {player.avatar}
                      </div>
                      <div>
                        <div className={`font-bold text-lg ${getTextColor(player.rank)}`}>
                          {player.username}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm ${player.rank <= 3 ? 'text-white/90' : 'text-orange-700'} mb-1`}>
                      Total Score:
                    </div>
                    <div className={`font-bold text-xl ${getTextColor(player.rank)}`}>
                      {player.totalScore.toLocaleString()} Points
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;
