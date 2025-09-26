import { useState, useEffect } from "react";
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
import { Assignment, Edit } from "@mui/icons-material";
import dayjs from "dayjs";
import { API } from "../api/axiosInstance";

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
  initialChildId = null,
}) => {
  const isEditMode = !!editTask;
  const [formData, setFormData] = useState({
    title: "",
    points: 10,
    childId: "",
  });
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (isEditMode && editTask) {
      let childId = "";
      if (editTask.childId) {
        childId = editTask.childId;
      } else if (editTask.child && editTask.child._id) {
        childId = editTask.child._id;
      }
      setFormData({
        title: editTask.title || "",
        category: editTask.category || "Other",
        points: editTask.pointsAwarded || editTask.points || 10,
        dueDate: editTask.dueDate
          ? dayjs(editTask.dueDate).format("YYYY-MM-DD")
          : "",
        childId: childId,
        estimatedDuration: editTask.estimatedDuration || "",
      });
      setErrors({});
    } else {
      setFormData({
        title: "",
        category: "Other",
        points: 10,
        dueDate: "",
        childId: initialChildId || "",
        estimatedDuration: "",
      });
      setErrors({});
    }
  }, [editTask, isEditMode, children, initialChildId]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "category") {
      const categoryData = TASK_CATEGORIES.find((cat) => cat.name === value);
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
    if (!validateForm()) {
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
          category: formData.category,
          pointsAwarded: formData.points,
          dueDate: formData.dueDate,
          estimatedDuration: formData.estimatedDuration,
          status: editTask.status || "pending_approval",
          childId: formData.childId,
        };
        const res = await API.put(`/tasks/${editTask?._id}`, updateData);
        //console.log("✅ Task updated =====>", res.data);
        onUpdate(res.data);
        handleClose();
      } else {
        const createData = {
          title: formData.title,
          category: formData.category,
          pointsAwarded: formData.points,
          dueDate: formData.dueDate,
          estimatedDuration: formData.estimatedDuration,
          status: "pending_approval",
          childId: formData.childId,
        };

        const res = await API.post("/tasks", createData);

        //console.log("✅ Full API Response =====>", res);

        let taskData = res.data;

        if (res.data && res.data.data) {
          taskData = res.data.data;
        } else if (res.data && res.data.task) {
          taskData = res.data.task;
        }

        if (taskData && taskData._id) {
          onAdd(taskData);
          handleClose();
        } else {
          console.error(
            "❌ No valid task data in response - triggering refresh"
          );
          onAdd(null);
          handleClose();
        }
      }
    } catch (error) {
      console.error(
        "❌ Error saving task:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      //description: "",
      category: "Other",
      points: 10,
      dueDate: "",
      childId: "",
      estimatedDuration: "",
    });
    setErrors({});
    onClose();
  };

  const selectedChild = children.find(
    (child) => child._id === formData.childId
  );

  if (formData.childId && !selectedChild) {
    console.warn("⚠️ ChildId not found in children array:", formData.childId);
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
                    label={preset.title}
                    onClick={() => handlePresetTask(preset)}
                    clickable
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
          <FormControl fullWidth error={!!errors.childId}>
            <InputLabel>Assign to Child</InputLabel>
            <Select
              value={formData.childId}
              onChange={handleChange("childId")}
              label="Assign to Child"
            >
              {children.map((child) => (
                <MenuItem key={child._id} value={child._id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                      {child.name.charAt(0)}
                    </Avatar>
                    {child.name} (Level{" "}
                    {Math.floor((child.totalPoints || 0) / 50) + 1})
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.childId && (
              <Typography variant="caption" color="error">
                {errors.childId}
              </Typography>
            )}
          </FormControl>
          <TextField
            label="Task Title"
            value={formData.title}
            onChange={handleChange("title")}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
          />
          
          <TextField
            label="Points"
            type="number"
            value={formData.points}
            onChange={handleChange("points")}
            error={!!errors.points}
            helperText={errors.points}
            InputProps={{ inputProps: { min: 1, max: 100 } }}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.title.trim() || !formData.childId}
        >
          {isEditMode ? "Update Task" : "Create Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTaskDialog;
