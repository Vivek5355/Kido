import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import { API } from "../api/axiosInstance"; 

const RewardForm = ({ open, onClose, onSubmit, parentId }) => {
  const [formData, setFormData] = useState({
    rewardName: "",
    points: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.rewardName.trim() || !formData.points) {
      setError("Please fill in all fields");
      return;
    }
    if (isNaN(formData.points) || formData.points <= 0) {
      setError("Points must be a positive number");
      return;
    }
    try {
      setError("");
      setLoading(true);

      const response = await API.post("/rewards", {
        rewardName: formData.rewardName,
        points: Number(formData.points),
        parentId: parentId
      });

      console.log("Reward created:", response.data);

      if (onSubmit) onSubmit(response.data);

      setFormData({ rewardName: "", points: "" });
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to create reward. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Reward</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Reward Name"
            name="rewardName"
            value={formData.rewardName}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Points"
            name="points"
            value={formData.points}
            onChange={handleChange}
            fullWidth
            required
            type="number"
            inputProps={{ min: 1 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Reward"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RewardForm;