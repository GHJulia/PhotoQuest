import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Camera, Plus, X } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { toast } from '../components/ui/sonner';

interface LocationState {
  challenge?: {
    prompt: string;
    mode: string;
  };
  mode?: string;
}

const CreateChallenge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [difficulty] = useState<'easy' | 'medium' | 'hard' | ''>(
    (state?.challenge?.mode || state?.mode || '').toLowerCase() as 'easy' | 'medium' | 'hard' | ''
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview || !prompt || options.some(opt => !opt)) {
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Error
          </div>
          <div className="text-sm text-gray-800">Please fill in all fields and upload an image.</div>
        </div>
      );
      return;
    }

    setLoading(true);
    try {
      // Create form data
      const formData = new FormData();
      const imageFile = await fetch(imagePreview).then(r => r.blob());
      formData.append('photo', imageFile);
      formData.append('email', user.email);
      formData.append('choice1', options[0]);
      formData.append('choice2', options[1]);
      formData.append('choice3', options[2]);
      formData.append('choice4', options[3]);
      formData.append('correct_index', correctAnswer.toString());

      // Send to backend
      const res = await fetch('http://localhost:8081/challenge/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
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
      } else {
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Error
            </div>
            <div className="text-sm text-gray-800">{data.error || "Failed to create challenge"}</div>
          </div>
        );
      }
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
          <div className="text-sm text-gray-800">Failed to create challenge. Please try again.</div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FEF6E9]">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/challenges')}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Challenges
            </Button>
          </div>

          {/* Create Challenge Form */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-orange-800">
                <Camera className="h-6 w-6" />
                Create Guess Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Challenge Question */}
                <div className="space-y-2">
                  <Label className="text-lg font-semibold text-orange-800">Challenge Question</Label>
                  <Input 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your question..."
                    className="w-full"
                  />
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-orange-800">Options</Label>
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8">
                        <Label className="text-orange-600">{String.fromCharCode(97 + index)})</Label>
                      </div>
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index] = e.target.value;
                          setOptions(newOptions);
                        }}
                        placeholder={`Enter option ${index + 1}`}
                        className="flex-grow"
                      />
                      <div className="flex-shrink-0">
                        <input
                          type="radio"
                          name="correct-answer"
                          checked={correctAnswer === index}
                          onChange={() => setCorrectAnswer(index)}
                          className="w-4 h-4 text-orange-500 border-orange-300 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label className="text-lg font-semibold text-orange-800">Upload Your Photo</Label>
                  {!imagePreview ? (
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
                        required
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Challenge submission"
                        className="w-full h-80 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                  </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={loading || !imagePreview}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Create Challenge
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

        <Footer />
    </div>
  );
};

export default CreateChallenge; 