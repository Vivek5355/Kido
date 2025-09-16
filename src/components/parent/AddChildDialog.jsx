import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  Typography,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';

const AddChildDialog = ({
  open,
  onClose,
  onAdd,
  onUpdate,
  editChild = null,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    password: '',
    gender: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (editChild) {
      setFormData({
        name: editChild.name || '',
        email: editChild.email || '',
        age: editChild.age || '',
        password: '',
        gender: editChild.gender || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        age: '',
        password: '',
        gender: '',
      });
    }
  }, [editChild]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    // Only validate email and gender when adding a new child
    if (!editChild) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!formData.gender) newErrors.gender = 'Gender is required';
    }
    
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age < 3 || formData.age > 18) {
      newErrors.age = 'Age must be between 3 and 18';
    }
    
    if (!editChild && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (editChild) {
        // Only update name and age when editing
        onUpdate({ 
          ...editChild, 
          name: formData.name, 
          age: formData.age 
        });
      } else {
        onAdd(formData);
      }
      handleClose();
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      age: '',
      password: '',
      gender: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: editChild ? 'warning.main' : 'primary.main' }}>
            <PersonAdd />
          </Avatar>
          <Typography variant="h6">
            {editChild ? 'Edit Child' : 'Add New Child'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          
          {/* Only show email field when adding a new child */}
          {!editChild && (
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
          )}
          
          <Box display="flex" gap={2}>
            <TextField
              margin="normal"
              required
              id="age"
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              error={!!errors.age}
              helperText={errors.age}
              inputProps={{ min: 3, max: 18 }}
              sx={{ width: 120 }}
            />
            
            {/* Only show gender field when adding a new child */}
            {!editChild && (
              <FormControl 
                margin="normal" 
                required 
                error={!!errors.gender}
                sx={{ minWidth: 120, flexGrow: 1 }}
              >
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formData.gender || ''}
                  label="Gender"
                  onChange={handleChange}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.gender && (
                  <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                    {errors.gender}
                  </Typography>
                )}
              </FormControl>
            )}
          </Box>
          
          {/* Only show password field when adding a new child */}
          {!editChild && (
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            editChild 
              ? !formData.name || !formData.age
              : !formData.name || !formData.email || !formData.age || !formData.gender
          }
        >
          {editChild ? 'Update Child' : 'Add Child'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddChildDialog;