import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Camera, Plus, X } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const CreateChallenge = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [options, setOptions] = useState(['', '', '', '']); // Always 4 options
  const [correctOption, setCorrectOption] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');
  const [task, setTask] = useState('');

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

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!difficulty || !task.trim()) {
      return;
    }

    // Create challenge object with fixed points (100) for all difficulties
    const challengeData = {
      task: task.trim(),
      difficulty,
      points: 100, // Fixed 100 points for all difficulties
      type: 'photo_task'
    };

    // Here you would typically send the data to your backend
    console.log('Photo Task Challenge Data:', challengeData);
    navigate('/admin');
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
              onClick={() => navigate('/admin')}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Admin
            </Button>
          </div>

          {/* Create Challenge Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-orange-800">
                <Camera className="h-6 w-6" />
                Create New Photography Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photography Task */}
                <div className="space-y-2">
                  <Label htmlFor="task">Photography Task Description</Label>
                  <Textarea
                    id="task"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Enter the photography task description here... (e.g., 'Take a photo of a sunset reflecting on water')"
                    className="min-h-[150px] border-orange-200 focus:ring-orange-500"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Describe the photography task clearly. Make sure it matches the selected difficulty level.
                  </p>
                </div>

                {/* Difficulty Level */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}
                  >
                    <SelectTrigger className="border-orange-200 focus:ring-orange-500">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">
                        Easy - Basic composition, common subjects
                      </SelectItem>
                      <SelectItem value="medium">
                        Medium - Intermediate techniques, timing-based
                      </SelectItem>
                      <SelectItem value="hard">
                        Hard - Advanced techniques, specific conditions
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-700 mb-2">Difficulty Level Guidelines:</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="font-medium text-green-600">Easy:</span>
                        Simple subjects, basic composition rules, good lighting conditions
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium text-yellow-600">Medium:</span>
                        Specific timing, weather conditions, or technical skills required
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium text-red-600">Hard:</span>
                        Complex techniques, challenging conditions, precise timing, or rare subjects
                      </li>
                    </ul>
                  </div>
                  <p className="mt-4 text-sm font-medium text-orange-600">
                    All difficulty levels award 100 points upon completion
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={!difficulty || !task.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Photography Task
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default CreateChallenge; 