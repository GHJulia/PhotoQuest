import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';
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
import EditUserModal from '@/components/EditUserModal';
import EditTaskModal from '@/components/EditTaskModal';

interface User {
  id: string;
  name: string;
  email: string;
  join_date: string;
  points: number;
}

interface Challenge {
  id: string;
  task_description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  created_date: string;
  status: 'active' | 'inactive';
}

const Admin = () => {
  const navigate = useNavigate();
  const [searchUser, setSearchUser] = useState('');
  const [searchChallenge, setSearchChallenge] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTask, setSelectedTask] = useState<Challenge | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, tasksRes] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/tasks')
      ]);
      setUsers(usersRes.data);
      setChallenges(tasksRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const updateUser = async (id: string, updatedUser: Partial<User>) => {
    try {
      await axios.put(`/admin/users/${id}`, updatedUser);
      await fetchData();
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const deleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/admin/tasks/${id}`);
      setChallenges(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const updateTask = async (id: string, updatedTask: Partial<Challenge>) => {
    try {
      await axios.put(`/admin/tasks/${id}`, updatedTask);
      await fetchData();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-orange-800">Admin Dashboard</h1>
            <p className="text-orange-600 mt-2">Manage users and photography challenges</p>
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
                         {users
                          .filter(user =>
                            user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchUser.toLowerCase())
                          )
                          .map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                {user.email}
                              </TableCell>
                              <TableCell className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {user.join_date}
                              </TableCell>
                              <TableCell className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                {user.points}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => updateUser(user.id, user)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
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

            {/* Task Tab */}
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
                        {challenges
                          .filter(task =>
                            task.task_description.toLowerCase().includes(searchChallenge.toLowerCase())
                          )
                          .map((task) => (
                            <TableRow key={task.id}>
                              <TableCell className="font-medium">{task.task_description}</TableCell>
                              <TableCell>
                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  task.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                  task.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {task.difficulty}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="flex items-center gap-2">
                                  <Trophy className="h-4 w-4 text-orange-500" />
                                  {task.points}
                                </span>
                              </TableCell>
                              <TableCell className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {task.created_date}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  task.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {task.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => updateTask(task.id, task)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost" size="sm" onClick={() => deleteTask(task.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
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

        {/* Modals */}
      {selectedUser && (
        <EditUserModal
          open={!!selectedUser}
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={fetchData}
        />
      )}
      {selectedTask && (
        <EditTaskModal
          open={!!selectedTask}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={fetchData}
        />
      )}

      </div>
    </div>
  );
};

export default Admin; 