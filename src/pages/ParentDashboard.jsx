import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Alert,
  Fab,
  Badge,
  Stack,
  Chip,
} from "@mui/material";
import { Add, Assignment, Redeem, Notifications } from "@mui/icons-material";

import ChildCard from "../components/parent/ChildCard";
import AddChildDialog from "../components/parent/AddChildDialog";
import AddTaskDialog from "../components/parent/AddTaskDialog";
import AddWishDialog from "../components/parent/AddWishDialog";
import WishCard from "../components/parent/WishCard";
import TaskItem from "../components/parent/TaskItem";
import { API } from "../components/api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const ParentDashboard = ({ activeTab, setActiveTab, setPendingApprovals }) => {
  const { user } = useAuth();

  const [openAddChild, setOpenAddChild] = useState(false);
  const [openAddTask, setOpenAddTask] = useState(false);
  const [openAddWish, setOpenAddWish] = useState(false);
  const [children, setChildren] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editingWish, setEditingWish] = useState(null);
  const [editingChild, setEditingChild] = useState(null);
  const statusColorMap = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};


  const getChildren = async () => {
    try {
      const { data } = await API.get("/children");
      setChildren(Array.isArray(data) ? data : []);
    } catch {
      setChildren([]);
    }
  };

  const fetchTasks = async () => {
    if (!user?._id) return;
    try {
      const { data } = await API.get(`/tasks/${user._id}`);
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      setTasks([]);
    }
  };

  const fetchWishes = async () => {
    if (!user?._id) return;
    try {
      const { data } = await API.get(`/wishes/${user._id}`);
      setWishes(Array.isArray(data) ? data : []);
    } catch {
      setWishes([]);
    }
  };

  /* ---------- effects ---------- */
  useEffect(() => {
    if (!user?._id) return;
    getChildren();
    fetchTasks();
    fetchWishes();
  }, [user]);

  useEffect(() => {
    const pTask = tasks.filter((t) => t.status === "pending_approval").length;
    const pWish = wishes.filter((w) => w.status === "pending_approval").length;
    setPendingApprovals(pTask + pWish);
  }, [tasks, wishes, setPendingApprovals]);

  /* ---------- handlers ---------- */
  const handleAddChild = (c) => setChildren((p) => [...p, c]);
  const handleUpdateChild = (updated) =>
    setChildren((p) => p.map((ch) => (ch._id === updated._id ? updated : ch)));
  const deleteChild = async (id) => {
    await API.delete(`/children/${id}`);
    getChildren();
  };

  const handleAddTask = async (data) => {
    const { data: task } = await API.post("/tasks", data);
    setTasks((p) => [...p, task]);
  };
  const handleUpdateTask = async (data) => {
    const { data: task } = await API.put(`/tasks/${data._id}`, data);
    setTasks((p) => p.map((t) => (t._id === task._id ? task : t)));
    setEditingTask(null);
  };
  const handleDeleteTask = (id) =>
    setTasks((p) => p.filter((t) => t._id !== id));

  const handleAddWish = (w) => setWishes((p) => [...p, w]);
  const handleUpdateWish = (w) => {
    setWishes((p) => p.map((v) => (v._id === w._id ? w : v)));
    setEditingWish(null);
  };
  const handleDeleteWish = (id) =>
    setWishes((p) => p.filter((w) => w._id !== id));

  const getChildById = (id) => children.find((c) => c._id === id);

  /* ---------- render helpers ---------- */
  const pendingTask = tasks.filter(
    (t) => t.status === "pending_approval"
  ).length;
  const pendingWish = wishes.filter(
    (w) => w.status === "pending_approval"
  ).length;
  const totalPending = pendingTask + pendingWish;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
          Welcome back, {user?.name || user?.user?.name || "Parent"}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your children's learning journey
        </Typography>

        <Button
          variant={totalPending > 0 ? "contained" : "outlined"}
          color={totalPending > 0 ? "error" : "primary"}
          startIcon={
            <Badge badgeContent={totalPending} color="error">
              <Notifications />
            </Badge>
          }
          onClick={() => setActiveTab(3)}
          sx={{
            backgroundColor: totalPending > 0 ? "error.50" : "transparent",
            "&:hover": {
              backgroundColor: totalPending > 0 ? "error.100" : "grey.50",
            },
          }}
        >
          Approvals {totalPending > 0 && `(${totalPending})`}
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          children.length,
          tasks.length,
          wishes.length,
          children.reduce((s, c) => s + (c.totalPoints || 0), 0),
        ].map((v, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                bgcolor: [
                  "primary.50",
                  "info.50",
                  "secondary.50",
                  "success.50",
                ][i],
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  color: [
                    "primary.main",
                    "info.main",
                    "secondary.main",
                    "success.main",
                  ][i],
                }}
              >
                {v}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {
                  ["Children", "Total Tasks", "Total Wishes", "Points Earned"][
                    i
                  ]
                }
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {activeTab === 0 && (
        <Box>
          {children.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
                No children added yet
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => setOpenAddChild(true)}
              >
                Add Your First Child
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {children.map((c) => (
                <Grid item xs={12} md={6} lg={4} key={c._id}>
                  <ChildCard
                    child={c}
                    onEdit={() => {
                      setEditingChild(c);
                      setOpenAddChild(true);
                    }}
                    onDelete={() => deleteChild(c._id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
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
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              All Tasks ({tasks.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Assignment />}
              onClick={() => {
                setEditingTask(null);
                setOpenAddTask(true);
              }}
              disabled={!children.length}
            >
              Add Task
            </Button>
          </Box>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>

            {["Pending", "Approved", "Rejected"].map((s) => {
                  const status = s.toLowerCase()
                  return(
              <Chip
                key={s}
                label={`${s} (${
                  tasks.filter((t) => t.status === s.toLowerCase()).length
                })`}
                color={statusColorMap[status]}
                variant="outlined"
              />
                  )
                })}
          </Stack>
          {!children.length ? (
            <Alert severity="info">Add children first.</Alert>
          ) : !tasks.length ? (
            <Alert severity="info">No tasks yet.</Alert>
          ) : (
            <Stack spacing={2}>
              {tasks.map((t) => (
                <TaskItem
                  key={t._id}
                  task={t}
                  children={children}
                  onEdit={handleUpdateTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </Stack>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              All Wishes ({wishes.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Redeem />}
              onClick={() => {
                setEditingWish(null);
                setOpenAddWish(true);
              }}
              disabled={!children.length}
              color="secondary"
            >
              Add Wish
            </Button>
          </Box>
          {!wishes.length ? (
            <Alert severity="info">No wishes yet.</Alert>
          ) : (
            <Grid container spacing={3}>
              {wishes.map((w) => (
                <Grid item xs={12} md={6} lg={4} key={w._id}>
                  <WishCard
                    wish={w}
                    child={getChildById(w.childId)}
                    onEdit={handleUpdateWish}
                    onDelete={handleDeleteWish}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
            Approvals
          </Typography>
          <Alert severity="info">
            Approval tab placeholder – wire handlers as needed.
          </Alert>
        </Box>
      )}

      {/* Floating buttons */}
      {children.length > 0 && (
        <>
          <Fab
            color="secondary"
            sx={{ position: "fixed", bottom: 16, right: 160 }}
            onClick={() => {
              setEditingWish(null);
              setOpenAddWish(true);
            }}
          >
            <Redeem />
          </Fab>
          <Fab
            color="primary"
            sx={{ position: "fixed", bottom: 16, right: 80 }}
            onClick={() => {
              setEditingTask(null);
              setOpenAddTask(true);
            }}
          >
            <Assignment />
          </Fab>
        </>
      )}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => {
          setEditingChild(null);
          setOpenAddChild(true);
        }}
      >
        <Add />
      </Fab>

      {/* Dialogs */}
      <AddChildDialog
        open={openAddChild}
        onClose={() => {
          setOpenAddChild(false);
          setEditingChild(null);
        }}
        onAdd={handleAddChild}
        onUpdate={handleUpdateChild}
        editChild={editingChild}
      />
      <AddTaskDialog
        open={openAddTask}
        onClose={() => {
          setOpenAddTask(false);
          setEditingTask(null);
        }}
        onAdd={handleAddTask}
        onUpdate={handleUpdateTask}
        children={children}
        editTask={editingTask}
      />
      <AddWishDialog
        open={openAddWish}
        onClose={() => {
          setOpenAddWish(false);
          setEditingWish(null);
        }}
        onAdd={handleAddWish}
        onUpdate={handleUpdateWish}
        children={children}
        editWish={editingWish}
      />
    </Container>
  );
};

export default ParentDashboard;
