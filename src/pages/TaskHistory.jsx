import React, { useEffect, useState } from 'react';
import { Container, Grid, Box, TextField, Button, Select, MenuItem, Typography } from '@mui/material';
import { db } from '../module/AuthenticationFirebase'; // Adjust the import according to your Firebase setup
import { collection, addDoc, deleteDoc, doc, query, onSnapshot, updateDoc } from 'firebase/firestore';
import { green, blue, orange, yellow } from '@mui/material/colors';
import { getAuth } from 'firebase/auth';

const TaskHistory = () => {
  const [todo, setTodo] = useState('');
  const [status, setStatus] = useState('');
  const [dicp, setDicp] = useState('');
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  // Function to handle status change
  const handleChange = (event) => {
    setStatus(event.target.value);
  };

  // Function to add a new task and log to history
  const addData = async (e) => {
    e.preventDefault();
    if (!user) return; // Ensure user is logged in

    try {
      // Add new task
      const docRef = await addDoc(collection(db, `users/${user.uid}/tasks`), {
        task: todo,
        status: status,
        dicp: dicp,
      });

      // Log the action to history
      await addDoc(collection(db, `users/${user.uid}/history`), {
        taskId: docRef.id,
        task: todo,
        status: status,
        dicp: dicp,
        action: 'Added',
        timestamp: new Date(),
      });

      console.log('Document written with ID: ', docRef.id);
      
      // Reset form fields
      setTodo('');
      setDicp('');
      setStatus('');
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  // Function to delete a task and log to history
  const deleteTask = async (taskId) => {
    if (!user) return; // Ensure user is logged in

    try {
      await deleteDoc(doc(db, `users/${user.uid}/tasks`, taskId));

      // Log to history
      await addDoc(collection(db, `users/${user.uid}/history`), {
        taskId: taskId,
        action: 'Deleted',
        timestamp: new Date(),
      });

      console.log('Document successfully deleted!');
    } catch (e) {
      console.error('Error removing document: ', e);
    }
  };

  // Function to delete a history entry
  const deleteHistory = async (historyId) => {
    if (!user) return; // Ensure user is logged in

    try {
      await deleteDoc(doc(db, `users/${user.uid}/history`, historyId));
      console.log('History document successfully deleted!');
    } catch (e) {
      console.error('Error removing history document: ', e);
    }
  };

  // Function to update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    if (!user) return; // Ensure user is logged in

    try {
      await updateDoc(doc(db, `users/${user.uid}/tasks`, taskId), { status: newStatus });

      // Log the status change to history
      await addDoc(collection(db, `users/${user.uid}/history`), {
        taskId: taskId,
        action: 'Updated',
        newStatus: newStatus,
        timestamp: new Date(),
      });

      console.log('Task status successfully updated!');
    } catch (e) {
      console.error('Error updating task status: ', e);
    }
  };

  // Fetch tasks and history for the logged-in user
  useEffect(() => {
    const fetchUserData = () => {
      const unsubscribeAuth = auth.onAuthStateChanged((user) => {
        if (user) {
          setUser(user);

          const getTasks = async () => {
            const q = query(collection(db, `users/${user.uid}/tasks`));
            const unsubscribeTasks = onSnapshot(q, (querySnapshot) => {
              const tasksList = [];
              querySnapshot.forEach((doc) => {
                tasksList.push({ id: doc.id, ...doc.data() });
              });
              setTasks(tasksList);
              console.log('Current tasks: ', tasksList);
            });

            return () => unsubscribeTasks();
          };

          const getHistory = async () => {
            const q = query(collection(db, `users/${user.uid}/history`));
            const unsubscribeHistory = onSnapshot(q, (querySnapshot) => {
              const historyList = [];
              querySnapshot.forEach((doc) => {
                historyList.push({ id: doc.id, ...doc.data() });
              });
              setHistory(historyList);
              console.log('Task history: ', historyList);
            });

            return () => unsubscribeHistory();
          };

          getTasks();
          getHistory();
        }
      });

      return () => unsubscribeAuth();
    };

    fetchUserData();
  }, [auth]);

  // Filter tasks based on their status
  const filterTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      {/* Top Section */}
      <Box sx={{ width: '100%', maxWidth: 600, padding: 2, backgroundColor: '#f5f5f5', borderRadius: 2, boxShadow: 2 }}>
        <form onSubmit={addData}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>Add New Task</Typography>
          <TextField
            id="todo-input"
            label="Enter a todo"
            value={todo}
            onChange={e => setTodo(e.target.value)}
            fullWidth
            sx={{ marginBottom: 1 }}
          />
          <TextField
            id="discretion"
            label="Description"
            type="text"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: 2 }}
            value={dicp}
            onChange={e => setDicp(e.target.value)}
          />
          <Select
            value={status}
            onChange={handleChange}
            fullWidth
            sx={{ marginBottom: 3 }}
          >
            <MenuItem value="" disabled>Select a status</MenuItem>
            <MenuItem value="To Do">To Do</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
          <Button variant="contained" color="primary" type="submit">
            Add Todo
          </Button>
        </form>
      </Box>

      {/* Task Sections */}
      <Grid container spacing={2} sx={{ mt: 4 }}>
        {/* To Do Section */}
        <Grid item xs={12} sm={4}>
          <Box sx={{ height: 400, padding: 2, backgroundColor: blue[100], borderRadius: 2, boxShadow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>To Do</Typography>
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {filterTasksByStatus('To Do').map((task) => (
                <Box key={task.id} sx={{ padding: 2, mb: 1, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 1, backgroundColor: '#ffffff' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">Name: {task.task}</Typography>
                    <Typography variant="caption">Desc: {task.dicp}</Typography>
                  </Box>
                  <Box>
                    <Button variant="outlined" color="primary" onClick={() => updateTaskStatus(task.id, 'In Progress')} sx={{ mr: 1 }}>
                      In Progress
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => deleteTask(task.id)}>
                      Delete
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* In Progress Section */}
        <Grid item xs={12} sm={4}>
          <Box sx={{ height: 400, padding: 2, backgroundColor: orange[100], borderRadius: 2, boxShadow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>In Progress</Typography>
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {filterTasksByStatus('In Progress').map((task) => (
                <Box key={task.id} sx={{ padding: 2, mb: 1, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 1, backgroundColor: '#ffffff' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">Name: {task.task}</Typography>
                    <Typography variant="caption">Desc: {task.dicp}</Typography>
                  </Box>
                  <Box>
                    <Button variant="outlined" color="success" onClick={() => updateTaskStatus(task.id, 'Completed')} sx={{ mr: 1 }}>
                      Completed
                    </Button>
                    <Button variant="outlined" color="primary" onClick={() => updateTaskStatus(task.id, 'To Do')} sx={{ mr: 1 }}>
                      To Do
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => deleteTask(task.id)}>
                      Delete
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Completed Section */}
        <Grid item xs={12} sm={4}>
          <Box sx={{ height: 400, padding: 2, backgroundColor: green[100], borderRadius: 2, boxShadow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>Completed</Typography>
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {filterTasksByStatus('Completed').map((task) => (
                <Box key={task.id} sx={{ padding: 2, mb: 1, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 1, backgroundColor: '#ffffff' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">Name: {task.task}</Typography>
                    <Typography variant="caption">Desc: {task.dicp}</Typography>
                  </Box>
                  <Box>
                    <Button variant="outlined" color="primary" onClick={() => updateTaskStatus(task.id, 'In Progress')} sx={{ mr: 1 }}>
                      In Progress
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => deleteTask(task.id)}>
                      Delete
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* History Section */}
      <Box sx={{ mt: 4, width: '100%', maxWidth: 600, padding: 2, backgroundColor: yellow[100], borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>Task History</Typography>
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {history.map((entry) => (
            <Box key={entry.id} sx={{ padding: 2, mb: 1, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 1, backgroundColor: '#ffffff' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">Task ID: {entry.taskId || 'N/A'}</Typography>
                <Typography variant="body2">Action: {entry.action}</Typography>
                <Typography variant="caption">Timestamp: {new Date(entry.timestamp.toDate()).toLocaleString()}</Typography>
                <Typography variant="caption">Description: {entry.dicp || 'N/A'}</Typography>
              </Box>
              <Button variant="outlined" color="error" onClick={() => deleteHistory(entry.id)}>
                Delete
              </Button>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default TaskHistory;
