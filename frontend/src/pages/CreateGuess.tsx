import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Camera, Trophy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { toast } from '../components/ui/sonner';
import React from 'react';
import api from '../lib/axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface LocationState {
  challenge?: {
    prompt: string;
    mode: string;
  };
  mode?: string;
}

const CreateGuess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  // Get difficulty from state or URL parameters
  const searchParams = new URLSearchParams(location.search);
  const initialDifficulty = state?.challenge?.mode || state?.mode || searchParams.get('difficulty') || 'Medium';

  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [difficulty] = useState(initialDifficulty.charAt(0).toUpperCase() + initialDifficulty.slice(1).toLowerCase());
  const [questionType, setQuestionType] = useState<'single' | 'multiple'>('single');

  // Helper function to get difficulty color
  const getDifficultyColor = (diff: string) => {
    const diffLower = diff.toLowerCase();
    if (diffLower === 'easy') return 'bg-green-500 text-white';
    if (diffLower === 'medium') return 'bg-yellow-500 text-white';
    if (diffLower === 'hard') return 'bg-red-500 text-white';
    return 'bg-yellow-500 text-white'; // default
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
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

  const handleSubmit = async () => {
    if (!selectedImage || !prompt || options.some(opt => !opt.trim()) || correctAnswers.length === 0) {
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Error
          </div>
          <div className="text-sm text-gray-800">Please fill in all fields and select a correct answer.</div>
        </div>
      );
      return;
    }

    try {
      // Create form data with the actual file
      const formData = new FormData();
      formData.append('photo', selectedImage);
      formData.append('email', JSON.parse(localStorage.getItem('user') || '{}').email);
      formData.append('choice1', options[0]);
      formData.append('choice2', options[1]);
      formData.append('choice3', options[2]);
      formData.append('choice4', options[3]);
      formData.append('correct_index', String(correctAnswers[0].charCodeAt(0) - 97));
      formData.append('prompt', prompt);
      formData.append('difficulty', difficulty);

      // Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value);
      }

      // Send to backend using axios
      const res = await api.post('/challenge/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Success
          </div>
          <div className="text-sm text-gray-800">Challenge created successfully!</div>
        </div>
      );
      
      // Navigate to gallery page after 1 second
      setTimeout(() => {
    navigate('/gallery');
      }, 1000);
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Error
          </div>
          <div className="text-sm text-gray-800">
            {error instanceof Error ? error.message : 'Failed to create challenge. Please try again.'}
          </div>
        </div>
      );
    }
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-600 mb-3 tracking-tight">
              Create Photo Guess Challenge
            </h1>
            <p className="text-sm md:text-base text-orange-600/80 max-w-2xl mx-auto">
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
                        src={imagePreview || undefined} 
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
                      <div className={`flex-1 p-3 rounded-lg font-medium ${getDifficultyColor(difficulty)}`}>
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
                    <div className="p-3 rounded-lg font-medium bg-orange-200 text-orange-800">
                      Single Correct Answer
                    </div>
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
                        src={imagePreview || undefined} 
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
                        <span className={`px-3 py-1 rounded-md text-white ${getDifficultyColor(difficulty)}`}>
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