import { useState, useEffect, useRef } from "react";
// import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Alert,
  Badge,
  Stack,
  Snackbar,
  TextField,
  Pagination,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Assignment,
  Notifications,
  Refresh,
  Delete,
} from "@mui/icons-material";
import { Autocomplete } from "@mui/material";
import ChildCard from "../components/parent/ChildCard";
import AddChildDialog from "../components/parent/AddChildDialog";
import AddTaskDialog from "../components/parent/AddTaskDialog";
import TaskItem from "../components/parent/TaskItem";
import ApprovalTaskItem from "../components/parent/ApprovalTaskItem";
import { API } from "../components/api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import ParentWishes from "../components/parent/ParentWishes";
import RewardForm from "../components/parent/RewardForm";

export const ParentDashboard = ({ activeTab, setActiveTab, setPendingApprovals }) => {
  const { user } = useAuth();
  const broadcastRef = useRef(null);
  const lastEventIdRef = useRef(0);

  // Dialog states
  const [openAddChild, setOpenAddChild] = useState(false);
  const [openAddTask, setOpenAddTask] = useState(false);
  // const [openAddWish, setOpenAddWish] = useState(false);
  const [openRewardForm, setOpenRewardForm] = useState(false);

  // Data states
  const [children, setChildren] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [rewards, setRewards] = useState([]);

  // Editing states
  const [editingChild, setEditingChild] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  // const [editingWish, setEditingWish] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalTasks: 0,
    totalWishes: 0,
    totalRewards: 0,
  });

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Loading states for different operations
  const [loadingStates, setLoadingStates] = useState({
    children: false,
    tasks: false,
    wishes: false,
    rewards: false,
    deleting: false,
    approving: false,
    rejecting: false,
    redeeming: false,
  });

  // Broadcast setup
  useEffect(() => {
    try {
      broadcastRef.current = new BroadcastChannel("kiddo-sync");
      broadcastRef.current.onmessage = (event) => {
        const payload = event?.data;
        if (!payload || payload.source === window.name) return;
        if (!payload.scope || payload.scope === "all" || payload.scope === tabScopeForActive()) {
          triggerRefetch(payload.type);
        }
      };
    } catch (e) {
      // BroadcastChannel not supported; fallback to storage events
      // No-op here; storage listener below
    }

    const onStorage = (e) => {
      if (e.key !== "kiddo-sync-event" || !e.newValue) return;
      try {
        const payload = JSON.parse(e.newValue);
        if (!payload || payload.source === window.name) return;
        if (!payload.scope || payload.scope === "all" || payload.scope === tabScopeForActive()) {
          triggerRefetch(payload.type);
        }
      } catch {}
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      if (broadcastRef.current) {
        broadcastRef.current.close();
        broadcastRef.current = null;
      }
    };
  }, [activeTab]);

  const tabScopeForActive = () => {
    // 0: children, 1: tasks, 2: wishes, 3: rewards, 4: approvals(tasks)
    if (activeTab === 0) return "children";
    if (activeTab === 1) return "tasks";
    if (activeTab === 2) return "wishes";
    if (activeTab === 3) return "rewards";
    if (activeTab === 4) return "tasks";
    return "all";
  };

  const publishSync = (type, scope = "all") => {
    const eventId = ++lastEventIdRef.current;
    const payload = { id: eventId, type, scope, at: Date.now(), source: window.name };
    try {
      if (broadcastRef.current) {
        broadcastRef.current.postMessage(payload);
      }
    } catch {}
    try {
      localStorage.setItem("kiddo-sync-event", JSON.stringify(payload));
      // Clear to keep storage lean
      localStorage.removeItem("kiddo-sync-event");
    } catch {}
  };

  const triggerRefetch = (type) => {
    // type can be children|tasks|wishes|rewards|all
    if (type === "children" || type === "all") fetchChildren();
    if (type === "tasks" || type === "all") fetchTasks();
    if (type === "wishes" || type === "all") fetchWishes();
    if (type === "rewards" || type === "all") fetchRewards();
  };

  useEffect(() => {
    if (user?.user?._id || user?.user?.user?._id) {
      fetchChildren();
      fetchTasks();
      fetchWishes();
      fetchRewards();
    }
  }, [user?.user?._id || user?.user?.user?._id]);

  useEffect(() => {
    const totalPoints = children.reduce(
      (sum, child) => sum + (child.totalPoints || 0),
      0
    );
    setStats({
      totalChildren: children.length,
      totalTasks: tasks.length,
      totalWishes: wishes.length,
      totalPoints: totalPoints,
      totalRewards: rewards.length,
    });

    const pendingTasks = tasks.filter(
      (t) => t.status === "pending-approval" || t.status === "pending_approval"
    ).length;
    const pendingWishes = wishes.filter((w) => w.status === "pending-approval").length;
    setPendingApprovals(pendingTasks + pendingWishes);
  }, [children, tasks, wishes, rewards, setPendingApprovals]);

  useEffect(() => {
    setTaskPage(1);
  }, [selectedChildId]);

  useEffect(() => {
    if (activeTab === 1) {
      const pendingTasks = tasks.filter(
        (task) =>
          task.status === "pending-approval" ||
          task.status === "pending_approval" ||
          task.status === "pending"
      );
      // //console.log('pendingTasks count', pendingTasks.length)
    }
  }, [activeTab, tasks]);

  useEffect(() => {
    if (activeTab === 3) {
      fetchRewards();
    }
  }, [activeTab]);

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };
  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const fetchChildren = async () => {
    setLoadingStates(prev => ({ ...prev, children: true }));
    try {
      const response = await API.get("/children");
      const data = response.data;
      setChildren(Array.isArray(data) ? data : []);
    } catch (err) {
      setChildren([]);
      showToast("Error fetching children", "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, children: false }));
    }
  };

  const fetchTasks = async () => {
    if (!(user?.user?._id || user?.user?.user?._id)) return;
    setLoadingStates(prev => ({ ...prev, tasks: true }));
    try {
      const data = await API.get(
        `/tasks/parent/${user?.user?._id || user?.user?.user?._id}`
      );
      const tasksData = data.data || data.tasks || data;
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      setTasks([]);
      showToast("Error fetching tasks", "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, tasks: false }));
    }
  };

  const fetchWishes = async () => {
    if (!(user?.user?._id || user?.user?.user?._id)) return;
    setLoadingStates(prev => ({ ...prev, wishes: true }));
    try {
      const data = await API.get(
        `/wishes/parent/${user?.user?._id || user?.user?.user?._id}`
      );
      const wishesData = data.data?.data || data.data || data;
      setWishes(Array.isArray(wishesData) ? wishesData : []);
    } catch (err) {
      setWishes([]);
      showToast("Error fetching wishes", "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, wishes: false }));
    }
  };

  const fetchRewards = async () => {
    if (!(user?.user?._id || user?.user?.user?._id)) return;
    setLoadingStates(prev => ({ ...prev, rewards: true }));
    try {
      const token = localStorage.getItem("token");
      const response = await API.get(
        `/rewards/${user?.user?._id || user?.user?.user?._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setRewards(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setRewards([]);
      showToast("Error fetching rewards", "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, rewards: false }));
    }
  };

  const handleDeleteReward = async (id) => {
    setLoadingStates(prev => ({ ...prev, deleting: true }));
    try {
      await API.delete(`/rewards/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRewards((prev) => prev.filter((reward) => reward._id !== id));
      showToast("Reward deleted successfully!", "error");
      publishSync("rewards", "rewards");
    } catch (err) {
      showToast("Error deleting reward", "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, deleting: false }));
    }
  };

  const handleAddChild = (c) => {
    setChildren((prev) => [...prev, c]);
    showToast("Child added successfully!", "success");
    publishSync("children", "children");
  };

  const handleUpdateChild = (updated) => {
    setChildren((prev) =>
      prev.map((ch) => (ch.id === updated.id ? updated : ch))
    );
    showToast("Child updated successfully!", "success");
    publishSync("children", "children");
  };

  const handleDeleteChild = async (id) => {
    try {
      await API.delete(`/children/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      setChildren((prev) => prev.filter((ch) => ch.id !== id));
      showToast("Child deleted successfully!", "error");
      publishSync("children", "children");
    } catch (err) {
      showToast("Could not delete child. Please try again.", "error");
    }
  };

  const handleAddTask = () => {
    fetchTasks();
    fetchChildren();
    showToast("Task added successfully!");
    fetchTasks();
    publishSync("tasks", "tasks");
  };

  const handleUpdateTask = (updated) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    fetchTasks();
    showToast("Task updated successfully!");
    publishSync("tasks", "tasks");
  };

  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    fetchTasks();
    showToast("Task deleted successfully!", "error");
    publishSync("tasks", "tasks");
  };

  const handleApproveTask = async (id) => {
    setLoadingStates(prev => ({ ...prev, approving: true }));
    try {
      const token = localStorage.getItem("token");
      const response = await API.put(
        `/tasks/status/${id}`,
        { type: 2, status: "approved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTasks((prev) =>
        prev.map((t) =>
          t._id === id || t.id === id ? { ...t, status: "approved" } : t
        )
      );
      showToast("Task approved successfully!");
      publishSync("tasks", "tasks");
    } catch (err) {
      showToast("Error approving task. Please try again.", "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, approving: false }));
    }
  };

  const handleRejectTask = async (id, reason) => {
    setLoadingStates(prev => ({ ...prev, rejecting: true }));
    try {
      await API.put(`/tasks/${id}`, {
        status: "rejected",
        rejectionReason: reason,
      });
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: "rejected" } : t))
      );
      showToast("Task rejected successfully!");
      publishSync("tasks", "tasks");
    } catch (err) {
      showToast("Error rejecting task. Please try again.", "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, rejecting: false }));
    }
  };

  const handleApproveWish = async (id) => {
    try {
      await API.put(`/wishes/${id}`, { status: "approved" });
      setWishes((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: "approved" } : w))
      );
      showToast("Wish approved successfully!");
      publishSync("wishes", "wishes");
    } catch (err) {
      showToast("Error approving wish. Please try again.", "error");
    }
  };

  const handleRejectWish = async (id) => {
    try {
      await API.put(`/wishes/${id}`, { status: "rejected" });
      setWishes((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: "rejected" } : w))
      );
      showToast("Wish rejected successfully!");
      publishSync("wishes", "wishes");
    } catch (err) {
      showToast("Error rejecting wish. Please try again.", "error");
    }
  };

  const getChildById = (id) => children.find((c) => c.id === id);
  // Filter tasks based on selected child and active tab
  const filteredTasks = selectedChildId
    ? tasks.filter(
        (task) =>
          task.childId === selectedChildId ||
          (task.child && task.child.id === selectedChildId)
      )
    : tasks;

  // Filter tasks based on active tab
  const displayTasks = filteredTasks.filter((task) => {
    if (activeTab === 1) {
      return (
        task.status === "pending" ||
        task.status === "pending-approval" ||
        task.status === "pending_approval"
      );
    }
    return true;
  });

  // Pagination state for tasks
  const [taskPage, setTaskPage] = useState(1);
  const tasksPerPage = 2;
  const paginatedTasks = displayTasks.slice(
    (taskPage - 1) * tasksPerPage,
    taskPage * tasksPerPage
  );

  const selectedChild = selectedChildId ? getChildById(selectedChildId) : null;
  const pendingTaskCount = tasks.filter(
    (t) => t.status === "pending-approval" || t.status === "pending_approval"
  ).length;
  const approvalTaskCount = tasks.filter((t) =>
    ["sent", "pending-approval", "pending_approval"].includes(t.status)
  ).length;
  const pendingWishCount = wishes.filter((w) => w.status === "pending-approval").length;
  const totalPending = pendingTaskCount + pendingWishCount;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Toast notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={800}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
          Welcome back, {user?.user?.user?.name || user?.user?.name}
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
          onClick={() => setActiveTab(4)}
        >
          Approvals {totalPending > 0 && `(${totalPending})`}
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          stats.totalChildren,
          stats.totalTasks,
          stats.totalWishes,
          stats.totalRewards,
        ].map((v, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                bgcolor: [
                  "info.50",
                  "secondary.50",
                  "success.50",
                  "primary.50",
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
                    "error.main",
                  ][i],
                }}
              >
                {v}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {["Children", "Total Tasks", "Total Wishes", "Rewards"][i]}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Typography variant="h5">
              My Children ({children.length})
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Assignment />}
                onClick={() => {
                  setEditingTask(null);
                  setOpenAddTask(true);
                }}
                disabled={children.length === 0 || loadingStates.tasks}
                sx={{ mr: 1 }}
              >
                {loadingStates.tasks ? "Loading..." : "Add Task"}
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingChild(null);
                  setOpenAddChild(true);
                }}
                disabled={loadingStates.children}
              >
                {loadingStates.children ? "Loading..." : "Add Child"}
              </Button>
            </Stack>
          </Stack>

          {children.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No children added yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenAddChild(true)}
                size="large"
              >
                Add Your First Child
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {children.map((c) => (
                <Grid item xs={12} sm={6} md={4} key={c.id}>
                  <ChildCard
                    child={c}
                    onEdit={() => {
                      setEditingChild(c);
                      setOpenAddChild(true);
                    }}
                    onDelete={(id) => {
                      handleDeleteChild(id);
                    }}
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
              All Tasks ({displayTasks.length})
              {selectedChild && ` for ${selectedChild.name}`}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setEditingTask(null);
                setOpenAddTask(true);
              }}
              disabled={!children.length || loadingStates.tasks}
            >
              {loadingStates.tasks ? "Loading..." : "Add Task"}
            </Button>
          </Box>

          {children.length > 0 && (
            <Box sx={{ mb: 3, maxWidth: 300 }}>
              <Autocomplete
                size="small"
                options={[{ id: "", name: "All Children" }, ...children]}
                getOptionLabel={(option) => option.name}
                value={
                  children.find((c) => c.id === selectedChildId) || {
                    id: "",
                    name: "All Children",
                  }
                }
                onChange={(e, newValue) => {
                  setSelectedChildId(newValue?.id || "");
                }}
                clearOnEscape
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by Child"
                    variant="outlined"
                  />
                )}
              />
            </Box>
          )}

          {!children.length ? (
            <Alert severity="info">Add children first.</Alert>
          ) : !displayTasks.length ? (
            <Alert severity="info">
              {selectedChild
                ? `No pending tasks found for ${selectedChild.name}.`
                : "No pending tasks yet."}
            </Alert>
          ) : (
            <>
              <Stack spacing={2}>
                {paginatedTasks.map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    children={children}
                    onEdit={(task) => {
                      setEditingTask(task);
                      setOpenAddTask(true);
                    }}
                    onDelete={(id) => {
                      handleDeleteTask(id);
                    }}
                  />
                ))}
              </Stack>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 2,
                  gap: 2,
                }}
              >
                <Pagination
                  count={Math.ceil(displayTasks.length / tasksPerPage)}
                  page={taskPage}
                  onChange={(e, page) => setTaskPage(page)}
                  color="primary"
                  size="small"
                />
              </Box>
            </>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <ParentWishes
          children={children}
          wishes={wishes}
          onApprove={(id) => {
            handleApproveWish(id);
          }}
          onReject={(id) => {
            handleRejectWish(id);
          }}
          onAddTask={() => {
            handleAddTask();
          }}
        />
      )}

      {activeTab === 3 && (
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
              Rewards ({rewards.length})
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setOpenRewardForm(true)}
              disabled={loadingStates.rewards}
            >
              {loadingStates.rewards ? "Loading..." : "Add Reward"}
            </Button>
          </Box>

          {rewards.length === 0 ? (
            <Alert severity="info">No rewards created yet.</Alert>
          ) : (
            <Grid container spacing={2}>
              {rewards.map((reward) => (
                <Grid item xs={12} sm={6} md={4} key={reward.id}>
                  <Card>
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {reward.rewardName}
                          </Typography>
                          <Chip
                            label={`${reward.points} points`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteReward(reward._id)}
                          color="error"
                          disabled={loadingStates.deleting}
                        >
                          {loadingStates.deleting ? <CircularProgress size={16} /> : <Delete />}
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <RewardForm
            open={openRewardForm}
            onClose={() => setOpenRewardForm(false)}
            onSubmit={(data) => {
              showToast("Reward created successfully!");
              setOpenRewardForm(false);
              fetchRewards();
              publishSync("rewards", "rewards");
            }}
            parentId={
              user?.user?._id || user?.user?._id || user?.user?.user?._id
            }
          />
        </Box>
      )}

      {activeTab === 4 && (
        <>
          <Typography variant="h6" gutterBottom>
            Task Approvals ({approvalTaskCount})
          </Typography>

          {!children.length ? (
            <Alert severity="info">No children available.</Alert>
          ) : approvalTaskCount === 0 ? (
            <Alert severity="info">No task approvals.</Alert>
          ) : (
            <Grid container spacing={2}>
              {tasks
                .filter((t) =>
                  ["sent", "pending-approval", "pending_approval"].includes(
                    t.status
                  )
                )
                .map((t) => (
                  <Grid item xs={12} key={t._id}>
                    <ApprovalTaskItem
                      task={t}
                      children={children}
                      onApprove={(id) => {
                        handleApproveTask(id);
                      }}
                      onReject={(id, reason) => {
                        handleRejectTask(id, reason);
                      }}
                    />
                  </Grid>
                ))}
            </Grid>
          )}
        </>
      )}

      {/* Dialogs */}
      <AddChildDialog
        open={openAddChild}
        handleClose={() => {
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
        onAdd={(task) => {
          if (task) {
            handleAddTask(task);
            setSelectedChildId(task.childId);
          } else {
            fetchTasks();
          }
        }}
        onUpdate={handleUpdateTask}
        children={children}
        editTask={editingTask}
        initialChildId={selectedChildId}
      />
    </Container>
  );
};
