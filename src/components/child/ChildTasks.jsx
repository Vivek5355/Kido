import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Star,
  Assignment,
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
  const [stats, setStats] = useState({
    totalPoints: 0,
    availablePoints: 0,
    pendingTasks: 0,
    completedTasks: 0,
    sentTasks: 0,
  });

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
        console.log("::::");
        const response = await API.get(`/tasks/child/${childId}`);
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
      } catch (err) {
        setError("Failed to fetch tasks. Please try again later.");
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [childId]);

  const handleSendTask = async (taskId) => {
    try {
      setSendingTaskId(taskId);
      await API.put(`/tasks/status/${taskId}`, {
        status: "sent",
      });
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
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      console.error("Error sending task:", err);
      setError("Failed to send task");
    } finally {
      setSendingTaskId(null);
    }
  };

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const completedTasks = tasks.filter((task) =>
    ["completed", "approved", "pending_approval"].includes(task.status)
  );
  const sentTasks = tasks.filter((task) => task.status === "sent");

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="300px"
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {showConfetti && <Confetti />}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{ p: 3, textAlign: "center", bgcolor: "success.50" }}
          >
            <Typography variant="h3" color="success.main">
              {stats.availablePoints}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available Points
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{ p: 3, textAlign: "center", bgcolor: "info.50" }}
          >
            <Typography variant="h3" color="info.main">
              {stats.pendingTasks}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Tasks
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{ p: 3, textAlign: "center", bgcolor: "warning.50" }}
          >
            <Typography variant="h3" color="warning.main">
              {stats.completedTasks}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed Tasks
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
        >
          <Assignment color="primary" />
          Pending Tasks ({pendingTasks.length})
        </Typography>

        {pendingTasks.length > 0 ? (
          <Grid container spacing={3}>
            {pendingTasks.map((task) => (
              <Grid item xs={12} md={6} key={task._id}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {task.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {task.description}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Chip
                        icon={<Star />}
                        label={`${
                          task.points || task.pointsAwarded || 0
                        } points`}
                        color="primary"
                        size="small"
                      />
                      <Button
                        variant="contained"
                        startIcon={
                          sendingTaskId === task._id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Send />
                          )
                        }
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
          <Alert severity="info" icon={<Celebration />}>
            Great! All tasks have been sent. Check back later for more tasks!
          </Alert>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Sent Tasks Section */}
      {sentTasks.length > 0 && (
        <>
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
            >
              <Notifications color="info" />
              Sent Tasks ({sentTasks.length})
            </Typography>

            <Grid container spacing={3}>
              {sentTasks.map((task) => (
                <Grid item xs={12} md={6} key={task._id}>
                  <Card
                    sx={{
                      height: "100%",
                      bgcolor: "info.50",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {task.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {task.description}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Chip
                          icon={<Star />}
                          label={`${
                            task.points || task.pointsAwarded || 0
                          } points`}
                          color="info"
                          size="small"
                        />
                        <Chip label="Sent" color="info" variant="outlined" />
                      </Stack>
                      {task.sentAt && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1, display: "block" }}
                        >
                          Sent on: {new Date(task.sentAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
          <Divider sx={{ my: 4 }} />
        </>
      )}

      {/* Completed Tasks Section */}
      <Box>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
        >
          <PendingActions color="success" />
          Completed Tasks ({completedTasks.length})
        </Typography>

        {completedTasks.length > 0 ? (
          <Grid container spacing={3}>
            {completedTasks.map((task) => (
              <Grid item xs={12} md={6} key={task._id}>
                <Card
                  sx={{
                    height: "100%",
                    bgcolor:
                      task.status === "approved" ? "success.50" : "warning.50",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {task.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {task.description}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Chip
                        icon={<Star />}
                        label={`${
                          task.points || task.pointsAwarded || 0
                        } points`}
                        color={
                          task.status === "approved" ? "success" : "warning"
                        }
                        size="small"
                      />
                      <Chip
                        label={
                          task.status === "approved"
                            ? "Approved"
                            : "Pending Approval"
                        }
                        color={
                          task.status === "approved" ? "success" : "warning"
                        }
                        variant="outlined"
                      />
                    </Stack>
                    {task.completedAt && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
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
