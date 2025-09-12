import React from "react";
import { Grid, Typography, Alert, Box } from "@mui/material";
import WishCard from "./WishCard";

const ParentWishes = ({ 
  wishes, 
  children, 
  onApprove, 
  onReject, 
  onAddTask 
}) => {
  const getChildById = (id) => children.find((c) => c._id === id);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        All Wishes ({wishes.length})
      </Typography>
      
      {wishes.length === 0 ? (
        <Alert severity="info">No wishes created yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {wishes.map((wish) => (
            <Grid item xs={12} sm={6} md={4} key={wish._id}>
              <WishCard
                wish={wish}
                child={getChildById(wish.childId?._id || wish.childId)}
                userRole="parent"
                onApprove={onApprove}
                onReject={onReject}
                onAddTask={onAddTask} // Pass this down to WishCard
                childrenList={children}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ParentWishes;
