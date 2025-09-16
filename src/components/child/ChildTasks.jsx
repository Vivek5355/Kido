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
} from "@mui/material";
import {
  Star,
  PendingActions,
  Celebration,
  Send,
  Notifications,
} from "@mui/icons-material";
import Confetti from "react-confetti";
import { API } from "../api/axiosInstance";

const ChildTasks = ({ childId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [sendingTaskId, setSendingTaskId] = useState(null);
  const [toastOpen, setToastOpen] = useState(false); // ✅ Snackbar state
  const [stats, setStats] = useState({
    totalPoints: 0,
    availablePoints: 0,
    pendingTasks: 0,
    completedTasks: 0,
    sentTasks: 0,
  });

  const pendingTasks = useMemo(
    () => tasks.filter((task) => task.status === "pending"),
    [tasks]
  );

  const sentTasks = useMemo(
    () => tasks.filter((task) => task.status === "sent"),
    [tasks]
  );

  const completedTasks = useMemo(
    () =>
      tasks.filter((task) =>
        ["completed", "approved", "pending_approval"].includes(task.status)
      ),
    [tasks]
  );

  useEffect(() => {
    const fetchTasks = async () => {
      if (!childId) {
        setError("Child ID is not available. Please try logging in again.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        console.log("Fetching tasks for child ID:", childId);
        const response = await API.get(`/tasks/child/${childId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        if (Array.isArray(response.data)) {
          setTasks(response.data);
          const pending = response.data.filter(
            (task) => task.status === "pending"
          ).length;
          const completed = response.data.filter((task) =>
            ["completed", "approved", "pending_approval", "sent"].includes(
              task.status
            )
          ).length;
          const sent = response.data.filter(
            (task) => task.status === "sent"
          ).length;
          const totalPoints = response.data
            .filter((task) =>
              ["approved", "pending_approval", "completed", "sent"].includes(
                task.status
              )
            )
            .reduce(
              (sum, task) => sum + (task.points || task.pointsAwarded || 0),
              0
            );
          const availablePoints = response.data
            .filter((task) => task.status === "approved")
            .reduce(
              (sum, task) => sum + (task.points || task.pointsAwarded || 0),
              0
            );
          setStats({
            pendingTasks: pending,
            completedTasks: completed,
            sentTasks: sent,
            totalPoints: totalPoints,
            availablePoints: availablePoints,
          });
        } else {
          console.error(
            "Expected array but got:",
            typeof response.data,
            response.data
          );
          setError("Unexpected data format received from server");
          setTasks([]);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
        if (err.response) {
          if (err.response.status === 401) {
            setError("Authentication failed. Please log in again.");
          } else if (err.response.status === 404) {
            setError("Tasks endpoint not found. Please check the API URL.");
          } else {
            setError(
              `Server error: ${err.response.status}. Please try again later.`
            );
          }
        } else if (err.request) {
          setError(
            "Cannot connect to the server. Please check your connection and try again."
          );
        } else {
          setError("Failed to fetch tasks. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [childId]);

  const handleSendTask = async (taskId) => {
    try {
      setSendingTaskId(taskId);
      await API.put(
        `/tasks/status/${taskId}`,
        { status: "sent" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId
            ? { ...task, status: "sent", sentAt: new Date().toISOString() }
            : task
        )
      );
      setStats((prev) => ({
        ...prev,
        pendingTasks: prev.pendingTasks - 1,
        sentTasks: prev.sentTasks + 1,
      }));
      setShowConfetti(true);
      setToastOpen(true); // ✅ Show toast
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      console.error("Error sending task:", err);
      setError("Failed to send task");
    } finally {
      setSendingTaskId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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

      {/* ✅ Snackbar for success message */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setToastOpen(false)}>
          Task sent successfully!
        </Alert>
      </Snackbar>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="primary">
              {stats.availablePoints}
            </Typography>
            <Typography variant="body2">Available Points</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="warning.main">
              {stats.pendingTasks}
            </Typography>
            <Typography variant="body2">Pending Tasks</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="success.main">
              {stats.completedTasks}
            </Typography>
            <Typography variant="body2">Completed Tasks</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Pending Tasks */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          <PendingActions sx={{ mr: 1 }} />
          Pending Tasks ({pendingTasks.length})
        </Typography>

        {pendingTasks.length > 0 ? (
          <Grid container spacing={2}>
            {pendingTasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {task.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {task.description}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        icon={<Star />}
                        label={`${task.points || task.pointsAwarded || 0} points`}
                        color="primary"
                        size="small"
                      />
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Send />}
                        onClick={() => handleSendTask(task._id)}
                        disabled={sendingTaskId === task._id}
                        color="primary"
                      >
                        {sendingTaskId === task._id
                          ? "Sending..."
                          : "Send Task"}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="success">
            Great! All tasks have been sent. Check back later for more tasks!
          </Alert>
        )}
      </Box>

      {/* Sent Tasks */}
      {sentTasks.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              <Notifications sx={{ mr: 1 }} />
              Sent Tasks ({sentTasks.length})
            </Typography>
            <Grid container spacing={2}>
              {sentTasks.map((task) => (
                <Grid item xs={12} sm={6} md={4} key={task._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {task.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {task.description}
                      </Typography>
                      <Chip
                        icon={<Star />}
                        label={`${task.points || task.pointsAwarded || 0} points`}
                        color="info"
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}

      {/* Completed Tasks */}
      <Divider sx={{ my: 3 }} />
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          <Celebration sx={{ mr: 1 }} />
          Completed Tasks ({completedTasks.length})
        </Typography>

        {completedTasks.length > 0 ? (
          <Grid container spacing={2}>
            {completedTasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {task.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {task.description}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Chip
                        icon={<Star />}
                        label={`${task.points || task.pointsAwarded || 0} points`}
                        color={
                          task.status === "approved" ? "success" : "warning"
                        }
                        size="small"
                      />
                    </Stack>
                    {task.completedAt && (
                      <Typography variant="caption" color="text.secondary">
                        Completed on:{" "}
                        {new Date(task.completedAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">No completed tasks yet.</Alert>
        )}
      </Box>
    </Container>
  );
};

export default ChildTasks;
