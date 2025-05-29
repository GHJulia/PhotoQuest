import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Trophy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const CreateGuess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get difficulty from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const initialDifficulty = searchParams.get('difficulty') || 'Medium';

  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [questionType, setQuestionType] = useState<'single' | 'multiple'>('single');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleCorrectAnswerToggle = (optionIndex: number) => {
    const optionLetter = String.fromCharCode(97 + optionIndex);
    
    if (questionType === 'single') {
      setCorrectAnswers([optionLetter]);
    } else {
      setCorrectAnswers(prev => 
        prev.includes(optionLetter) 
          ? prev.filter(answer => answer !== optionLetter)
          : [...prev, optionLetter]
      );
    }
  };

  const handleQuestionTypeChange = (newType: 'single' | 'multiple') => {
    setQuestionType(newType);
    if (newType === 'single' && correctAnswers.length > 1) {
      setCorrectAnswers([correctAnswers[0]]);
    }
  };

  const handleSubmit = () => {
    console.log('Creating guess with data:', {
      prompt,
      options,
      correctAnswers,
      selectedImage,
      difficulty,
      questionType
    });
    navigate('/gallery');
  };

  const optionColors = [
    'bg-blue-500',
    'bg-emerald-500', 
    'bg-yellow-500',
    'bg-pink-500'
  ];

  return (
    <div className="min-h-screen bg-[#FEF6E9] flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-800 mb-2">
              Create Photo Guess Challenge
            </h1>
            <p className="text-orange-700">
              Upload your photo and create a guessing challenge for other players
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Photo Upload Section */}
            <div className="space-y-6">
              {/* Image Upload */}
              <Card className="bg-orange-100 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800">Upload Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedImage ? (
                    <label 
                      htmlFor="photo-upload" 
                      className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center block cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all"
                    >
                      <Camera className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                      <p className="text-orange-600 mb-4">Click to upload your photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img 
                        src={selectedImage} 
                        alt="Uploaded photo"
                        className="w-full h-80 object-cover rounded-lg"
                      />
                      <button
                        onClick={removeImage}
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Challenge Settings */}
              <Card className="bg-orange-100 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800">Challenge Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-2">
                      Difficulty Level & Points
                    </label>
                    <div className="flex items-center gap-3">
                      <div className={`flex-1 p-3 rounded-lg font-medium ${
                        difficulty === 'Easy' 
                          ? 'bg-green-500 text-white' 
                          : difficulty === 'Medium'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {difficulty}
                      </div>
                      <div className="bg-orange-500 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        100 Points
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-2">
                      Question Type
                    </label>
                    <select 
                      value={questionType} 
                      onChange={(e) => handleQuestionTypeChange(e.target.value as 'single' | 'multiple')}
                      className="w-full p-2 border border-orange-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="single">Single Correct Answer</option>
                      <option value="multiple">Multiple Correct Answers</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Creation Section */}
            <div className="space-y-6">
              {/* Question Input */}
              <Card className="bg-[#FFBB70] text-orange-900">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <label className="block text-lg font-medium mb-3">
                      What's your question?
                    </label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., What was the main inspiration for this photo?"
                      className="bg-white text-gray-800 border-0 min-h-[100px] text-base p-4"
                    />
                  </div>

                  {/* Answer Options */}
                  <div className="grid grid-cols-2 gap-4">
                    {options.map((option, index) => (
                      <div key={index} className="relative">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className={`${optionColors[index]} text-white placeholder-white/70 p-6 rounded-lg font-medium text-center w-full border-0 focus:ring-4 focus:ring-white`}
                        />
                        
                        {/* Mark as correct indicator */}
                        <button
                          onClick={() => handleCorrectAnswerToggle(index)}
                          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
                            correctAnswers.includes(String.fromCharCode(97 + index))
                              ? 'bg-white text-green-600'
                              : 'bg-orange-100 text-orange-900 hover:bg-orange-200'
                          }`}
                        >
                          {correctAnswers.includes(String.fromCharCode(97 + index)) 
                            ? <span className="text-lg leading-none flex items-center justify-center">✓</span>
                            : <span className="text-xl leading-none flex items-center justify-center" style={{ marginTop: '-1px' }}>+</span>
                          }
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Question Type Indicator */}
                  <div className="flex justify-between items-center text-sm text-orange-900 mt-4">
                    <span>
                      {questionType === 'single' ? 'Single correct answer' : 'Multiple correct answers'}
                    </span>
                    <div className="text-xs text-orange-900/70">
                      Click + to mark correct answers
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-4"
                disabled={!selectedImage || !prompt || options.some(opt => !opt.trim()) || correctAnswers.length === 0}
              >
                Create Challenge
              </Button>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800 text-2xl">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedImage && (
                    <div className="mb-4">
                      <img 
                        src={selectedImage} 
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-orange-300"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="bg-[#FFBB70] text-orange-900 p-6 rounded-lg">
                      <p className="font-medium mb-4 text-lg">
                        {prompt || 'Your question will appear here...'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {options.map((option, index) => (
                          <div
                            key={index}
                            className={`${optionColors[index]} p-4 rounded-lg text-center text-white text-base font-medium relative hover:opacity-90 transition-opacity`}
                          >
                            {option || `Option ${index + 1}`}
                            {correctAnswers.includes(String.fromCharCode(97 + index)) && (
                              <div className="absolute -top-1 -right-1 w-7 h-7 bg-white text-green-600 rounded-full flex items-center justify-center text-lg font-semibold shadow-lg transform hover:scale-105 transition-all">
                                ✓
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-800 font-medium">Difficulty:</span>
                        <span className={`px-3 py-1 rounded-md text-white ${
                          difficulty === 'Easy' 
                            ? 'bg-green-500' 
                            : difficulty === 'Medium'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}>
                          {difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-orange-800 font-medium">Points:</span>
                        <span className="text-orange-700">100</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-orange-800 font-medium">Type:</span>
                        <span className="text-orange-700">
                          {questionType === 'single' ? 'Single Answer' : 'Multiple Answers'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-orange-800 font-medium">Correct:</span>
                        <span className="text-orange-700">
                          {correctAnswers.length} answer{correctAnswers.length !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateGuess; 