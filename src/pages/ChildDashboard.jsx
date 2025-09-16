import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  Card,
  CardContent,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import {
  Star,
  EmojiEvents,
  Add,
  Close,
  Celebration,
  EmojiEventsOutlined,
} from "@mui/icons-material";
import Confetti from "react-confetti";
import { useAuth } from "../context/AuthContext";
import ChildTasks from "../components/child/ChildTasks";
import AddWishForm from "../components/child/AddWishForm";
import { API } from "../components/api/axiosInstance";

export const ChildDashboard = ({ activeTab }) => {
  const { user } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);
  const [wishes, setWishes] = useState([]);
  const [showAddWishForm, setShowAddWishForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedTasks, setCompletedTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");

  let localChild = {};
  try {
    localChild = JSON.parse(localStorage.getItem("kiddoUser")) || {};
  } catch (e) {
    localChild = {};
  }

  console.log("AuthContext user:", user);
  console.log("LocalStorage kiddoUser:", localChild);

  const childId =
    user?._id ||
    user?.id ||
    user?.user?._id ||
    user?.user?.id ||
    localChild._id ||
    localChild.id ||
    localChild.user?._id ||
    localChild.user?.id;

  const childData = {
    id: childId,
    name:
      user?.name ||
      localChild.name ||
      user?.user?.name ||
      localChild.user?.name ||
      "Child User",
    email:
      user?.email ||
      localChild.email ||
      user?.user?.email ||
      localChild.user?.email ||
      "",
    age:
      user?.age ||
      localChild.age ||
      user?.user?.age ||
      localChild.user?.age ||
      8,
    totalPoints:
      user?.totalPoints ||
      localChild.totalPoints ||
      user?.user?.totalPoints ||
      localChild.user?.totalPoints ||
      150,
    redeemedPoints:
      user?.redeemedPoints ||
      localChild.redeemedPoints ||
      user?.user?.redeemedPoints ||
      localChild.user?.redeemedPoints ||
      50,
    level:
      user?.level ||
      localChild.level ||
      user?.user?.level ||
      localChild.user?.level ||
      3,
    streak:
      user?.streak ||
      localChild.streak ||
      user?.user?.streak ||
      localChild.user?.streak ||
      5,
    role: "Child",
  };

  console.log("Final Child Data:", childData);
  console.log("Final Child ID:", childData.id);

  const fetchWishes = async () => {
    if (!childData.id) {
      setError("User ID not found. Please try logging in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await API.get(`/wishes/child/${childData.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const transformedWishes = response.data.data.map((wish) => ({
        id: wish._id || wish.id,
        title: wish.title,
        description: wish.description,
        pointsRequired: wish.pointsRequired,
        status: wish.status || "pending",
      }));

      setWishes(transformedWishes);
    } catch (err) {
      console.error("Error fetching wishes:", err);
      if (err.response) {
        if (err.response.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else if (err.response.status === 404) {
          setError("Wishes endpoint not found. Please check the API URL.");
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
        setError("Failed to load wishes. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedTasks = async () => {
    if (!childData.id) {
      setTasksError("User ID not found. Please try logging in again.");
      setTasksLoading(false);
      return;
    }

    setTasksLoading(true);
    setTasksError("");
    try {
      console.log("Fetching completed tasks for child ID:", childData.id);
      const response = await API.get(`/tasks/child/${childData.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (Array.isArray(response.data)) {
        const completed = response.data.filter((task) =>
          ["completed", "approved", "pending_approval"].includes(task.status)
        );
        setCompletedTasks(completed);

        console.group("🏆 ACHIEVEMENTS TAB - COMPLETED TASKS LOG");
        console.log("Total completed tasks:", completed.length);
        console.table(
          completed.map((task) => ({
            ID: task._id,
            Title: task.title,
            Description: task.description,
            Status: task.status,
            Points: task.points || task.pointsAwarded || 0,
            CompletedAt: task.completedAt
              ? new Date(task.completedAt).toLocaleDateString()
              : "N/A",
          }))
        );
        console.groupEnd();
      } else {
        console.error(
          "Expected array but got:",
          typeof response.data,
          response.data
        );
        setTasksError("Unexpected data format received from server");
        setCompletedTasks([]);
      }
    } catch (err) {
      console.error("Error fetching completed tasks:", err);
      if (err.response) {
        if (err.response.status === 401) {
          setTasksError("Authentication failed. Please log in again.");
        } else if (err.response.status === 404) {
          setTasksError("Tasks endpoint not found. Please check the API URL.");
        } else {
          setTasksError(
            `Server error: ${err.response.status}. Please try again later.`
          );
        }
      } else if (err.request) {
        setTasksError(
          "Cannot connect to the server. Please check your connection and try again."
        );
      } else {
        setTasksError("Failed to load completed tasks. Please try again.");
      }
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 1 && childData.id) {
      fetchWishes();
    } else if (activeTab === 1 && !childData.id) {
      setError("User ID not found. Please try logging in again.");
    }

    if (activeTab === 2 && childData.id) {
      fetchCompletedTasks();
    } else if (activeTab === 2 && !childData.id) {
      setTasksError("User ID not found. Please try logging in again.");
    }
  }, [activeTab, childData.id]);

  const handleWishAdded = (newWish) => {
    const transformedWish = {
      id: newWish._id || newWish.id,
      title: newWish.title,
      description: newWish.description,
      pointsRequired: newWish.pointsRequired || 0,
      status: newWish.status || "pending",
    };
    setWishes((prevWishes) => [...prevWishes, transformedWish]);
    setShowAddWishForm(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleRetry = () => {
    if (childData.id) {
      fetchWishes();
    } else {
      setError("User ID not found. Please try logging in again.");
    }
  };
  const handleTasksRetry = () => {
    if (childData.id) {
      fetchCompletedTasks();
    } else {
      setTasksError("User ID not found. Please try logging in again.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {showConfetti && <Confetti />}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {childData.name}! 🌟
        </Typography>
        <Typography variant="h6" color="text.secondary">
          You're doing amazing! Keep up the great work!
        </Typography>
      </Box>

      {activeTab === 0 && <ChildTasks childId={childData.id} />}

      {activeTab === 1 && (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" component="h2">
              My Wish List
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowAddWishForm(true)}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: "bold",
              }}
              disabled={!childData.id}
            >
              Add Wish
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleRetry}
                sx={{ mr: 2 }}
              >
                Retry
              </Button>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {wishes.length === 0 && !error ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h6" color="text.secondary">
                      No wishes yet! Add your first wish to get started.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setShowAddWishForm(true)}
                      sx={{ mt: 2 }}
                      disabled={!childData.id}
                    >
                      Add Your First Wish
                    </Button>
                  </Paper>
                </Grid>
              ) : (
                wishes.map((wish) => (
                  <Grid item xs={12} sm={6} md={4} key={wish.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" component="h3">
                          {wish.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {wish.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            <Celebration sx={{ mr: 1 }} />
            Your Achievements - Completed Tasks ({completedTasks.length})
          </Typography>

          {tasksError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleTasksRetry}
                sx={{ mr: 2 }}
              >
                Retry
              </Button>
              {tasksError}
            </Alert>
          )}

          {tasksLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : completedTasks.length > 0 ? (
            <Grid container spacing={3}>
              {completedTasks.map((task) => (
                <Grid item xs={12} sm={6} md={4} key={task._id}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 2 }}
                      >
                        <EmojiEventsOutlined
                          sx={{
                            fontSize: 24,
                            color:
                              task.status === "approved" ? "gold" : "orange",
                          }}
                        />
                        <Typography variant="h6" component="h3">
                          {task.title}
                        </Typography>
                      </Stack>

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
                            task.status.charAt(0).toUpperCase() +
                            task.status.slice(1)
                          }
                          color={
                            task.status === "approved" ? "success" : "info"
                          }
                          size="small"
                          variant="outlined"
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

              {/* Summary Card */}
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <EmojiEvents sx={{ fontSize: 48 }} />
                    <Box>
                      <Typography variant="h6">Congratulations! 🎉</Typography>
                      <Typography variant="body1">
                        You've completed {completedTasks.length} tasks and
                        earned{" "}
                        {completedTasks.reduce(
                          (sum, task) =>
                            sum + (task.points || task.pointsAwarded || 0),
                          0
                        )}{" "}
                        points total!
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <EmojiEventsOutlined
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No completed tasks yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete some tasks to see your achievements here!
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      <Dialog
        open={showAddWishForm}
        onClose={() => setShowAddWishForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add New Wish
          <IconButton
            aria-label="close"
            onClick={() => setShowAddWishForm(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <AddWishForm
            childId={childData.id}
            onWishAdded={handleWishAdded}
            onCancel={() => setShowAddWishForm(false)}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

