import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Camera,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { EditUserModal } from '@/components/EditUserModal';
import EditTaskModal from '@/components/EditTaskModal';
import { User, Challenge } from '@/types';

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchUser, setSearchUser] = useState('');
  const [searchChallenge, setSearchChallenge] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTask, setSelectedTask] = useState<Challenge | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Format date to display in a consistent, user-friendly format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchData = async () => {
    try {
      const [usersRes, tasksRes] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/tasks')
      ]);

      if (!usersRes.data || !tasksRes.data) {
        throw new Error('No data received from the server');
      }

      // Transform users data to match frontend interface
      const transformedUsers = usersRes.data.map((user: any) => {
        const id = user.id || user._id || user._id?.$oid || '';
        
        // Handle case where surname might be part of name field
        let name = user.name || '';
        let surname = user.surname || '';

        // If there's no surname but name contains a space, split it
        if (!surname && name.includes(' ')) {
          const nameParts = name.split(' ');
          name = nameParts[0];
          surname = nameParts.slice(1).join(' ');
        }

        return {
          id,
          name,
          surname,
          email: user.email,
          join_date: user.join_date,
          points: user.points || 0
        };
      });

      setUsers(transformedUsers);

      // Transform tasks data to match frontend interface
      const transformedTasks = tasksRes.data.map((task: any) => ({
        id: task.id || task._id || '',
        task_description: task.task_description || task.prompt || '',
        difficulty: (task.difficulty || task.mode || 'easy') as 'easy' | 'medium' | 'hard',
        points: task.points || 100,
        created_date: task.created_date || new Date().toLocaleDateString(),
        status: (task.status || 'active') as 'active' | 'inactive'
      }));

      setChallenges(transformedTasks);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      const errorMessage = err.response 
        ? `Server error: ${err.response.status} - ${err.response.statusText}`
        : err.message === 'Network Error'
        ? 'Cannot connect to the server. Please make sure the backend is running.'
        : 'Failed to load data. Please try again.';
      
      alert(errorMessage);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`/admin/users/${id}`);
      // Remove user from the state
      setUsers(prev => prev.filter(user => user.id !== id));
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Success
          </div>
          <div className="text-sm text-gray-800">User deleted successfully!</div>
        </div>
      );
    } catch (error) {
      console.error('Error deleting user:', error);
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <X className="h-5 w-5 text-red-500" />
            Error
          </div>
          <div className="text-sm text-gray-800">Failed to delete user. Please try again.</div>
        </div>
      );
    } finally {
      setUserToDelete(null);
    }
  };

  const updateUser = async (id: string, updatedData: Partial<User>) => {
    try {
      console.log('Updating user with ID:', id);
      console.log('Update data:', updatedData);
      
      // Transform the data to match the backend API structure
      const payload = {
        name: updatedData.name,
        surname: updatedData.surname,
        email: updatedData.email,
        total_score: updatedData.points,
        id: id
      };

      console.log('Sending payload to backend:', payload);

      const response = await axios.put(`/admin/users/${id}`, payload);
      
      if (response.data) {
        console.log('Update successful:', response.data);
        
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === id 
              ? { 
                  ...user,
                  name: updatedData.name || user.name,
                  surname: updatedData.surname || user.surname,
                  email: updatedData.email || user.email,
                  points: updatedData.points || user.points
                }
              : user
          )
        );
        
        setSelectedUser(null);
        // Show success toast instead of alert
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Success
            </div>
            <div className="text-sm text-gray-800">User updated successfully!</div>
          </div>
        );
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update user. Please try again.';
      // Show error toast instead of alert
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <X className="h-5 w-5 text-red-500" />
            Error
          </div>
          <div className="text-sm text-gray-800">{errorMessage}</div>
        </div>
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    
    try {
      await axios.delete(`/admin/tasks/${taskToDelete}`);
      setChallenges(prev => prev.filter(t => t.id !== taskToDelete));
      
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Success
          </div>
          <div className="text-sm text-gray-800">Photo task deleted successfully!</div>
        </div>
      );
    } catch (err) {
      console.error('Error deleting task:', err);
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <Trash2 className="h-5 w-5 text-red-500" />
            Error
          </div>
          <div className="text-sm text-gray-800">Failed to delete task. Please try again.</div>
        </div>
      );
    } finally {
      setTaskToDelete(null);
    }
  };

  const updateTask = async (id: string, updatedTask: Partial<Challenge>) => {
    try {
      console.log('Updating task with ID:', id);
      console.log('Update data:', updatedTask);
      
      // Transform the data to match the backend API structure
      const payload = {
        prompt: updatedTask.task_description,
        mode: updatedTask.difficulty,
        status: updatedTask.status,
        points: updatedTask.points
      };

      console.log('Sending payload to backend:', payload);

      const response = await axios.put(`/admin/tasks/${id}`, payload);
      
      if (response.data) {
        console.log('Update successful:', response.data);
        
        // Update the local state with the new data
        setChallenges(prev => prev.map(challenge => 
          challenge.id === id 
            ? {
                ...challenge,
                task_description: updatedTask.task_description || challenge.task_description,
                difficulty: updatedTask.difficulty || challenge.difficulty,
                status: updatedTask.status || challenge.status,
                points: updatedTask.points || challenge.points
              }
            : challenge
        ));

        setSelectedTask(null);
        // Remove alert and use toast instead
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Success
            </div>
            <div className="text-sm text-gray-800">Task updated successfully!</div>
          </div>
        );
      }
    } catch (err: any) {
      console.error('Error updating task:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update task. Please try again.';
      // Show error toast instead of alert
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <X className="h-5 w-5 text-red-500" />
            Error
          </div>
          <div className="text-sm text-gray-800">{errorMessage}</div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FEF6E9]">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-orange-800">Admin Dashboard</h1>
            <p className="text-lg text-orange-600 mt-2">Manage users and photography challenges</p>
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
                    <div className="max-h-[600px] overflow-y-auto">
                      <Table>
                        <TableHeader className="bg-orange-50 sticky top-0">
                          <TableRow>
                            <TableHead className="w-[20%]">Name</TableHead>
                            <TableHead className="w-[20%]">Surname</TableHead>
                            <TableHead className="w-[25%]">Email</TableHead>
                            <TableHead className="w-[15%]">Join Date</TableHead>
                            <TableHead className="w-[10%]">Points</TableHead>
                            <TableHead className="w-[10%] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users
                            .filter(user =>
                              (user.name?.toLowerCase() || '').includes(searchUser.toLowerCase()) ||
                              (user.surname?.toLowerCase() || '').includes(searchUser.toLowerCase()) ||
                              user.email.toLowerCase().includes(searchUser.toLowerCase())
                            )
                            .map((user) => (
                              <TableRow key={user.id} className="hover:bg-orange-50">
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium">{user.name || 'No name'}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    <span>{user.surname || '-'}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span>{user.email}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{formatDate(user.join_date)}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-gray-400" />
                                    <span>{user.points}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 justify-end">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        console.log('Setting selected user:', user);
                                        setSelectedUser({
                                          id: user.id,
                                          name: user.name,
                                          surname: user.surname,
                                          email: user.email,
                                          points: user.points,
                                          join_date: user.join_date
                                        });
                                      }}
                                      className="hover:bg-blue-100"
                                    >
                                      <Edit className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setUserToDelete(user.id)}
                                      className="hover:bg-red-100"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDifficulty(prev => 
                          prev.includes('easy') 
                            ? prev.filter(d => d !== 'easy')
                            : [...prev, 'easy']
                        )}
                        className={`${
                          selectedDifficulty.includes('easy')
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-transparent'
                        }`}
                      >
                        Easy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDifficulty(prev => 
                          prev.includes('medium') 
                            ? prev.filter(d => d !== 'medium')
                            : [...prev, 'medium']
                        )}
                        className={`${
                          selectedDifficulty.includes('medium')
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-transparent'
                        }`}
                      >
                        Medium
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDifficulty(prev => 
                          prev.includes('hard') 
                            ? prev.filter(d => d !== 'hard')
                            : [...prev, 'hard']
                        )}
                        className={`${
                          selectedDifficulty.includes('hard')
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-transparent'
                        }`}
                      >
                        Hard
                      </Button>
                    </div>
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
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-orange-200 overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto">
                      <Table>
                        <TableHeader className="bg-orange-50 sticky top-0">
                          <TableRow>
                            <TableHead className="w-[30%]">Task Description</TableHead>
                            <TableHead className="w-[15%]">Difficulty</TableHead>
                            <TableHead className="w-[15%]">Points</TableHead>
                            <TableHead className="w-[20%]">Created Date</TableHead>
                            <TableHead className="w-[10%]">Status</TableHead>
                            <TableHead className="w-[10%] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {challenges
                            .filter(task =>
                              task.task_description.toLowerCase().includes(searchChallenge.toLowerCase()) &&
                              (selectedDifficulty.length === 0 || selectedDifficulty.includes(task.difficulty))
                            )
                            .map((task) => (
                              <TableRow key={task.id}>
                                <TableCell className="font-medium">{task.task_description}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    task.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                    task.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {task.difficulty}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-gray-400" />
                                    <span>{task.points}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{formatDate(task.created_date)}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    task.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {task.status}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setSelectedTask(task)}
                                      className="hover:bg-blue-100"
                                    >
                                      <Edit className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setTaskToDelete(task.id)}
                                      className="hover:bg-red-100"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
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
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onSave={(updatedData) => updateUser(selectedUser.id, updatedData)}
          />
        )}
        {selectedTask && (
          <EditTaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onSave={updateTask}
          />
        )}

        {/* Task Delete Dialog */}
        <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-gray-900">Delete Task</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete this task? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-900">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* User Delete Dialog */}
        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-gray-900">Delete User</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete this user? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-900">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => userToDelete && deleteUser(userToDelete)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Admin; 