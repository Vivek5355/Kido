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
  Snackbar,
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
import { useLocation } from "react-router-dom";

export const ChildDashboard = ({ activeTab }) => {
  const location = useLocation();
  const { user, userRole, login, updateUserPoints } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);
  const [wishes, setWishes] = useState([]);
  const [showAddWishForm, setShowAddWishForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedTasks, setCompletedTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");
  const [rewards, setRewards] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [data, setData] = useState("");
  const [parentName, setParentName] = useState("");
  const [loadingParent, setLoadingParent] = useState(false);

  let localChild = {};
  try {
    localChild = JSON.parse(localStorage.getItem("kiddoUser")) || {};
  } catch (e) {
    localChild = {};
  }
  console.log("user", user);

  // Add function to fetch parent name
  const fetchParentName = async () => {
    if (!user?.user?.user?.parent) {
      setParentName("Parent");
      return;
    }

    setLoadingParent(true);
    try {
      const response = await API.get(`/users/${user.user.user.parent}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      // Adjust the path based on your API response structure
      const parentName =
        response.data.name ||
        response.data.user?.name ||
        response.data.data?.name ||
        "Parent";
      setParentName(parentName);
    } catch (error) {
      console.error("Error fetching parent name:", error);
      setParentName("Parent"); // Fallback name
    } finally {
      setLoadingParent(false);
    }
  };

  const fetchWishes = async () => {
    if (!user?.user?.user?._id) {
      setError("User ID not found. Please try logging in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await API.get(`/wishes/child/${user?.user?.user?._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Response", response);
      const transformedWishes = response.data.data.map((wish) => ({
        id: wish._id || wish.id,
        title: wish.title,
        description: wish.description,
        pointsRequired: wish.pointsRequired,
        status: wish.status || "pending",
      }));
      setWishes(transformedWishes);
    } catch (err) {
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
    if (!user?.user?.user?._id) {
      setTasksError("User ID not found. Please try logging in again.");
      setTasksLoading(false);
      return;
    }

    setTasksLoading(true);
    setTasksError("");
    try {
      const response = await API.get(`/tasks/child/${user?.user?.user?._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      console.log("User", user);

      if (Array.isArray(response.data)) {
        const completed = response.data.filter((task) =>
          ["approved"].includes(task.status)
        );
        setCompletedTasks(completed);
      } else {
        setTasksError("Unexpected data format received from server");
        setCompletedTasks([]);
      }
    } catch (err) {
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

  const fetchRewards = async () => {
    if (!user?.user?.user?._id) {
      console.error("User ID not found. Cannot fetch rewards.");
      return;
    }
    try {
      const response = await API.get(`/rewards/${user?.user?.user?.parent}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Rewards API Response:", response.data);
      setRewards(
        response.data.filter((reward) => reward.status !== "redeemed")
      );
    } catch (error) {
      console.error("Error fetching rewards:", error);
    }
  };

  const childSegments = ["tasks", "wishes", "achievements", "rewards"];
  const basePath = "/dashboard/child";
  const pathname = location.pathname || "";
  let derivedTab = 0;
  if (pathname.startsWith(basePath)) {
    const afterBase = pathname.slice(basePath.length + 1);
    const segment = afterBase.split("/")[0] || "";
    const idx = childSegments.indexOf(segment);
    if (idx >= 0) derivedTab = idx;
  }

  const currentTab = typeof activeTab === "number" ? derivedTab : derivedTab;

  useEffect(() => {
    // Fetch parent name when component mounts
    if (user?.user?.user?._id) {
      fetchParentName();
    }

    if (currentTab === 1 && user?.user?.user?._id) {
      fetchWishes();
    }
    if (currentTab === 2 && user?.user?.user?._id) {
      fetchCompletedTasks();
    }
    if (currentTab === 3 && user?.user?.user?._id) {
      fetchRewards();
    }
  }, [currentTab, user?.user?.user?._id, user?.user?.user?.parent]);

  useEffect(() => {
    if (successMessage) {
      console.log("successMessage set:", successMessage);
    }
  }, [successMessage]);

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
    if (user?.user?.user?._id) {
      fetchWishes();
    } else {
      setError("User ID not found. Please try logging in again.");
    }
  };

  const handleTasksRetry = () => {
    if (user?.user?.user?._id) {
      fetchCompletedTasks();
    } else {
      setTasksError("User ID not found. Please try logging in again.");
    }
  };

  const handleRedeemReward = async (rewardId, childId) => {
    console.log("Redeem button clicked for reward:", rewardId, "child:", childId);
    try {
      const rewardToRedeem = rewards.find((reward) => reward._id === rewardId);
      if (!rewardToRedeem) {
        setSuccessMessage("Reward not found");
        return;
      }
      const currentPoints = user?.user?.points || user?.user?.user?.points || 0;
      console.log("Current points:", currentPoints, "required:", rewardToRedeem.points);
      if (rewardToRedeem.points > currentPoints) {
        setSuccessMessage("Insufficient points to redeem this reward!");
        return;
      }
      const response = await API.patch(
        `/rewards/${rewardId}`,
        { childId, status: "redeemed" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      console.log("Redeem Response:", data.remainingPoints);
      setData(data?.remainingPoints);
      updateUserPoints(data.remainingPoints);
      setSuccessMessage("Reward redeemed successfully!");
      console.log("Success message set: Reward redeemed successfully!");
      fetchRewards();
    } catch (error) {
      console.error("Error redeeming reward:", error);
      setSuccessMessage("Failed to redeem reward. Please try again.");
    }
  };

  console.log("child total point :: ", user?.user?.user?.points);
  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {showConfetti && <Confetti />}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.user?.user?.name} 🌟
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You're doing amazing! Keep up the great work!
          </Typography>
        </Box>

        {currentTab === 0 && (
          <ChildTasks
            childId={user?.user?.user?._id}
            totalPoint={user?.user?.points || user?.user?.user?.points}
          />
        )}

        {currentTab === 1 && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              My Wish List
            </Typography>
            <Box sx={{ mb: 3 }}>
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
                disabled={!user?.user?.user?._id}
              >
                Add Wish
              </Button>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                action={
                  <Button color="inherit" size="small" onClick={handleRetry}>
                    Retry
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {wishes.length === 0 && !error ? (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        No wishes yet! Add your first wish to get started.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setShowAddWishForm(true)}
                        sx={{ mt: 2 }}
                        disabled={!user?.user?.user?._id}
                      >
                        Add Your First Wish
                      </Button>
                    </Paper>
                  </Grid>
                ) : (
                  wishes.map((wish) => (
                    <Grid item xs={12} sm={6} md={4} key={wish.id}>
                      <Card sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {wish.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            paragraph
                          >
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

        {currentTab === 2 && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              Your Achievements - Completed Tasks ({completedTasks.length})
            </Typography>

            {tasksError && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                action={
                  <Button color="inherit" size="small" onClick={handleTasksRetry}>
                    Retry
                  </Button>
                }
              >
                {tasksError}
              </Alert>
            )}

            {tasksLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : completedTasks.length > 0 ? (
              <>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {completedTasks.map((task) => (
                    <Grid item xs={12} sm={6} md={4} key={task._id}>
                      <Card sx={{ borderRadius: 2 }}>
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
                          <Stack direction="row" spacing={1} alignItems="center">
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
                <Paper sx={{ p: 3, borderRadius: 2, bgcolor: "success.light" }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Celebration sx={{ mr: 1 }} />
                    Congratulations! 🎉
                  </Typography>
                  <Typography variant="body1">
                    You've completed {completedTasks.length} tasks and earned{" "}
                    <strong>
                      {completedTasks.reduce(
                        (sum, task) =>
                          sum + (task.points || task.pointsAwarded || 0),
                        0
                      )}{" "}
                      points
                    </strong>{" "}
                    total!
                  </Typography>
                </Paper>
              </>
            ) : (
              <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
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

        {currentTab === 3 && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              Rewards
            </Typography>
            {rewards.length > 0 ? (
              <Grid container spacing={3}>
                {rewards.map((reward) => (
                  <Grid item xs={12} sm={6} md={4} key={reward._id}>
                    <Card sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {reward.rewardName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                        >
                          Points: {reward.points}
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() =>
                            handleRedeemReward(reward._id, user?.user?.user?._id)
                          }
                        >
                          Redeem
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  No rewards found
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
              onClick={() => setShowAddWishForm(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <AddWishForm
              onWishAdded={handleWishAdded}
              onCancel={() => setShowAddWishForm(false)}
              childId={user?.user?.user?._id}
            />
          </DialogContent>
        </Dialog>
      </Container>

      <Snackbar
        open={!!successMessage}
        // autoHideDuration={800}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessMessage("")}
          severity={
            successMessage.includes("Insufficient") ||
            successMessage.includes("Failed")
              ? "error"
              : "success"
          }
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
