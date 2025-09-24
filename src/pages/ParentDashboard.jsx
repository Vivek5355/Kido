import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Add,
  Assignment,
  Notifications,
  Refresh,
  Delete
} from '@mui/icons-material';
import { Autocomplete } from '@mui/material';
import ChildCard from '../components/parent/ChildCard';
import AddChildDialog from '../components/parent/AddChildDialog';
import AddTaskDialog from '../components/parent/AddTaskDialog';
import TaskItem from '../components/parent/TaskItem';
import ApprovalTaskItem from '../components/parent/ApprovalTaskItem';
import {API} from '../components/api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import ParentWishes from '../components/parent/ParentWishes';
import RewardForm from '../components/parent/RewardForm';

export const ParentDashboard = ({ activeTab, setActiveTab, setPendingApprovals }) => {
  const { user } = useAuth();
  
  // Dialog states
  const [openAddChild, setOpenAddChild] = useState(false);
  const [openAddTask, setOpenAddTask] = useState(false);
  const [openAddWish, setOpenAddWish] = useState(false);
  const [openRewardForm, setOpenRewardForm] = useState(false);

  const [children, setChildren] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [editingChild, setEditingChild] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingWish, setEditingWish] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState('');

  const [stats, setStats] = useState({
    totalChildren: 0,
    totalTasks: 0,
    totalWishes: 0,
    totalRewards: 0,
  });

  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  useEffect(() => {
    if (user?.user?.user?._id) {
      fetchChildren();
      fetchTasks();
      fetchWishes();
      fetchRewards();
    }
  }, [user?.user?.user?._id]);

  useEffect(() => {
    const totalPoints = children.reduce((sum, child) => sum + (child.totalPoints || 0), 0);
    setStats({
      totalChildren: children.length,
      totalTasks: tasks.length,
      totalWishes: wishes.length,
      totalPoints: totalPoints,
      totalRewards: rewards.length,
    });
    const pendingTasks = tasks.filter(t => t.status === 'pending-approval' || t.status === 'pending_approval').length;
    const pendingWishes = wishes.filter(w => w.status === 'pending-approval').length;
    setPendingApprovals(pendingTasks + pendingWishes);
  }, [children, tasks, wishes, rewards, setPendingApprovals]);
  useEffect(() => {
    setTaskPage(1);
  }, [selectedChildId]);
  useEffect(() => {
    if (activeTab === 1) {
      const pendingTasks = tasks.filter(task => 
        task.status === 'pending-approval' || task.status === 'pending_approval' || task.status === 'pending'
      );
    }
  }, [activeTab, tasks]);
  useEffect(() => {
    if (activeTab === 3) {
      fetchRewards();
    }
  }, [activeTab]);
  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };
  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };
  const fetchChildren = async () => {
    try {
      const response = await API.get('/children');
      const data = response.data
      console.log("dffdd------",data)
      setChildren(Array.isArray(data) ? data : []);
    } catch (err) {
      setChildren([]);
      showToast('Error fetching children', 'error');
    }
  };
  const fetchTasks = async () => {
    if (!user?.user?.user?._id) return;
    try {
      const data = await API.get(`/tasks/parent/${user?.user?.user?._id}`);
      console.log("cnc",data.data.status)
      const tasksData = data.data || data.tasks || data;
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      setTasks([]);
      showToast('Error fetching tasks', 'error');
    }
  };
  const fetchWishes = async () => {
    if (!user?.user?.user?._id) return;
    try {
      const data = await API.get(`/wishes/parent/${user?.user?.user?._id}`);
      console.log("data 2",data.data)
      const wishesData = data.data.data || data;

      setWishes(Array.isArray(wishesData) ? wishesData : []);
    } catch (err) {
      setWishes([]);
      showToast('Error fetching wishes', 'error');
    }
  };

  const fetchRewards = async () => {
    if (!user?.user?.user?._id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(`/rewards/${user?.user?.user?._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Rewards API Response:', response.data);
      setRewards(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setRewards([]);
      showToast('Error fetching rewards', 'error');
    }
  };
  const handleDeleteReward = async (id) => {
    try {
      await API.delete(`/rewards/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRewards(prev => prev.filter(reward => reward._id !== id));
      showToast('Reward deleted successfully!', 'error');
    } catch (err) {
      showToast('Error deleting reward', 'error');
    }
  };
  const handleAddChild = (c) => {
    setChildren(prev => [...prev, c]);
    showToast('Child added successfully!', 'success');
  };
  const handleUpdateChild = (updated) => {
    setChildren(prev => prev.map(ch => ch.id === updated.id ? updated : ch));
    showToast('Child updated successfully!', 'success');
  };
  const handleDeleteChild = async (id) => {
    try {
      await API.delete(`/children/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      setChildren(prev => prev.filter(ch => ch.id !== id));
      showToast('Child deleted successfully!', 'error');
    } catch (err) {
      showToast('Could not delete child. Please try again.', 'error');
    }
  };
  const handleAddTask = () => {
    fetchTasks();
    fetchChildren();
    showToast('Task added successfully!');
    fetchTasks();
  };
  const handleUpdateTask = (updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    fetchTasks()
    showToast('Task updated successfully!');
  };
  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    fetchTasks()
    showToast('Task deleted successfully!', 'error');
  };
  const handleApproveTask = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await API.put(
      `/tasks/status/${id}`,
      { type: 2, status: "approved" },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Approve task response:', response.data);
    setTasks(prev => prev.map(t => (t._id === id || t.id === id) ? { ...t, status: 'approved' } : t));
    showToast('Task approved successfully!');
  } catch (err) {
    console.error('Approve task error:', err);
    showToast('Error approving task. Please try again.', 'error');
  }
};
  const handleRejectTask = async (id, reason) => {
    try {
      await API.put(`/tasks/${id}`, { 
        status: 'rejected', 
        rejectionReason: reason,
      });
      setTasks(prev => prev.map(t => t._id === id ? { ...t, status: 'rejected' } : t));
      showToast('Task rejected successfully!');
    } catch (err) {
      showToast('Error rejecting task. Please try again.', 'error');
    }
  };
  const handleApproveWish = async (id) => {
    try {
      await API.put(`/wishes/${id}`, { status: 'approved' });
      setWishes(prev => prev.map(w => w.id === id ? { ...w, status: 'approved' } : w));
      showToast('Wish approved successfully!');
    } catch (err) {
      showToast('Error approving wish. Please try again.', 'error');
    }
  };
  const handleRejectWish = async (id) => {
    try {
      await API.put(`/wishes/${id}`, { status: 'rejected' });
      setWishes(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected' } : w));
      showToast('Wish rejected successfully!');
    } catch (err) {
      showToast('Error rejecting wish. Please try again.', 'error');
    }
  };
  const getChildById = (id) => children.find(c => c.id === id);
  const filteredTasks = selectedChildId 
    ? tasks.filter(task => 
        task.childId === selectedChildId || 
        (task.child && task.child.id === selectedChildId)
      )
    : tasks;
  const displayTasks = filteredTasks.filter(task => {
    if (activeTab === 1) {
      return task.status === 'pending' || task.status === 'pending-approval' || task.status === 'pending_approval';
    }
    return true;
  });
  const [taskPage, setTaskPage] = useState(1);
  const tasksPerPage = 10;
  const paginatedTasks = displayTasks.slice(
    (taskPage - 1) * tasksPerPage,
    taskPage * tasksPerPage
  );
  const selectedChild = selectedChildId ? getChildById(selectedChildId) : null;
  const pendingTaskCount = tasks.filter(t => t.status === 'pending-approval' || t.status === 'pending_approval').length;
  const approvalTaskCount = tasks.filter(t => ['sent', 'pending-approval', 'pending_approval'].includes(t.status)).length;
  const pendingWishCount = wishes.filter(w => w.status === 'pending-approval').length;
  const totalPending = pendingTaskCount + pendingWishCount;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Snackbar
        open={toast.open}
        autoHideDuration={800} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
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
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Refresh />}
          sx={{ ml: 2 }}
          onClick={() => {
            
            if (activeTab === 0) fetchChildren();
            else if (activeTab === 1) fetchTasks();
            else if (activeTab === 2) fetchWishes();
            else if (activeTab === 3) fetchRewards();
            else if (activeTab === 4) fetchTasks();
            else {
              fetchChildren();
              fetchTasks();
              fetchWishes();
              fetchRewards();
            }
            showToast('Data refreshed successfully!');
            setTaskPage(1);
          }}
        >
          Refresh
        </Button>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[stats.totalChildren, stats.totalTasks, stats.totalWishes, stats.totalRewards].map((v, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                bgcolor: ['info.50', 'secondary.50', 'success.50', 'primary.50'][i],
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 'bold',
                  color: ['primary.main', 'info.main', 'secondary.main', 'error.main'][i],
                }}
              >
                {v}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {['Children', 'Total Tasks', 'Total Wishes', 'Rewards'][i]}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      {activeTab === 0 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5">My Children ({children.length})</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Assignment />}
                onClick={() => {
                  setEditingTask(null);
                  setOpenAddTask(true);
                }}
                disabled={children.length === 0}
                sx={{ mr: 1 }}
              >
                Add Task
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingChild(null);
                  setOpenAddChild(true);
                }}
              >
                Add Child
              </Button>
            </Stack>
          </Stack>
          {children.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
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
              {children.map(c => (
                <Grid item xs={12} sm={6} md={4} key={c.id}>
                  <ChildCard
                    child={c}
                    onEdit={() => {
                      setEditingChild(c);
                      setOpenAddChild(true);
                    }}
                    onDelete={handleDeleteChild}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              All Tasks ({displayTasks.length})
              {selectedChild && ` for ${selectedChild.name}`}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setEditingTask(null);
                setOpenAddTask(true);
              }}
              disabled={!children.length}
            >
              Add Task
            </Button>
          </Box>
          {children.length > 0 && (
            <Box sx={{ mb: 3, maxWidth: 300 }}>
              <Autocomplete
                size="small"
                options={[{ id: '', name: 'All Children' }, ...children]}
                getOptionLabel={(option) => option.name}
                value={children.find(c => c.id === selectedChildId) || { id: '', name: 'All Children' }}
                onChange={(e, newValue) => {
                  setSelectedChildId(newValue?.id || '');
                }}
                clearOnEscape
                renderInput={(params) => (
                  <TextField {...params} label="Filter by Child" variant="outlined" />
                )}
              />
            </Box>
          )}
          {!children.length ? (
            <Alert severity="info">Add children first.</Alert>
          ) : !displayTasks.length ? (
            <Alert severity="info">
              {selectedChild ? `No pending tasks found for ${selectedChild.name}.` : 'No pending tasks yet.'}
            </Alert>
          ) : (
            <>
              <Stack spacing={2}>
                {paginatedTasks.map(t => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    children={children}
                    onEdit={(task) => {
                      setEditingTask(task);
                      setOpenAddTask(true);
                    }}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
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
          onApprove={handleApproveWish}
          onReject={handleRejectWish}
          onAddTask={handleAddTask}
        />
      )}
      {activeTab === 3 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Rewards ({rewards.length})
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setOpenRewardForm(true)}
            >
              Add Reward
            </Button>
          </Box>
          {rewards.length === 0 ? (
            <Alert severity="info">No rewards created yet.</Alert>
          ) : (
            <Grid container spacing={2}>
              {rewards.map(reward => (
                <Grid item xs={12} sm={6} md={4} key={reward.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
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
                        >
                          <Delete />
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
              console.log('Reward submitted:', data);
              showToast('Reward created successfully!');
              setOpenRewardForm(false);
              fetchRewards();
            }}
            parentId={user?.user?.user?._id}
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
                .filter(t => ['sent', 'pending-approval', 'pending_approval'].includes(t.status))
                .map(t => (
                  <Grid item xs={12} key={t._id}>
                    <ApprovalTaskItem
                      task={t}
                      children={children}
                      onApprove={handleApproveTask}
                      onReject={handleRejectTask}
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