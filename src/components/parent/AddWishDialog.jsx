import React, { useState, useEffect } from 'react';
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
  Box,Avatar,Slider,Chip,Alert,} from '@mui/material';
import { Redeem, Star, Edit } from '@mui/icons-material';

const WISH_CATEGORIES = [
  { name: 'Toys', color: 'primary' },
  { name: 'Books', color: 'secondary' },
  { name: 'Games', color: 'success' },
  { name: 'Clothes', color: 'warning' },
  { name: 'Electronics', color: 'info' },
  { name: 'Experiences', color: 'error' },
  { name: 'Other', color: 'default' }
];

const AddWishDialog = ({ 
  open, 
  onClose, 
  onAdd, 
  onUpdate,
  children = [], 
  editWish = null
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other',
    pointsRequired: 50,
    childId: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editWish) {
      console.log("Editing wish:", editWish);
      setFormData({
        title: editWish.title || '',
        description: editWish.description || '',
        category: editWish.category || 'Other',
        pointsRequired: editWish.pointsRequired || 50,
        childId: editWish.childId || '',
        imageUrl: editWish.imageUrl || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Other',
        pointsRequired: 50,
        childId: '',
        imageUrl: '',
      });
    }
  }, [editWish]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePointsChange = ( newValue) => {
    setFormData(prev => ({ ...prev, pointsRequired: newValue }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Wish title is required';
    }
    if (!formData.childId) {
      newErrors.childId = 'Please select a child';
    }
    if (formData.pointsRequired < 10 || formData.pointsRequired > 500) {
      newErrors.pointsRequired = 'Points must be between 10 and 500';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (editWish) {
        const updatedWish = {
          ...editWish,
          ...formData,
          updatedAt: new Date().toISOString(),
        };
        console.log("Updated wish data:", updatedWish);
        onUpdate(updatedWish);
      } else {
        const wishData = {
          ...formData,
          id: Date.now().toString(),
          status: 'available',
          createdAt: new Date().toISOString(),
        };
        console.log("New wish data:", wishData);
        onAdd(wishData);
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Other',
      pointsRequired: 50,
      childId: '',
      imageUrl: '',
    });
    setErrors({});
    onClose();
  };

  const selectedChild = children.find(child => child._id === formData.childId);
  const availablePoints = selectedChild ? selectedChild.totalPoints - selectedChild.redeemedPoints : 0;
  const canAfford = availablePoints >= formData.pointsRequired;
  const isEditMode = !!editWish;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: isEditMode ? 'warning.main' : 'secondary.main' }}>
            {isEditMode ? <Edit /> : <Redeem />}
          </Avatar>
          <Typography variant="h6">
            {isEditMode ? 'Edit Wish' : 'Create New Wish'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth error={!!errors.childId}>
            <InputLabel>Select Child</InputLabel>
            <Select
              value={formData.childId || ''}
              label="Select Child"
              onChange={handleChange('childId')}
              disabled={children.length === 0}
            >
              {children.length === 0 ? (
                <MenuItem disabled value="">
                  <em>No children available</em>
                </MenuItem>
              ) : (
                children.map((child) => (
                  <MenuItem key={child.id} value={child.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar src={child.profilePicture} sx={{ width: 24, height: 24 }}>
                        {child.name.charAt(0)}
                      </Avatar>
                      {child.name} ({child.totalPoints - child.redeemedPoints} points available)
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.childId && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.childId}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="Wish Title"
            value={formData.title}
            onChange={handleChange('title')}
            error={!!errors.title}
            helperText={errors.title}
            placeholder="e.g., New Bicycle, LEGO Set, Art Supplies"
          />

          <TextField
            fullWidth
            label="Description (optional)"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="Describe what makes this wish special..."
          />

          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={handleChange('category')}
              >
                {WISH_CATEGORIES.map((category) => (
                  <MenuItem key={category.name} value={category.name}>
                    <Chip label={category.name} color={category.color} size="small" sx={{ mr: 1 }} />
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography gutterBottom>
              Points Required: {formData.pointsRequired}
            </Typography>
            <Slider
              value={formData.pointsRequired}
              onChange={handlePointsChange}
              min={10}
              max={500}
              step={10}
              marks={[
                { value: 10, label: '10' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
                { value: 250, label: '250' },
                { value: 500, label: '500' },
              ]}
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" color="text.secondary">
              Consider the value and importance of this wish
            </Typography>
          </Box>

          {selectedChild && (
            <Box sx={{ p: 2, bgcolor: canAfford ? 'success.50' : 'warning.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Wish Preview:
              </Typography>
              <Typography variant="body2">
                <strong>{selectedChild.name}</strong> wants{' '}
                <strong>{formData.title || 'this wish'}</strong> for{' '}
                <Chip
                  size="small"
                  label={`${formData.pointsRequired} points`}
                  color="secondary"
                  icon={<Star />}
                />
              </Typography>
              
              {canAfford ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  ✅ {selectedChild.name} has enough points ({availablePoints}) to redeem this wish!
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  ⚠️ {selectedChild.name} needs {formData.pointsRequired - availablePoints} more points to redeem this wish.
                </Alert>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.title || !formData.childId}
          color={isEditMode ? 'warning' : 'secondary'}
        >
          {isEditMode ? 'Update Wish' : 'Create Wish'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddWishDialog;
