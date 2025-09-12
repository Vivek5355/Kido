import React, { useState, useEffect } from "react";
import {  Container, Typography,Grid,Box, Paper,Card,CardContent,Button,Alert,Dialog, DialogTitle,DialogContent,IconButton,CircularProgress,} from "@mui/material";
import {  Star, Redeem,TrendingUp,EmojiEvents, Add,Close,} from "@mui/icons-material";
import Confetti from "react-confetti";
import { useAuth } from "../context/AuthContext";
import ChildTasks from "../components/child/ChildTasks";
import AddWishForm from "../components/child/AddWishForm";
import { API } from "../components/api/axiosInstance";

const ChildDashboard = ({ activeTab }) => {
  const { user } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);
  const [wishes, setWishes] = useState([]);
  const [showAddWishForm, setShowAddWishForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userData = JSON.parse(localStorage.getItem("kiddoUser"));
  const childData = {
    id: user?._id || userData?._id,
    name: user?.name || userData?.name || "Child User",
    email: user?.email || userData?.email || "",
    age: user?.age || userData?.age || 8,
    totalPoints: user?.totalPoints || userData?.totalPoints || 150,
    redeemedPoints: user?.redeemedPoints || userData?.redeemedPoints || 50,
    level: user?.level || userData?.level || 3,
    streak: user?.streak || userData?.streak || 5,
    role: "Child",
  };
  const fetchWishes = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get(`/wishes/child/${childData?._id}`,
         {
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
  useEffect(() => {
    if (activeTab === 1) {
      fetchWishes();
    }
  }, [activeTab, childData.id]);
  const handleWishAdded = (newWish) => {
    // console.log("New wish added:", newWish);
    const transformedWish = {
      id: newWish._id || newWish.id,
      title: newWish.title,
      description: newWish.description,
      pointsRequired: newWish.pointsRequired || 0,
      status: newWish.status || "pending",
    };
    setWishes(prevWishes => [...prevWishes, transformedWish]);
    setShowAddWishForm(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {showConfetti && <Confetti />}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          textAlign: "center",
          bgcolor: "primary.50",
          border: "2px solid",
          borderColor: "primary.200",
        }}
      >
        <Typography variant="h4" gutterBottom color="primary">
          Welcome back, {childData.name}! 🌟
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You're doing amazing! Keep up the great work!
        </Typography>
      </Paper>
      {activeTab === 0 && (
        <Box>
          <ChildTasks childId={childData.id} />
        </Box>
      )}
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
            <Typography
              variant="h5"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Redeem color="secondary" />
              My Wish List
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setShowAddWishForm(true)}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: "bold",
              }}
            >
              Add Wish
            </Button>
          </Box>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={fetchWishes}>
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
              {wishes.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h6" color="text.secondary">
                      No wishes yet! Add your first wish to get started.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Add />}
                      onClick={() => setShowAddWishForm(true)}
                      sx={{ mt: 2 }}
                    >
                      Add Your First Wish
                    </Button>
                  </Paper>
                </Grid>
              ) : (
                wishes.map((wish) => (
                  <Grid item xs={12} md={6} key={wish.id}>
                    <Card sx={{ height: "100%" }}>
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
      {activeTab === 2 && (
        <Box>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
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
      <Dialog
        open={showAddWishForm}
        onClose={() => setShowAddWishForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Add New Wish
          <IconButton onClick={() => setShowAddWishForm(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <AddWishForm childId={childData.id} onWishAdded={handleWishAdded} />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ChildDashboard;