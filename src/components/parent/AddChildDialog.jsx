import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { API } from "../api/axiosInstance";

const AddChildDialog = ({ open, handleClose, onAdd, onUpdate, editChild }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    if (editChild) {
      setFormData({
        name: editChild.name || "",
        email: editChild.email || "",
        age: editChild.age || "",
        password: "", 
      });
    } else {
      setFormData({ name: "", email: "", age: "", password: "" });
    }
  }, [editChild]);

  const validateForm = () => {
    if (!formData.name || !formData.age || (!editChild && !formData.password)) {
      setAlert({ type: "error", message: "Please fill all required fields!" });
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setAlert({ type: "", message: "" });

      if (editChild) {
        const response = await API.put(`/children/${editChild._id}`, {
          name: formData.name,
          age: Number(formData.age),
          email: editChild.email, 
        });

        if (onUpdate) {
          onUpdate(response.data.child || response.data);
        }

        setAlert({ type: "success", message: "Child updated successfully!" });
      } else {
        const response = await API.post("/children", {
          name: formData.name,
          email: formData.email,
          age: Number(formData.age),
          password: formData.password,
        }
      );
        //console.log("Response from adding child:", response.data);
        if (onAdd) {
          onAdd(response.data.child || response.data);
        }

        setAlert({ type: "success", message: "Child added successfully!" });
      }

      handleClose();
    } catch (error) {
      console.error("❌ API Error:", error.response?.data || error);
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{editChild ? "Edit Child" : "Add Child"}</DialogTitle>
      <DialogContent>
        
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />
          {!editChild && (
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
          )}
          <TextField
            label="Age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            fullWidth
            required
          />
          {!editChild && (
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          color="primary"
        >
          {loading ? <CircularProgress size={20} /> : editChild ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddChildDialog;