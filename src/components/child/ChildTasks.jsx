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
import { useToast } from "../common/Toast";

const ChildTasks = ({ childId }) => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [sendingTaskId, setSendingTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
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

  const pendingApprovalTasks = useMemo(
    () => tasks.filter((task) => task.status?.replace(/\s+/g, '_').toLowerCase() === "pending_approval"),
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
          console.log("Pending tasks count:", pending);
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

  const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
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
      showToast("Task sent successfully!", "success");
    } catch (err) {
      console.error("Error sending task:", err);
      setError("Failed to send task");
      showToast("Failed to send task. Please try again.", "error");
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

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        aria-label="Task Status Tabs"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab label={`Pending (${pendingTasks.length})`} />
        <Tab label={`Approved (${approvedTasks.length})`} />
        <Tab label={`Rejected (${rejectedTasks.length})`} />
        <Tab label={`Sent (${sentTasks.length})`} />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        {renderTasks(pendingTasks, true, false)}
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        {renderTasks(pendingApprovalTasks, false, false)}
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        {renderTasks(approvedTasks, false, false)}
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        {renderTasks(rejectedTasks, false, false)}
      </TabPanel>
      <TabPanel value={activeTab} index={4}>
        {renderTasks(sentTasks, false, false)}
      </TabPanel>
      <TabPanel value={activeTab} index={5}>
        {renderTasks(completedTasks, false, true)}
      </TabPanel>
    </Container>
  );
};

export default ChildTasks;
