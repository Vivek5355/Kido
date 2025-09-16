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
  Star,
  Cancel,
} from "@mui/icons-material";

const TaskItem = ({ task, children, onEdit, onDelete, readOnly = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const getAssignedChild = () => {
    if (task.childId) {
      return children.find((child) => child._id === task.childId);
    }
    if (task.child && task.child._id) {
      return (
        children.find((child) => child._id === task.child._id) || task.child
      );
    }
    return null;
  };
  const assignedChild = getAssignedChild();
  const getStatusConfig = (status) => {
    switch (status) {
      case "pending_approval":
      case "pending":
        return {
          color: "warning",
          label: "Pending Approval",
          icon: <Schedule />,
        };
      case "approved":
        return { color: "success", label: "Approved", icon: <CheckCircle /> };
      case "rejected":
        return { color: "error", label: "Rejected", icon: <Cancel /> };
      case "sent":
        return {
          color: "info",
          label: "Sent",
          icon: <Star />,
        };
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
    const taskForEdit = {
      ...task,
      childId: task.childId || (task.child && task.child._id),
    };
    onEdit(taskForEdit);
    handleMenuClose();
  };
  const handleDelete = () => {
    onDelete(task._id);
    handleMenuClose();
  };
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        border: `2px solid ${
          statusConfig.color === "default"
            ? "grey"
            : statusConfig.color + ".main"
        }`,
        borderRadius: 2,
        position: "relative",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Avatar sx={{ width: 32, height: 32, fontSize: "0.875rem" }}>
            {assignedChild?.name?.charAt(0) || "?"}
          </Avatar>
          <Typography variant="h6" component="div">
            {task.title}
          </Typography>
          <Chip {...statusConfig} size="small" icon={statusConfig.icon} />
        </Box>

        {!readOnly && (
          <>
            <IconButton size="small" onClick={handleMenuClick} sx={{ ml: 1 }}>
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
              <MenuItem onClick={handleDelete}>
                <Delete sx={{ mr: 1 }} />
                Delete
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      <Box sx={{ mb: 1 }}>
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
            label={`${task.pointsAwarded} pts`}
            size="small"
            color="primary"
            sx={{ mr: 1, mb: 1 }}
          />
        )}
        {task.estimatedDuration && (
          <Chip
            label={task.estimatedDuration}
            size="small"
            variant="outlined"
            sx={{ mr: 1, mb: 1 }}
          />
        )}
      </Box>
      {task.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {task.description}
        </Typography>
      )}
      {assignedChild && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Assigned to:</strong> {assignedChild.name}
        </Typography>
      )}
      {task.dueDate && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
        </Typography>
      )}
      {task.createdAt && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Created:</strong>{" "}
          {new Date(task.createdAt).toLocaleDateString()}
        </Typography>
      )}
      {task.approvedAt && (
        <Typography variant="body2" color="success.main" sx={{ mb: 0.5 }}>
          ✅ <strong>Approved:</strong>{" "}
          {new Date(task.approvedAt).toLocaleDateString()}
        </Typography>
      )}
      {task.rejectedAt && (
        <Typography variant="body2" color="error.main" sx={{ mb: 0.5 }}>
          ❌ <strong>Rejected:</strong>{" "}
          {new Date(task.rejectedAt).toLocaleDateString()}
          {task.rejectionReason && ` - ${task.rejectionReason}`}
        </Typography>
      )}
    </Paper>
  );
};

export default TaskItem;
