import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Avatar,
  Chip,
} from "@mui/material";
import { Assignment, Star, Edit } from "@mui/icons-material";
import dayjs from "dayjs";
import { API } from "../api/axiosInstance";

const TASK_CATEGORIES = [
  { name: "Reading", points: 15, color: "primary" },
  { name: "Math", points: 20, color: "secondary" },
  { name: "Chores", points: 10, color: "success" },
  { name: "Exercise", points: 25, color: "warning" },
  { name: "Creative", points: 15, color: "info" },
  { name: "Social", points: 12, color: "error" },
  { name: "Other", points: 10, color: "default" },
];

const PRESET_TASKS = [
  {
    title: "Read for 20 minutes",
    category: "Reading",
    points: 15,
    duration: "20 min",
  },
  {
    title: "Complete math worksheet",
    category: "Math",
    points: 20,
    duration: "30 min",
  },
  {
    title: "Tidy up bedroom",
    category: "Chores",
    points: 10,
    duration: "15 min",
  },
  {
    title: "Exercise for 30 minutes",
    category: "Exercise",
    points: 25,
    duration: "30 min",
  },
  {
    title: "Practice piano",
    category: "Creative",
    points: 15,
    duration: "20 min",
  },
  {
    title: "Help with dinner prep",
    category: "Chores",
    points: 20,
    duration: "25 min",
  },
  {
    title: "Write in journal",
    category: "Creative",
    points: 12,
    duration: "15 min",
  },
];

const AddTaskDialog = ({
  open,
  onClose,
  onAdd,
  onUpdate,
  children = [],
  editTask = null,
}) => {
  const isEditMode = !!editTask;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    points: 10,
    dueDate: "",
    childId: "",
    estimatedDuration: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && editTask) {
      console.log("🔄 Edit Mode - Setting form data:", editTask);
      console.log("Available children:", children);
      const childExists = children.find(child => child._id === editTask.childId);
      console.log("Child exists:", childExists);
      
      setFormData({
        title: editTask.title || "",
        description: editTask.description || "",
        category: editTask.category || "Other",
        points: editTask.pointsAwarded || editTask.points || 10,
        dueDate: editTask.dueDate ? dayjs(editTask.dueDate).format("YYYY-MM-DD") : "",
        childId: editTask.childId || "", 
        estimatedDuration: editTask.estimatedDuration || "",
      });
      
      setErrors({});
    } else {
      setFormData({
        title: "",
        description: "",
        category: "Other",
        points: 10,
        dueDate: "",
        childId: "",
        estimatedDuration: "",
      });
      setErrors({});
    }
  }, [editTask, isEditMode, children]);
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    console.log(`🔄 Field changed: ${field} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "category") {
      const categoryData = TASK_CATEGORIES.find(
        (cat) => cat.name === value
      );
      if (categoryData) {
        setFormData((prev) => ({
          ...prev,
          points: categoryData.points,
          [field]: value,
        }));
      }
    }
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handlePresetTask = (preset) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      category: preset.category,
      points: preset.points,
      estimatedDuration: preset.duration,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }
    
    if (!formData.childId) {
      newErrors.childId = "Please select a child";
    }
    
    if (formData.points < 1 || formData.points > 100) {
      newErrors.points = "Points must be between 1 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("🚀 Submit form data:", formData);
    
    if (!validateForm()) {
      console.log("❌ Form validation failed:", errors);
      return;
    }

    try {
      if (isEditMode) {
        if (editTask.status === "complete") {
          alert("Completed tasks cannot be edited.");
          return;
        }

        const updateData = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          pointsAwarded: formData.points,
          dueDate: formData.dueDate,
          estimatedDuration: formData.estimatedDuration,
          status: editTask.status || "pending_approval",
          childId: formData.childId,
        };

        console.log("📤 Updating task with data:", updateData);
        const res = await API.put(`/tasks/${editTask._id}`, updateData);
        console.log("✅ Task updated:", res.data);
        onUpdate(res.data);
        handleClose();
      } else {
        const createData = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          pointsAwarded: formData.points,
          dueDate: formData.dueDate,
          estimatedDuration: formData.estimatedDuration,
          status: "pending_approval",
          childId: formData.childId,
        };

        console.log("📤 Creating task with data:", createData);
        const res = await API.post("/tasks", createData);
        console.log("✅ Task created:", res.data);
        onAdd(res.data);
        handleClose();
      }
    } catch (error) {
      console.error("❌ Error saving task:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      category: "Other",
      points: 10,
      dueDate: "",
      childId: "",
      estimatedDuration: "",
    });
    setErrors({});
    onClose();
  };

  // Debug logging
  console.log("🐛 Debug Info:");
  console.log("- isEditMode:", isEditMode);
  console.log("- editTask:", editTask);
  console.log("- children:", children);
  console.log("- formData.childId:", formData.childId);
  console.log("- errors:", errors);

  const selectedChild = children.find((child) => child._id === formData.childId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {isEditMode ? <Edit /> : <Assignment />}
        {isEditMode ? "Edit Task" : "Create New Task"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {!isEditMode && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Quick Task Templates:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {PRESET_TASKS.map((preset, index) => (
                  <Chip
                    key={index}
                    label={`${preset.title} (${preset.points} pts)`}
                    onClick={() => handlePresetTask(preset)}
                    clickable
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          <TextField
            label="Task Title"
            value={formData.title}
            onChange={handleChange("title")}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            required
          />

          <TextField
            label="Description (Optional)"
            value={formData.description}
            onChange={handleChange("description")}
            fullWidth
            multiline
            rows={2}
          />

          <FormControl fullWidth error={!!errors.childId} required>
            <InputLabel>Assign to Child</InputLabel>
            <Select
              value={formData.childId}
              onChange={handleChange("childId")}
              label="Assign to Child"
            >
              {children.map((child) => (
                <MenuItem key={child._id} value={child._id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
                      {child.name.charAt(0)}
                    </Avatar>
                    {child.name} (Level {Math.floor((child.totalPoints || 0) / 50) + 1})
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.childId && (
              <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                {errors.childId}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={handleChange("category")}
              label="Category"
            >
              {TASK_CATEGORIES.map((category) => (
                <MenuItem key={category.name} value={category.name}>
                  {category.name} (Recommended: {category.points} pts)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Points"
            type="number"
            value={formData.points}
            onChange={handleChange("points")}
            error={!!errors.points}
            helperText={errors.points || "Points between 1-100"}
            inputProps={{ min: 1, max: 100 }}
            fullWidth
          />

          <TextField
            label="Due Date (Optional)"
            type="date"
            value={formData.dueDate}
            onChange={handleChange("dueDate")}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Estimated Duration (Optional)"
            value={formData.estimatedDuration}
            onChange={handleChange("estimatedDuration")}
            placeholder="e.g., 20 min, 1 hour"
            fullWidth
          />

          {selectedChild && (
            <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, border: 1, borderColor: "divider" }}>
              <Typography variant="subtitle2" gutterBottom>
                Task Preview:
              </Typography>
              <Typography variant="body2">
                {selectedChild.name} will earn{" "}
                <Chip
                  icon={<Star />}
                  label={`${formData.points} pts`}
                  size="small"
                  color="primary"
                />{" "}
                for completing: {formData.title || "this task"}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Note: Task will appear in Approvals tab for immediate approval/rejection
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!formData.title.trim() || !formData.childId}
        >
          {isEditMode ? "Update Task" : "Create Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTaskDialog;
