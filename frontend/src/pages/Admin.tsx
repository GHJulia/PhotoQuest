import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Users, 
  ImagePlus, 
  Search, 
  Trophy,
  Mail,
  Calendar,
  Star,
  Edit,
  Trash2,
  Plus,
  Camera
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// Mock data - In real app, this would come from an API
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    joinDate: '2024-01-15',
    points: 1200,
    role: 'user'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    joinDate: '2024-02-20',
    points: 850,
    role: 'user'
  },
  // Add more mock users as needed
];

// Updated mock challenges to match new format
const mockChallenges = [
  {
    id: 1,
    task: 'Take a photo of a sunset reflecting on water',
    difficulty: 'Medium',
    createdAt: '2024-03-15',
    status: 'active',
    points: 100
  },
  {
    id: 2,
    task: 'Capture a close-up of a flower with morning dew',
    difficulty: 'Easy',
    createdAt: '2024-03-14',
    status: 'active',
    points: 100
  },
  {
    id: 3,
    task: 'Photograph star trails in the night sky',
    difficulty: 'Hard',
    createdAt: '2024-03-13',
    status: 'active',
    points: 100
  }
];

const Admin = () => {
  const navigate = useNavigate();
  const [searchUser, setSearchUser] = useState('');
  const [searchChallenge, setSearchChallenge] = useState('');

  // Format date to readable string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FEF6E9]">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-600 mb-3 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm md:text-base text-orange-600/80 max-w-2xl mx-auto">
              Manage users and photography challenges
            </p>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-orange-100 p-1">
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="challenges"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <Camera className="h-4 w-4 mr-2" />
                Photography Tasks
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl text-orange-800">User Management</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className="pl-10 w-[300px] border-orange-200 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-orange-200 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-orange-50">
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Join Date</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockUsers
                          .filter(user => 
                            user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchUser.toLowerCase())
                          )
                          .map(user => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                {user.email}
                              </TableCell>
                              <TableCell className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {formatDate(user.joinDate)}
                              </TableCell>
                              <TableCell className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                {user.points}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Updated Challenges Tab */}
            <TabsContent value="challenges">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl text-orange-800">Photography Tasks</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search tasks..."
                        value={searchChallenge}
                        onChange={(e) => setSearchChallenge(e.target.value)}
                        className="pl-10 w-[300px] border-orange-200 focus:ring-orange-500"
                      />
                    </div>
                    <Button 
                      onClick={() => navigate('/admin/challenges/new')}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-orange-200 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-orange-50">
                        <TableRow>
                          <TableHead className="w-[40%]">Task Description</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Created Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockChallenges
                          .filter(challenge =>
                            challenge.task.toLowerCase().includes(searchChallenge.toLowerCase())
                          )
                          .map(challenge => (
                            <TableRow key={challenge.id}>
                              <TableCell className="font-medium">{challenge.task}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  challenge.difficulty === 'Easy'
                                    ? 'bg-green-100 text-green-700'
                                    : challenge.difficulty === 'Medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {challenge.difficulty}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="flex items-center gap-2">
                                  <Trophy className="h-4 w-4 text-orange-500" />
                                  {challenge.points}
                                </span>
                              </TableCell>
                              <TableCell className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {formatDate(challenge.createdAt)}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  challenge.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {challenge.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Admin; 