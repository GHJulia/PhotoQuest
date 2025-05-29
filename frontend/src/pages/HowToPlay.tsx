import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Camera, Search, Trophy, Share } from "lucide-react";
import { motion } from "framer-motion";

const HowToPlay = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FEF6E9] to-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1600"
          alt="Photography inspiration"
          className="w-full h-full object-cover brightness-[0.35]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-3xl px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            >
              How to Play Photo Quest
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-200"
            >
              Master the art of creative photography challenges
            </motion.p>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FEF6E9] to-transparent" />
      </div>

      <main className="flex-grow py-16 px-4 relative">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-12 top-20 w-96 h-96 bg-orange-100 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -left-12 bottom-20 w-96 h-96 bg-orange-200 rounded-full opacity-20 blur-3xl" />
        </div>

        {/* Steps Section */}
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-orange-800 mb-4">Four Simple Steps to Get Started</h2>
            <p className="text-lg text-orange-700 max-w-2xl mx-auto">Follow these steps to begin your photography journey and start earning points!</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 relative">
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group hover:bg-orange-50/50 hover:-translate-y-1 hover:scale-[1.02]"
              >
                <div className="absolute top-0 left-0 w-2 group-hover:w-3 h-full bg-gradient-to-b from-orange-400 to-orange-500 transition-all duration-300" />
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-xl">
                    <Camera size={32} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-2xl text-orange-800 mb-3">1. Take Creative Photos</h3>
                    <p className="text-orange-700 leading-relaxed">
                      Start by clicking "New Challenge" to receive a random photo prompt. Use your creativity to capture a photo that best represents the given prompt. Each prompt is unique and designed to test your photography skills!
                    </p>
                    <div className="mt-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <p className="text-sm text-orange-600 font-medium">💡 Pro tip: Think outside the box! The most creative interpretations often win more votes.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group hover:bg-orange-50/50 hover:-translate-y-1 hover:scale-[1.02]"
              >
                <div className="absolute top-0 left-0 w-2 group-hover:w-3 h-full bg-gradient-to-b from-orange-400 to-orange-500 transition-all duration-300" />
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-xl">
                    <Search size={32} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-2xl text-orange-800 mb-3">2. Guess Other Players' Prompts</h3>
                    <p className="text-orange-700 leading-relaxed">
                      Browse through the gallery of submitted photos and put your detective skills to work! Try to guess the original prompt from four options. Each correct guess earns you 100 points.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <img 
                        src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400"
                        alt="Example photo 1"
                        className="rounded-xl h-28 w-full object-cover transform transition-transform duration-300 hover:scale-105"
                      />
                      <img 
                        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400"
                        alt="Example photo 2"
                        className="rounded-xl h-28 w-full object-cover transform transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group hover:bg-orange-50/50 hover:-translate-y-1 hover:scale-[1.02]"
              >
                <div className="absolute top-0 left-0 w-2 group-hover:w-3 h-full bg-gradient-to-b from-orange-400 to-orange-500 transition-all duration-300" />
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-xl">
                    <Trophy size={32} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-2xl text-orange-800 mb-3">3. Climb the Leaderboard</h3>
                    <p className="text-orange-700 leading-relaxed">
                      Every correct guess and creative photo submission helps you climb the ranks! Track your progress on the leaderboard and compete with photographers worldwide.
                    </p>
                    <div className="mt-4 bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                      <div className="flex items-center justify-between">
                        <span className="text-orange-800 font-semibold">🏆 Points System</span>
                        <span className="text-orange-600 font-bold bg-white px-4 py-2 rounded-lg shadow-sm">+100 points per correct guess</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group hover:bg-orange-50/50 hover:-translate-y-1 hover:scale-[1.02]"
              >
                <div className="absolute top-0 left-0 w-2 group-hover:w-3 h-full bg-gradient-to-b from-orange-400 to-orange-500 transition-all duration-300" />
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-xl">
                    <Share size={32} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-2xl text-orange-800 mb-3">4. Share Your Journey</h3>
                    <p className="text-orange-700 leading-relaxed">
                      Share your best shots on social media and invite friends to join the fun! Build your photography portfolio and get inspired by other players' creative interpretations.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <img 
                        src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400"
                        alt="Example portfolio 1"
                        className="rounded-xl h-20 w-20 object-cover transform transition-transform duration-300 hover:scale-105"
                      />
                      <img 
                        src="https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=400"
                        alt="Example portfolio 2"
                        className="rounded-xl h-20 w-20 object-cover transform transition-transform duration-300 hover:scale-105"
                      />
                      <img 
                        src="https://images.unsplash.com/photo-1520262454473-a1a82276a574?w=400"
                        alt="Example portfolio 3"
                        className="rounded-xl h-20 w-20 object-cover transform transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-20"
        >
          <Button 
            asChild
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xl px-10 py-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <Link to="/challenges" className="flex items-center gap-3">
              <Camera className="h-7 w-7" />
              <span>Start Your First Challenge</span>
            </Link>
          </Button>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HowToPlay; 