import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Snackbar,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Star,
  Send,
} from "@mui/icons-material";
import Confetti from "react-confetti";
import { API } from "../api/axiosInstance";

const ChildTasks = ({ childId, totalPoint }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [sendingTaskId, setSendingTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // API configuration
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  console.log("TotalPoint :::",totalPoint)

  // API calls
  const fetchTasks = async () => {
    if (!childId) {
      setError("Child ID is not available. Please try logging in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await API.get(`/tasks/child/${childId}`, {
        headers: getAuthHeaders(),
      });
      
      if (Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        console.error("Expected array but got:", typeof response.data, response.data);
        setError("Unexpected data format received from server");
        setTasks([]);
      }
    } catch (err) {
      handleApiError(err, "fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await API.put(
        `/tasks/status/${taskId}`,
        { status },
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (err) {
      handleApiError(err, "updating task status");
      throw err;
    }
  };

  const createNewTask = async (taskData) => {
    try {
      const response = await API.post("/tasks", taskData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (err) {
      handleApiError(err, "creating task");
      throw err;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await API.delete(`/tasks/${taskId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (err) {
      handleApiError(err, "deleting task");
      throw err;
    }
  };

  const getTaskDetails = async (taskId) => {
    try {
      const response = await API.get(`/tasks/${taskId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (err) {
      handleApiError(err, "fetching task details");
      throw err;
    }
  };

  // Error handling utility
  const handleApiError = (err, operation) => {
    console.error(`Error ${operation}:`, err);
    
    if (err.response) {
      if (err.response.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.response.status === 404) {
        setError(`${operation.replace(/\b\w/g, l => l.toUpperCase())} not found. Please check the API URL.`);
      } else if (err.response.status === 403) {
        setError("You don't have permission to perform this action.");
      } else {
        setError(`Server error: ${err.response.status}. Please try again later.`);
      }
    } else if (err.request) {
      setError("Cannot connect to the server. Please check your connection and try again.");
    } else {
      setError(`Failed to ${operation}. Please try again later.`);
    }

    // Show snackbar for user feedback
    setSnackbar({
      open: true,
      message: `Failed to ${operation}`,
      severity: "error"
    });
  };

  // Filter tasks using useMemo for better performance
  const pendingTasks = useMemo(
    () => tasks.filter((task) => task.status === "pending"),
    [tasks]
  );

  const approvedTasks = useMemo(
    () => tasks.filter((task) => task.status?.replace(/\s+/g, '_').toLowerCase() === "approved"),
    [tasks]
  );

  const rejectedTasks = useMemo(
    () => tasks.filter((task) => task.status?.replace(/\s+/g, '_').toLowerCase() === "rejected"),
    [tasks]
  );

  const sentTasks = useMemo(
    () => tasks.filter((task) => task.status?.replace(/\s+/g, '_').toLowerCase() === "sent"),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status?.replace(/\s+/g, '_').toLowerCase() === "completed"),
    [tasks]
  );

  // Initial data fetch
  useEffect(() => {
    fetchTasks();
  }, [childId]);

  // TabPanel component
  const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  // Task sending handler
  const handleSendTask = async (taskId) => {
    try {
      setSendingTaskId(taskId);
      await API.put(
        `/tasks/status/${taskId}`,
        { type: 2, status: "sent" },
        {
          headers: getAuthHeaders(),
        }
      );
      // Update local state
      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId
            ? { ...task, status: "sent", sentAt: new Date().toISOString() }
            : task
        )
      );
      setShowConfetti(true);
      setSnackbar({
        open: true,
        message: "Task sent successfully!",
        severity: "success"
      });
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (err) {
      // Error is already handled in updateTaskStatus
    } finally {
      setSendingTaskId(null);
    }
  };

  // Task rendering function
  const renderTasks = (taskList, showSendButton = false, showCompletedAt = false) => (
    taskList.length > 0 ? (
      <Grid container spacing={2}>
        {taskList.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {task.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {task.description}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Chip
                    icon={<Star />}
                    label={`${task.points || task.pointsAwarded || 0} points`}
                    color={task.status?.replace(/\s+/g, '_').toLowerCase() === "approved" ? "success" : task.status?.replace(/\s+/g, '_').toLowerCase() === "pending_approval" ? "warning" : "primary"}
                    size="small"
                  />
                  {showSendButton && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Send sx={{ fontSize: 16 }} />}
                      onClick={() => handleSendTask(task._id)}
                      disabled={sendingTaskId === task._id}
                      color="primary"
                      sx={{
                        fontSize: "1rem",
                        px: 1,
                        py: 0.3,
                        minWidth: "auto",
                      }}
                    >
                      {sendingTaskId === task._id ? "Sending..." : "Send Task"}
                    </Button>
                  )}
                </Stack>
                {showCompletedAt && task.completedAt && (
                  <Typography variant="caption" color="text.secondary">
                    Completed on: {new Date(task.completedAt).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    ) : (
      <Alert severity="info">No tasks in this category.</Alert>
    )
  );

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state for missing childId
  if (!childId) {
    return (
      <Alert severity="error">
        Child ID is not available. Please try logging in again.
      </Alert>
    );
  }

  return (
    <Container>
      {showConfetti && <Confetti />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="primary">
              {totalPoint}
            </Typography>
            <Typography variant="body2">Available Points</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="warning.main">
              {pendingTasks.length}
            </Typography>
            <Typography variant="body2">Pending Tasks</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="success.main">
              {completedTasks.length + sentTasks.length + approvedTasks.length}
            </Typography>
            <Typography variant="body2">Completed Tasks</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        aria-label="Task Status Tabs"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        {/* <Tab label={`Pending (${pendingTasks.length})`} />
        <Tab label={`Approved (${approvedTasks.length})`} />
        <Tab label={`Rejected (${rejectedTasks.length})`} />
        <Tab label={`Sent (${sentTasks.length})`} />
        <Tab label={`Completed (${completedTasks.length})`} /> */}
      </Tabs>

      {/* //Tab Panels  */}
       <TabPanel value={activeTab} index={0}>
        {renderTasks(pendingTasks, true, false)}
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        {renderTasks(approvedTasks, false, true)}
      </TabPanel>
      
      <TabPanel value={activeTab} index={2}>
        {renderTasks(rejectedTasks, false, true)}
      </TabPanel>
      
      <TabPanel value={activeTab} index={3}>
        {renderTasks(sentTasks, false, true)}
      </TabPanel>
      
      <TabPanel value={activeTab} index={4}>
        {renderTasks(completedTasks, false, true)}
      </TabPanel>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={800}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ChildTasks;