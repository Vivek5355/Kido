import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  Chip,
  Box,
} from "@mui/material";
import {
  MoreVert,
  AddTask,
  Redeem,
  CheckCircle,
  Cancel,
  Star,
} from "@mui/icons-material";
import CreateTaskForm from "./CreateTaskForm";

const WishCard = ({
  wish,
  child,
  userRole,
  onApprove,
  onReject,
  onRequestRedemption,
  childrenList = [],
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const availablePoints = child ? child.totalPoints - child.redeemedPoints : 0;
  const canAfford = availablePoints >= wish.pointsRequired;
  const getStatusConfig = (status) => {
    switch (status) {
      case "available":
        return { color: "primary", label: "Available", icon: <Star /> };
      case "pending_approval":
        return { color: "warning", label: "Pending Approval", icon: <Star /> };
      case "approved":
        return { color: "success", label: "Approved", icon: <CheckCircle /> };
      case "redeemed":
        return { color: "success", label: "Redeemed", icon: <CheckCircle /> };
      case "rejected":
        return { color: "error", label: "Rejected", icon: <Cancel /> };
      default:
        return { color: "default", label: "Unknown", icon: <Star /> };
    }
  };
  const statusConfig = getStatusConfig(wish.status);
  const getChildName = () => {
    if (child?.name) return child.name;
    if (wish.childId?.name) return wish.childId.name;
    if (wish.childName) return wish.childName;
    return "Unknown Child";
  };
  return (
    <>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardHeader
          avatar={
            <Avatar
              src={child?.profilePicture}
              sx={{ bgcolor: "secondary.main" }}
            >
              {getChildName().charAt(0).toUpperCase()}
            </Avatar>
          }
          action={
            <Stack direction="row" alignItems="center">
              <Tooltip title="Add Task">
                <IconButton onClick={() => setTaskDialogOpen(true)}>
                  <AddTask />
                </IconButton>
              </Tooltip>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVert />
              </IconButton>
            </Stack>
          }
          title={<Typography variant="h6">{wish.title}</Typography>}
          subheader={`For: ${getChildName()}`}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Stack spacing={2}>
            {wish.description && (
              <Typography variant="body2" color="text.secondary">
                {wish.description}
              </Typography>
            )}
            <Stack direction="row" spacing={1}>
              <Chip
                label={statusConfig.label}
                color={statusConfig.color}
                icon={statusConfig.icon}
                size="small"
              />
            </Stack>
            {child && (
              <Box
                sx={{
                  p: 1,
                  bgcolor: canAfford ? "success.50" : "warning.50",
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Available Points: {availablePoints} / {wish.pointsRequired}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
        <CardActions>
          {userRole === "parent" && wish.status === "pending_approval" && (
            <>
              <IconButton onClick={() => onApprove(wish._id)} color="success">
                <CheckCircle />
              </IconButton>
              <IconButton onClick={() => onReject(wish._id)} color="error">
                <Cancel />
              </IconButton>
            </>
          )}
          {userRole === "child" && wish.status === "available" && canAfford && (
            <IconButton
              onClick={() => onRequestRedemption(wish._id)}
              color="secondary"
            >
              <Redeem />
            </IconButton>
          )}
        </CardActions>
      </Card>
      <CreateTaskForm
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        wish={wish}
        childrenList={childrenList}
        onTaskCreated={(task) => console.log("âœ… Task Created:", task)}
      />
    </>
  );
};

export default WishCard;
