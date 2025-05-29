
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const Upload = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedChoices, setSelectedChoices] = useState<number[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChoiceToggle = (choiceIndex: number) => {
    setSelectedChoices(prev => 
      prev.includes(choiceIndex) 
        ? prev.filter(c => c !== choiceIndex)
        : [...prev, choiceIndex]
    );
  };

  const handleSubmit = () => {
    console.log('Photo uploaded:', { image: uploadedImage, choices: selectedChoices });
  };

  const choices = ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-800 text-center mb-2">Upload Photo & Set Challenge</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border-0">
            <CardContent className="p-8">
              <div className="relative">
                <div className="border-3 border-dashed border-orange-300 rounded-2xl p-16 text-center bg-orange-50/30 hover:bg-orange-50/50 transition-colors cursor-pointer min-h-[300px] flex flex-col justify-center">
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded preview" 
                        className="max-w-full max-h-48 mx-auto rounded-xl shadow-lg"
                      />
                      <p className="text-orange-700 font-medium">Click to change photo</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-orange-800 font-bold text-xl">Click to Upload Photo</p>
                      </div>
                    </div>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Choices Area */}
          <div className="space-y-4">
            {choices.map((choice, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedChoices.includes(index) 
                    ? 'bg-orange-300 border-orange-400 shadow-lg' 
                    : 'bg-white/80 hover:bg-orange-50 border-orange-200'
                } rounded-xl border-2`}
                onClick={() => handleChoiceToggle(index)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-orange-800 font-medium">{choice}</span>
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    selectedChoices.includes(index) 
                      ? 'bg-orange-500 border-orange-500' 
                      : 'border-orange-300'
                  }`}>
                    {selectedChoices.includes(index) && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <Button 
            onClick={handleSubmit}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={!uploadedImage}
          >
            Submit
          </Button>
          <Button 
            asChild
            variant="outline" 
            className="px-8 py-3 bg-orange-200 hover:bg-orange-300 text-orange-800 border-orange-300 rounded-xl"
          >
            <Link to="/challenges">Cancel</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Upload;
