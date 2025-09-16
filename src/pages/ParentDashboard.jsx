// import { useState, useEffect } from "react";
// import {
//   Container,
//   Typography,
//   Grid,
//   Box,
//   Button,
//   Alert,
//   Fab,
//   Badge,
//   Stack,
//   Chip,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Tooltip, 
// } from "@mui/material";
// import {
//   Add,
//   Assignment,
//   Notifications,
//   Refresh,
// } from "@mui/icons-material";
// import ChildCard from "../components/parent/ChildCard";
// import AddChildDialog from "../components/parent/AddChildDialog";
// import AddTaskDialog from "../components/parent/AddTaskDialog";
// import TaskItem from "../components/parent/TaskItem";
// import ApprovalTaskItem from "../components/parent/ApprovalTaskItem";
// import { API } from "../components/api/axiosInstance";
// import { useAuth } from "../context/AuthContext";
// import ParentWishes from "../components/parent/ParentWishes";

// export const ParentDashboard = ({
//   activeTab,
//   setActiveTab,
//   setPendingApprovals,
// }) => {
//   const { user } = useAuth();
//   const [openAddChild, setOpenAddChild] = useState(false);
//   const [openAddTask, setOpenAddTask] = useState(false);
//   const [openAddWish, setOpenAddWish] = useState(false);
//   const [children, setChildren] = useState([]);
//   const [tasks, setTasks] = useState([]);
//   const [wishes, setWishes] = useState([]);
//   const [editingChild, setEditingChild] = useState(null);
//   const [editingTask, setEditingTask] = useState(null);
//   const [editingWish, setEditingWish] = useState(null);
//   const [selectedChildId, setSelectedChildId] = useState("");
//   const [stats, setStats] = useState({
//     totalChildren: 0,
//     totalTasks: 0,
//     totalWishes: 0,
//     totalPoints: 0,
//   });
//   const statusColorMap = {
//     pending: "warning",
//     pending_approval: "warning",
//     approved: "success",
//     rejected: "error",
//     sent: "info",
//     complete: "default",
//   };
//   useEffect(() => {
//     if (user?.user?._id) {
//       fetchChildren();
//       fetchTasks();
//       fetchWishes();
//     }
//   }, [user?.user?._id, activeTab]);
//   useEffect(() => {
//     const totalPoints = children.reduce(
//       (sum, child) => sum + (child.totalPoints || 0),
//       0
//     );
//     setStats({
//       totalChildren: children.length,
//       totalTasks: tasks.length,
//       totalWishes: wishes.length,
//       totalPoints: totalPoints,
//     });
//     const pendingTasks = tasks.filter(
//       (t) => t.status === "pending_approval"
//     ).length;
//     const pendingWishes = wishes.filter(
//       (w) => w.status === "pending_approval"
//     ).length;
//     setPendingApprovals(pendingTasks + pendingWishes);
//   }, [children, tasks, wishes, setPendingApprovals]);
//   const fetchChildren = async () => {
//     try {
//       const { data } = await API.get("/children");
//       setChildren(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setChildren([]);
//       console.error("Error fetching children:", err);
//     }
//   };
//   const fetchTasks = async () => {
//     if (!user?.user?._id) return;
//     try {
//       const { data } = await API.get(`/tasks/parent/${user?.user?._id}`);
//       const tasksData = data.data || data.tasks || data;
//       setTasks(Array.isArray(tasksData) ? tasksData : []);
//     } catch (err) {
//       setTasks([]);
//       console.error("Error fetching tasks:", err);
//     }
//   };
//   const fetchWishes = async () => {
//     if (!user?.user?._id) return;
//     try {
//       const { data } = await API.get(`/wishes/parent/${user?.user?._id}`);
//       const wishesData = data.data || data;
//       setWishes(Array.isArray(wishesData) ? wishesData : []);
//     } catch (err) {
//       setWishes([]);
//       console.error("Error fetching wishes:", err);
//     }
//   };
//   const handleAddChild = (c) => setChildren((prev) => [...prev, c]);
//   const handleUpdateChild = (updated) =>
//     setChildren((prev) =>
//       prev.map((ch) => (ch._id === updated._id ? updated : ch))
//     );
//   const handleDeleteChild = (id) =>
//     setChildren((prev) => prev.filter((ch) => ch._id !== id));
//   const handleAddTask = (t) => setTasks((prev) => [...prev, t]);
//   const handleUpdateTask = (updated) =>
//     setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
//   const handleDeleteTask = (id) =>
//     setTasks((prev) => prev.filter((t) => t._id !== id));
//   const handleApproveTask = async (id) => {
//     try {
//       await API.put(`/tasks/${id}`, { status: "approved" });
//       setTasks((prev) =>
//         prev.map((t) => (t._id === id ? { ...t, status: "approved" } : t))
//       );
//     } catch (err) {
//       console.error("Error approving task:", err);
//     }
//   };
//   const handleRejectTask = async (id, reason) => {
//     try {
//       await API.put(`/tasks/${id}`, {
//         status: "rejected",
//         rejectionReason: reason,
//       });
//       setTasks((prev) =>
//         prev.map((t) => (t._id === id ? { ...t, status: "rejected" } : t))
//       );
//     } catch (err) {
//       console.error("Error rejecting task:", err);
//     }
//   };
//   const handleApproveWish = async (id) => {
//     try {
//       await API.put(`/wishes/${id}`, { status: "approved" });
//       setWishes((prev) =>
//         prev.map((w) => (w._id === id ? { ...w, status: "approved" } : w))
//       );
//     } catch (err) {
//       console.error("Error approving wish:", err);
//     }
//   };
//   const handleRejectWish = async (id) => {
//     try {
//       await API.put(`/wishes/${id}`, { status: "rejected" });
//       setWishes((prev) =>
//         prev.map((w) => (w._id === id ? { ...w, status: "rejected" } : w))
//       );
//     } catch (err) {
//       console.error("Error rejecting wish:", err);
//     }
//   };
//   const getChildById = (id) => children.find((c) => c._id === id);
//   const filteredTasks = selectedChildId
//     ? tasks.filter(
//         (task) =>
//           task.childId === selectedChildId ||
//           task.childId?._id === selectedChildId
//       )
//     : tasks;
//   const selectedChild = selectedChildId ? getChildById(selectedChildId) : null;
//   const pendingTaskCount = tasks.filter(
//     (t) => t.status === "pending_approval"
//   ).length;
//   const approvalTaskCount = tasks.filter((t) =>
//     ["sent", "pending_approval"].includes(t.status)
//   ).length;
//   const pendingWishCount = wishes.filter(
//     (w) => w.status === "pending_approval"
//   ).length;
//   const totalPending = pendingTaskCount + pendingWishCount;
//   return (
//     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
//       <Box sx={{ mb: 4 }}>
//         <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
//           Welcome back, {user?.name || user?.user?.name}!
//         </Typography>
//         <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
//           Manage your children's learning journey
//         </Typography>
//         <Button
//           variant={totalPending > 0 ? "contained" : "outlined"}
//           color={totalPending > 0 ? "error" : "primary"}
//           startIcon={
//             <Badge badgeContent={totalPending} color="error">
//               <Notifications />
//             </Badge>
//           }
//           onClick={() => setActiveTab(3)}
//         >
//           Approvals {totalPending > 0 && `(${totalPending})`}
//         </Button>
//         <Button
//           variant="outlined"
//           color="primary"
//           startIcon={<Refresh />}
//           sx={{ ml: 2 }}
//           onClick={() => {
//             fetchChildren();
//             fetchTasks();
//             fetchWishes();
//           }}
//         >
//           Refresh
//         </Button>
//       </Box>
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         {[
//           stats.totalChildren,
//           stats.totalTasks,
//           stats.totalWishes,
//           stats.totalPoints,
//         ].map((v, i) => (
//           <Grid item xs={12} sm={6} md={3} key={i}>
//             <Box
//               sx={{
//                 textAlign: "center",
//                 p: 2,
//                 bgcolor: [
//                   "primary.50",
//                   "info.50",
//                   "secondary.50",
//                   "success.50",
//                 ][i],
//                 borderRadius: 2,
//               }}
//             >
//               <Typography
//                 variant="h3"
//                 sx={{
//                   fontWeight: "bold",
//                   color: [
//                     "primary.main",
//                     "info.main",
//                     "secondary.main",
//                     "success.main",
//                   ][i],
//                 }}
//               >
//                 {v}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 {
//                   ["Children", "Total Tasks", "Total Wishes", "Points Earned"][
//                     i
//                   ]
//                 }
//               </Typography>
//             </Box>
//           </Grid>
//         ))}
//       </Grid>
//       {activeTab === 0 && (
//         <Box>
//           {children.length === 0 ? (
//             <Box sx={{ textAlign: "center", py: 8 }}>
//               <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
//                 No children added yet
//               </Typography>
//               <Button
//                 variant="contained"
//                 size="large"
//                 startIcon={<Add />}
//                 onClick={() => setOpenAddChild(true)}
//               >
//                 Add Your First Child
//               </Button>
//             </Box>
//           ) : (
//             <Grid container spacing={3}>
//               {children.map((c) => (
//                 <Grid item xs={12} md={6} lg={4} key={c._id}>
//                   <ChildCard
//                     child={c}
//                     onEdit={() => {
//                       setEditingChild(c);
//                       setOpenAddChild(true);
//                     }}
//                     onDelete={() => handleDeleteChild(c._id)}
//                   />
//                 </Grid>
//               ))}
//             </Grid>
//           )}
//         </Box>
//       )}
//       {activeTab === 1 && (
//         <Box>
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               mb: 3,
//             }}
//           >
//             <Typography variant="h5" sx={{ fontWeight: "bold" }}>
//               All Tasks ({filteredTasks.length}
//               {selectedChild && ` for ${selectedChild.name}`})
//             </Typography>
//             <Button
//               variant="contained"
//               onClick={() => {
//                 setEditingTask(null);
//                 setOpenAddTask(true);
//               }}
//               disabled={!children.length}
//             >
//               Add Task
//             </Button>
//           </Box>
//           {children.length > 0 && (
//             <Box sx={{ mb: 3, maxWidth: 300 }}>
//               <FormControl fullWidth size="small">
//                 <InputLabel id="select-child-label">Filter by Child</InputLabel>
//                 <Select
//                   labelId="select-child-label"
//                   value={selectedChildId}
//                   onChange={(e) => setSelectedChildId(e.target.value)}
//                 >
//                   <MenuItem value="">
//                     <em>All Children</em>
//                   </MenuItem>
//                   {children.map((child) => (
//                     <MenuItem key={child._id} value={child._id}>
//                       {child.name}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Box>
//           )}
//           <Stack
//             direction="row"
//             spacing={2}
//             sx={{ mb: 3 }}
//             flexWrap="wrap"
//             gap={1}
//           >
//             {[
//               { label: "Pending Approval", status: "pending_approval" },
//               { label: "Approved", status: "approved" },
//               { label: "Rejected", status: "rejected" },
//               { label: "Sent", status: "sent" },
//               { label: "Complete", status: "complete" },
//             ].map(({ label, status }) => (
//               <Chip
//                 key={status}
//                 label={`${label} (${
//                   filteredTasks.filter((t) => t.status === status).length
//                 })`}
//                 color={statusColorMap[status] || "default"}
//                 variant="outlined"
//               />
//             ))}
//           </Stack>
//           {!children.length ? (
//             <Alert severity="info">Add children first.</Alert>
//           ) : !filteredTasks.length ? (
//             <Alert severity="info">
//               {selectedChild
//                 ? `No tasks found for ${selectedChild.name}.`
//                 : "No tasks yet."}
//             </Alert>
//           ) : (
//             <Stack spacing={2}>
//               {filteredTasks.map((t) => (
//                 <TaskItem
//                   key={t._id}
//                   task={t}
//                   children={children}
//                   onEdit={(task) => {
//                     setEditingTask(task);
//                     setOpenAddTask(true);
//                   }}
//                   onDelete={handleDeleteTask}
//                 />
//               ))}
//             </Stack>
//           )}
//         </Box>
//       )}
//       {activeTab === 2 && (
//         <ParentWishes
//           children={children}
//           wishes={wishes}
//           onApprove={handleApproveWish}
//           onReject={handleRejectWish}
//         />
//       )}
//       {activeTab === 3 && (
//         <>
//           <Typography variant="h6" gutterBottom>
//             Task Approvals ({approvalTaskCount})
//           </Typography>
//           {!children.length ? (
//             <Alert severity="info">No children available.</Alert>
//           ) : approvalTaskCount === 0 ? (
//             <Alert severity="info">No task approvals.</Alert>
//           ) : (
//             <Grid container spacing={2}>
//               {tasks
//                 .filter((t) => ["sent", "pending_approval"].includes(t.status))
//                 .map((t) => (
//                   <Grid item xs={12} key={t._id}>
//                     <ApprovalTaskItem
//                       task={t}
//                       children={children}
//                       onApprove={handleApproveTask}
//                       onReject={handleRejectTask}
//                     />
//                   </Grid>
//                 ))}
//             </Grid>
//           )}
//         </>
//       )}
//       {children.length > 0 && (
//         <Tooltip title="Add Task" placement="left">
//           <Fab
//             color="primary"
//             sx={{ position: "fixed", bottom: 16, right: 80 }}
//             onClick={() => {
//               setEditingTask(null);
//               setOpenAddTask(true);
//             }}
//           >
//             <Assignment />
//           </Fab>
//         </Tooltip>
//       )}
//       <Tooltip title="Add Child" placement="left">
//         <Fab
//           color="primary"
//           sx={{ position: "fixed", bottom: 16, right: 16 }}
//           onClick={() => {
//             setEditingChild(null);
//             setOpenAddChild(true);
//           }}
//         >
//           <Add />
//         </Fab>
//       </Tooltip>
//       <AddChildDialog
//         open={openAddChild}
//         onClose={() => {
//           setOpenAddChild(false);
//           setEditingChild(null);
//         }}
//         onAdd={handleAddChild}
//         onUpdate={handleUpdateChild}
//         editChild={editingChild}
//       />
//       <AddTaskDialog
//         open={openAddTask}
//         onClose={() => {
//           setOpenAddTask(false);
//           setEditingTask(null);
//         }}
//         onAdd={handleAddTask}
//         onUpdate={handleUpdateTask}
//         children={children}
//         editTask={editingTask}
//       />
//     </Container>
//   );
// };

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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Assignment,
  Notifications,
  Refresh,
} from "@mui/icons-material";
import ChildCard from "../components/parent/ChildCard";
import AddChildDialog from "../components/parent/AddChildDialog";
import AddTaskDialog from "../components/parent/AddTaskDialog";
import TaskItem from "../components/parent/TaskItem";
import ApprovalTaskItem from "../components/parent/ApprovalTaskItem";
import { API } from "../components/api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import ParentWishes from "../components/parent/ParentWishes";

export const ParentDashboard = ({
  activeTab,
  setActiveTab,
  setPendingApprovals,
}) => {
  const { user } = useAuth();
  const [openAddChild, setOpenAddChild] = useState(false);
  const [openAddTask, setOpenAddTask] = useState(false);
  const [openAddWish, setOpenAddWish] = useState(false);
  const [children, setChildren] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [editingChild, setEditingChild] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingWish, setEditingWish] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalTasks: 0,
    totalWishes: 0,
    totalPoints: 0,
  });
  const statusColorMap = {
    pending: "warning",
    pending_approval: "warning",
    approved: "success",
    rejected: "error",
    sent: "info",
    complete: "default",
  };

  useEffect(() => {
    if (user?.user?._id) {
      fetchChildren();
      fetchTasks();
      fetchWishes();
    }
  }, [user?.user?._id, activeTab]);

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
    });
    const pendingTasks = tasks.filter(
      (t) => t.status === "pending_approval"
    ).length;
    const pendingWishes = wishes.filter(
      (w) => w.status === "pending_approval"
    ).length;
    setPendingApprovals(pendingTasks + pendingWishes);
  }, [children, tasks, wishes, setPendingApprovals]);

  const fetchChildren = async () => {
    try {
      const { data } = await API.get("/children");
      setChildren(Array.isArray(data) ? data : []);
    } catch (err) {
      setChildren([]);
      console.error("Error fetching children:", err);
    }
  };

  const fetchTasks = async () => {
    if (!user?.user?._id) return;
    try {
      const { data } = await API.get(`/tasks/parent/${user?.user?._id}`);
      const tasksData = data.data || data.tasks || data;
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      setTasks([]);
      console.error("Error fetching tasks:", err);
    }
  };

  const fetchWishes = async () => {
    if (!user?.user?._id) return;
    try {
      const { data } = await API.get(`/wishes/parent/${user?.user?._id}`);
      const wishesData = data.data || data;
      setWishes(Array.isArray(wishesData) ? wishesData : []);
    } catch (err) {
      setWishes([]);
      console.error("Error fetching wishes:", err);
    }
  };

  const handleAddChild = (c) => setChildren((prev) => [...prev, c]);
  const handleUpdateChild = (updated) =>
    setChildren((prev) =>
      prev.map((ch) => (ch._id === updated._id ? updated : ch))
    );

  /*  NEW : actually hit the server before removing from state  */
  const handleDeleteChild = async (id) => {
    try {
      await API.delete(`/children/${id}`);
      setChildren((prev) => prev.filter((ch) => ch._id !== id));
    } catch (err) {
      console.error("Error deleting child:", err);
      alert("Could not delete child. Please try again.");
    }
  };

  const handleAddTask = (t) => setTasks((prev) => [...prev, t]);
  const handleUpdateTask = (updated) =>
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  const handleDeleteTask = (id) =>
    setTasks((prev) => prev.filter((t) => t._id !== id));

  const handleApproveTask = async (id) => {
    try {
      await API.put(`/tasks/${id}`, { status: "approved" });
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: "approved" } : t))
      );
    } catch (err) {
      console.error("Error approving task:", err);
    }
  };

  const handleRejectTask = async (id, reason) => {
    try {
      await API.put(`/tasks/${id}`, {
        status: "rejected",
        rejectionReason: reason,
      });
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: "rejected" } : t))
      );
    } catch (err) {
      console.error("Error rejecting task:", err);
    }
  };

  const handleApproveWish = async (id) => {
    try {
      await API.put(`/wishes/${id}`, { status: "approved" });
      setWishes((prev) =>
        prev.map((w) => (w._id === id ? { ...w, status: "approved" } : w))
      );
    } catch (err) {
      console.error("Error approving wish:", err);
    }
  };

  const handleRejectWish = async (id) => {
    try {
      await API.put(`/wishes/${id}`, { status: "rejected" });
      setWishes((prev) =>
        prev.map((w) => (w._id === id ? { ...w, status: "rejected" } : w))
      );
    } catch (err) {
      console.error("Error rejecting wish:", err);
    }
  };

  const getChildById = (id) => children.find((c) => c._id === id);
  const filteredTasks = selectedChildId
    ? tasks.filter(
        (task) =>
          task.childId === selectedChildId ||
          task.childId?._id === selectedChildId
      )
    : tasks;
  const selectedChild = selectedChildId ? getChildById(selectedChildId) : null;
  const pendingTaskCount = tasks.filter(
    (t) => t.status === "pending_approval"
  ).length;
  const approvalTaskCount = tasks.filter((t) =>
    ["sent", "pending_approval"].includes(t.status)
  ).length;
  const pendingWishCount = wishes.filter(
    (w) => w.status === "pending_approval"
  ).length;
  const totalPending = pendingTaskCount + pendingWishCount;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
          Welcome back, {user?.name || user?.user?.name}!
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
        >
          Approvals {totalPending > 0 && `(${totalPending})`}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Refresh />}
          sx={{ ml: 2 }}
          onClick={() => {
            fetchChildren();
            fetchTasks();
            fetchWishes();
          }}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          stats.totalChildren,
          stats.totalTasks,
          stats.totalWishes,
          stats.totalPoints,
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              All Tasks ({filteredTasks.length}
              {selectedChild && ` for ${selectedChild.name}`})
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
              <FormControl fullWidth size="small">
                <InputLabel id="select-child-label">Filter by Child</InputLabel>
                <Select
                  labelId="select-child-label"
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Children</em>
                  </MenuItem>
                  {children.map((child) => (
                    <MenuItem key={child._id} value={child._id}>
                      {child.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 3 }}
            flexWrap="wrap"
            gap={1}
          >
            {[
              { label: "Pending Approval", status: "pending_approval" },
              { label: "Approved", status: "approved" },
              { label: "Rejected", status: "rejected" },
              { label: "Sent", status: "sent" },
              { label: "Complete", status: "complete" },
            ].map(({ label, status }) => (
              <Chip
                key={status}
                label={`${label} (${
                  filteredTasks.filter((t) => t.status === status).length
                })`}
                color={statusColorMap[status] || "default"}
                variant="outlined"
              />
            ))}
          </Stack>
          {!children.length ? (
            <Alert severity="info">Add children first.</Alert>
          ) : !filteredTasks.length ? (
            <Alert severity="info">
              {selectedChild
                ? `No tasks found for ${selectedChild.name}.`
                : "No tasks yet."}
            </Alert>
          ) : (
            <Stack spacing={2}>
              {filteredTasks.map((t) => (
                <TaskItem
                  key={t._id}
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
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <ParentWishes
          children={children}
          wishes={wishes}
          onApprove={handleApproveWish}
          onReject={handleRejectWish}
        />
      )}

      {activeTab === 3 && (
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
                .filter((t) => ["sent", "pending_approval"].includes(t.status))
                .map((t) => (
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

      {children.length > 0 && (
        <Tooltip title="Add Task" placement="left">
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
        </Tooltip>
      )}
      <Tooltip title="Add Child" placement="left">
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
      </Tooltip>

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
    </Container>
  );
};