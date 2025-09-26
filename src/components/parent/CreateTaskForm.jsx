import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  MenuItem,
} from "@mui/material";
import { API } from "../api/axiosInstance";

const CreateTaskForm = ({
  open,
  onClose,
  wish,
  childrenList = [],
  onTaskCreated,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    pointsAwarded: "",
    childId: "",
    wishId: "",
    type: 2,
  });

  useEffect(() => {
    if (open && wish) {
      setFormData({
        title: "",
        category: "",
        pointsAwarded: "",
        childId: wish.childId?._id || "",
        wishId: wish._id || "",
        type: 2,
      });
    }
  }, [wish, open]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // if (name === "childId") {
    //   const selectedChild = childrenList.find((child) => child._id === value);
    //   // console.log(
    //   //   "Selected Child:",
    //   //   selectedChild?.name || "Unknown Child"
    //   // );
    // }
  };

  const handleSubmit = async () => {
    try {
      const response = await API.post("/tasks", formData);

      if (onTaskCreated) onTaskCreated(response.data);
      onClose();
    } catch (error) {
      console.error("âŒ Task creation failed:", error.response?.data || error);
      alert(error.response?.data?.message || "Task creation failed");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Task for Wish</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Assigned Child"
            value={wish.childId?.name || "Unknown Child"}
            fullWidth
            disabled
          />
          {/* Show wish title */}
          <TextField
            label="Wish"
            value={wish?.title || ""}
            fullWidth
            disabled
          />

          {/* Task title */}
          <TextField
            label="Task Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="Chores">Chores</MenuItem>
            <MenuItem value="Homework">Homework</MenuItem>
            <MenuItem value="Activity">Activity</MenuItem>
          </TextField>

          {/* Points */}
          <TextField
            label="Points Awarded"
            name="pointsAwarded"
            type="number"
            value={formData.pointsAwarded}
            onChange={handleChange}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskForm;
