import React, { useEffect, useState } from 'react';
import { Container, Grid, Box, TextField, Button, Select, MenuItem, Typography } from '@mui/material';
import { db } from '../module/AuthenticationFirebase';
import { collection, addDoc, deleteDoc, doc, query, onSnapshot, updateDoc } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const MainPage = () => {
  const [todo, setTodo] = useState('');
  const [status, setStatus] = useState('');
  const [dicp, setDicp] = useState('');
  const [tasks, setTasks] = useState([]);

  const handleChange = (event) => {
    setStatus(event.target.value);
  };

  const addData = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "users"), {
        task: todo,
        status: status,
        dicp: dicp,
      });
      console.log("Document written with ID: ", docRef.id);
      setTodo('');
      setDicp('');
      setStatus('');
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "users", taskId));
      console.log("Document successfully deleted!");
    } catch (e) {
      console.error("Error removing document: ", e);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateDoc(doc(db, "users", taskId), { status: newStatus });
      console.log("Task status updated successfully!");
    } catch (e) {
      console.error("Error updating task status: ", e);
    }
  };

  useEffect(() => {
    const getData = async () => {
      const q = query(collection(db, 'users'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const users = [];
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
        setTasks(users);
        console.log('Current tasks: ', users);
      });

      return () => unsubscribe();
    };

    getData();

  }, []);

  const filterTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const { droppableId: sourceStatus } = source;
    const { droppableId: destinationStatus } = destination;
    const { draggableId: taskId } = result;

    if (sourceStatus !== destinationStatus) {
      updateTaskStatus(taskId, destinationStatus);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Top Section */}
      <Box sx={{ height: 200, width: '40%', color: 'white', padding: 2 }}>
        <form onSubmit={addData}>
          <TextField
            id="todo-input"
            label="Enter a todo"
            value={todo}
            onChange={e => setTodo(e.target.value)}
            fullWidth
            sx={{ marginBottom: '5px' }}
          />
          <TextField
            id="discretion"
            label="Description"
            type="text"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: '10px' }}
            onChange={e => setDicp(e.target.value)}
          />
          <Select
            value={status}
            onChange={handleChange}
            fullWidth
            sx={{ marginBottom: '20px' }}
          >
            <MenuItem value="" disabled>
              Select a status
            </MenuItem>
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
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {['To Do', 'In Progress', 'Completed'].map(status => (
            <Grid item xs={4} key={status}>
              <Droppable droppableId={status}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ height: 200, color: 'black', padding: 2, border: '1px solid black', borderRadius: '10px' }}
                  >
                    <Typography variant="h6">{status}</Typography>
                    {filterTasksByStatus(status).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ padding: 1, borderBottom: '1px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                          >
                            <Box>
                              <Typography variant="body2">Name: {task.task}</Typography>
                              <Typography variant="caption">Desc: {task.dicp}</Typography>
                            </Box>
                            <Button variant="outlined" color="error" onClick={() => deleteTask(task.id)}>
                              Delete
                            </Button>
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>
    </Container>
  );
};

export default MainPage;
