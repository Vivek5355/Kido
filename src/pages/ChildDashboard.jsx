import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Avatar,
  Chip,
  Stack,
  Alert,
} from "@mui/material";
import {
  Star,
  Assignment,
  Redeem,
  TrendingUp,
  EmojiEvents,
  CheckCircle,
  ChildCare,
} from "@mui/icons-material";
import Confetti from "react-confetti";
import { useAuth } from "../context/AuthContext";

const ChildDashboard = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth(); // Get logged-in user data
  const [showConfetti, setShowConfetti] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [wishes, setWishes] = useState([]);

  const userData = JSON.parse(localStorage.getItem("kiddoUser"));

  // Use actual logged-in child data
  const childData = {
    id: user?._id || "1",
    name: user?.name || "Child User",
    email: user?.email || "",
    age: user?.age || 8,
    totalPoints: user?.totalPoints || 150,
    redeemedPoints: user?.redeemedPoints || 50,
    level: user?.level || 3,
    streak: user?.streak || 5,
    role: "Child", // Always "Child" for child dashboard
  };

  const availablePoints = childData.totalPoints - childData.redeemedPoints;

  // Demo data for tasks and wishes
  useEffect(() => {
    const demoTasks = [
      {
        id: "1",
        title: "Read for 20 minutes",
        description: "Read any book of your choice",
        category: "Reading",
        points: 15,
        status: "pending",
      },
      {
        id: "2", 
        title: "Complete math worksheet",
        description: "Finish the addition problems",
        category: "Math",
        points: 20,
        status: "pending",
      },
    ];

    const demoWishes = [
      {
        id: "1",
        title: "New Art Supplies",
        description: "Colored pencils and sketchbook",
        pointsRequired: 75,
        status: "pending",
      },
      {
        id: "2",
        title: "Book Series", 
        description: "Magic Tree House collection",
        pointsRequired: 120,
        status: "pending",
      },
    ];

    setTasks(demoTasks);
    setWishes(demoWishes);
  }, []);

  const handleCompleteTask = (taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: "pending_approval", completedAt: new Date().toISOString() }
          : task
      )
    );
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleRequestRedemption = (wishId) => {
    setWishes((prev) =>
      prev.map((wish) =>
        wish.id === wishId 
          ? { ...wish, status: "pending_approval", requestedAt: new Date().toISOString() } 
          : wish
      )
    );
  };

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const completedTasks = tasks.filter((task) =>
    ["completed", "approved", "pending_approval"].includes(task.status)
  );

  const getProgressToNextLevel = () => {
    const pointsForNextLevel = (childData.level + 1) * 50;
    return Math.min((childData.totalPoints / pointsForNextLevel) * 100, 100);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {showConfetti && <Confetti />}

      {/* Profile Section with Child Info */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          textAlign: "center", 
          bgcolor: "primary.50",
          border: "2px solid",
          borderColor: "primary.200"
        }}
      >
        <Typography variant="h4" gutterBottom color="primary">
          Welcome back, {userData.name}! 🌟
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You're doing amazing! Keep up the great work!
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: "center", bgcolor: "success.50" }}>
            <Typography variant="h3" color="success.main">
              {availablePoints}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available Points
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: "center", bgcolor: "info.50" }}>
            <Typography variant="h3" color="info.main">
              {childData.level}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Level
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: "center", bgcolor: "warning.50" }}>
            <Typography variant="h3" color="warning.main">
              {childData.streak}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Day Streak
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: "center", bgcolor: "secondary.50" }}>
            <Typography variant="h3" color="secondary.main">
              {completedTasks.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tasks Done
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Progress Bar */}
      {/* <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Progress to Level {childData.level + 1}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={getProgressToNextLevel()}
          sx={{ 
            height: 10, 
            borderRadius: 5, 
            mb: 2,
            bgcolor: "grey.200",
            "& .MuiLinearProgress-bar": {
              bgcolor: "primary.main"
            }
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {Math.max(0, (childData.level + 1) * 50 - childData.totalPoints)} more points to level up!
        </Typography>
      </Paper> */}

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Assignment color="primary" />
            Your Tasks ({pendingTasks.length} pending)
          </Typography>
          {pendingTasks.length > 0 ? (
            <Grid container spacing={3}>
              {pendingTasks.map((task) => (
                <Grid item xs={12} md={6} key={task.id}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {task.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {task.description}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Chip
                          icon={<Star />}
                          label={`${task.points} points`}
                          color="primary"
                          size="small"
                        />
                        <Button
                          variant="contained"
                          startIcon={<CheckCircle />}
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          Mark Complete
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No tasks assigned yet. Ask your parent to add some tasks!
            </Alert>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Redeem color="secondary" />
            My Wish List
          </Typography>
          <Grid container spacing={3}>
            {wishes.map((wish) => (
              <Grid item xs={12} md={6} key={wish.id}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {wish.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {wish.description}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Chip
                        icon={<Redeem />}
                        label={`${wish.pointsRequired} points`}
                        color="secondary"
                        size="small"
                      />
                      <Button
                        variant="contained"
                        color="secondary"
                        disabled={availablePoints < wish.pointsRequired || wish.status === "pending_approval"}
                        onClick={() => handleRequestRedemption(wish.id)}
                      >
                        {wish.status === "pending_approval"
                          ? "Waiting for Approval"
                          : availablePoints >= wish.pointsRequired
                          ? "Redeem Now"
                          : `Need ${wish.pointsRequired - availablePoints} more points`}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EmojiEvents color="warning" />
            Your Achievements
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <EmojiEvents sx={{ fontSize: 48, color: "gold", mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    First Task Master
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed your first task
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <TrendingUp sx={{ fontSize: 48, color: "green", mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Streak Champion
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    5 days in a row!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Star sx={{ fontSize: 48, color: "purple", mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Point Collector
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Earn 200 total points
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default ChildDashboard;
