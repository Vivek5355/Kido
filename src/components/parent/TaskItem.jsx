import { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import {
  MoreVert,
  Edit,
  Delete,
  CheckCircle,
  Schedule,
  Star,Cancel,
} from "@mui/icons-material";

const TaskItem = ({ task, children, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const assignedChild = children.find((child) => child._id === task.childId);

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending_approval":
        return {
          color: "warning",
          label: "Pending Approval",
          icon: <Schedule />,
        };
      case "approved":
        return { color: "success", label: "Approved", icon: <CheckCircle /> };
      case "rejected":
        return { color: "error", label: "Rejected", icon: <Cancel /> };
      default:
        return { color: "default", label: "Unknown", icon: <Schedule /> };
    }
  };

  const statusConfig = getStatusConfig(task.status);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    console.log("🔄 Editing task:", task);
    console.log("Task childId:", task.childId);
    console.log("Available children:", children);
    console.log("Assigned child:", assignedChild);
    onEdit(task);
    handleMenuClose();
  };

  const handleDelete = () => {
    console.log("🗑️ Deleting task:", task._id);
    onDelete(task._id);
    handleMenuClose();
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flex: 1 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: "0.875rem" }}>
            {assignedChild?.name?.charAt(0) || "?"}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {task.title}
              </Typography>
              
              <IconButton size="small" onClick={handleMenuClick}>
                <MoreVert />
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleEdit}>
                  <Edit sx={{ mr: 1 }} />
                  Edit
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
                  <Delete sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              </Menu>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              <Chip
                {...statusConfig}
                icon={statusConfig.icon}
                label={statusConfig.label}
                size="small"
              />
              
              {task.category && (
                <Chip
                  label={task.category}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
              
              {task.pointsAwarded && (
                <Chip
                  icon={<Star />}
                  label={`${task.pointsAwarded} pts`}
                  size="small"
                  color="primary"
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
              
              {task.estimatedDuration && (
                <Chip
                  icon={<Schedule />}
                  label={task.estimatedDuration}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
            </Box>

            {task.description && (
              <Typography variant="body2" color="text.secondary" paragraph>
                {task.description}
              </Typography>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {task.dueDate && (
                <Typography variant="caption" color="text.secondary">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </Typography>
              )}
              
              {task.createdAt && (
                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </Typography>
              )}
              
              {task.approvedAt && (
                <Typography variant="caption" color="success.main">
                  ✅ Approved: {new Date(task.approvedAt).toLocaleDateString()}
                </Typography>
              )}
              
              {task.rejectedAt && (
                <Typography variant="caption" color="error.main">
                  ❌ Rejected: {new Date(task.rejectedAt).toLocaleDateString()}
                  {task.rejectionReason && ` - ${task.rejectionReason}`}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default TaskItem;
