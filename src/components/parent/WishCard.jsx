import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Box,
  CardMedia,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Redeem,
  Star,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

const WishCard = ({ 
  wish, 
  child, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject, 
  onRequestRedemption, 
  userRole 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const availablePoints = child ? (child.totalPoints - child.redeemedPoints) : 0;
  const canAfford = availablePoints >= wish.pointsRequired;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'available':
        return { color: 'primary', label: 'Available', icon: <Star /> };
      case 'pending_approval':
        return { color: 'warning', label: 'Pending Approval', icon: <Star /> };
      case 'redeemed':
        return { color: 'success', label: 'Redeemed', icon: <CheckCircle /> };
      case 'rejected':
        return { color: 'error', label: 'Rejected', icon: <Cancel /> };
      default:
        return { color: 'default', label: 'Unknown', icon: <Star /> };
    }
  };

  const statusConfig = getStatusConfig(wish.status);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(wish);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${wish.title}"?`)) {
      onDelete(wish.id);
    }
    handleMenuClose();
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {wish.imageUrl && (
          <CardMedia
            component="img"
            height="140"
            image={wish.imageUrl}
            alt={wish.title}
          />
        )}

        <CardHeader
          avatar={
            <Avatar src={child?.profilePicture} sx={{ bgcolor: 'secondary.main' }}>
              {child?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          }
          action={
            <IconButton onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
          }
          title={
            <Typography variant="h6" fontWeight="bold">
              {wish.title}
            </Typography>
          }
          subheader={`For: ${child?.name}`}
        />
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Stack spacing={2}>
            {wish.description && (
              <Typography variant="body2" color="text.secondary">
                {wish.description}
              </Typography>
            )}
            
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip 
                label={statusConfig.label}
                color={statusConfig.color}
                icon={statusConfig.icon}
                size="small"
              />
              <Chip 
                label={`${wish.pointsRequired} points`}
                color="secondary"
                size="small"
              />
              {wish.category && (
                <Chip 
                  label={wish.category}
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>

            {child && (
              <Box sx={{ p: 1, bgcolor: canAfford ? 'success.50' : 'warning.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Available Points: {availablePoints} / {wish.pointsRequired}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
        
        <CardActions>
          {userRole === 'parent' && wish.status === 'pending_approval' && (
            <>
              <Button 
                size="small" 
                startIcon={<CheckCircle />}
                onClick={() => onApprove(wish.id)}
                color="success"
                variant="contained"
              >
                Approve
              </Button>
              <Button 
                size="small" 
                startIcon={<Cancel />}
                onClick={() => onReject(wish.id)}
                color="error"
                variant="outlined"
              >
                Reject
              </Button>
            </>
          )}

          {userRole === 'child' && wish.status === 'available' && canAfford && (
            <Button 
              size="small" 
              startIcon={<Redeem />}
              onClick={() => onRequestRedemption(wish.id)}
              color="secondary"
              variant="contained"
              fullWidth
            >
              Request Redemption
            </Button>
          )}

          {wish.status === 'redeemed' && (
            <Chip 
              label="✅ Redeemed!" 
              color="success" 
              size="small"
            />
          )}
        </CardActions>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default WishCard;
