import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { API } from "../api/axiosInstance";

const AddWishForm = ({ childId, onWishAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title || !formData.description) {
        setToast({
          open: true,
          message: "Please fill in all fields",
          severity: "error",
        });
        setLoading(false);
        return;
      }

      const wishData = {
        title: formData.title,
        description: formData.description,
        childId: childId,
      };

      const response = await API.post("/wishes", wishData);

      // ✅ Show success toast
      setToast({
        open: true,
        message: "Wish added successfully!",
        severity: "success",
      });

      setFormData({ title: "", description: "" });

      // ✅ Call parent callback
      if (onWishAdded) {
        const newWish = response.data.data || response.data;
        onWishAdded(newWish);
      }

      // ✅ Auto close dialog after short delay
      setTimeout(() => {
        if (onCancel) onCancel();
      }, 500);
    } catch (err) {
      console.error("Error adding wish:", err);
      setToast({
        open: true,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to add wish. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 500, margin: "20px auto" }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Add New Wish
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Wish Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              margin="normal"
              required
              placeholder="e.g., Buy a new storybook"
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              required
              multiline
              rows={3}
              placeholder="e.g., I want to buy the new Harry Potter book"
              disabled={loading}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? "Adding Wish..." : "Add Wish"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000} // ⬅️ Now closes after 3 seconds
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddWishForm;
