import { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Chip,
  Button,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Schedule,
  Star,
  ThumbUp,
  ThumbDown,
} from "@mui/icons-material";

const ApprovalTaskItem = ({ task, children, onApprove, onReject }) => {
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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
          icon: <Schedule />,
        };
      default:
        return { color: "default", label: "Unknown", icon: <Schedule /> };
    }
  };

  const statusConfig = getStatusConfig(task.status);

  const handleApprove = () => {
    //console.log('Task object:', task);
    onApprove(task._id);
  };

  const handleReject = () => {
    onReject(task._id, rejectionReason);
    setOpenRejectDialog(false);
    setRejectionReason("");
  };

  return (
    <>
      <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            {assignedChild?.name?.charAt(0) || "?"}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography variant="h6" component="h3">
                {task.title}
              </Typography>
              <Chip
                label={statusConfig.label}
                color={statusConfig.color}
                icon={statusConfig.icon}
                size="small"
              />
            </Box>

            {(task.status === "sent" || task.status === "pending_approval" || task.status === "pending-approval") && (
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ThumbUp />}
                  onClick={handleApprove}
                  size="small"
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ThumbDown />}
                  onClick={() => setOpenRejectDialog(true)}
                  size="small"
                >
                  Reject
                </Button>
              </Stack>
            )}

            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
              {task.category && (
                <Chip label={task.category} variant="outlined" size="small" />
              )}
              {task.pointsAwarded && (
                <Chip
                  label={`${task.pointsAwarded} points`}
                  color="primary"
                  icon={<Star />}
                  variant="outlined"
                  size="small"
                />
              )}
              {task.estimatedDuration && (
                <Chip
                  label={`${task.estimatedDuration} min`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>

            {task.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {task.description}
              </Typography>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {assignedChild && (
                <Typography variant="caption" color="text.secondary">
                  Assigned to: {assignedChild.name}
                </Typography>
              )}

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
      </Paper>

      <Dialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
      >
        <DialogTitle>Reject Task</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Please provide a reason for rejecting this task:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            disabled={!rejectionReason.trim()}
          >
            Reject Task
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApprovalTaskItem;
