import React, { useState } from "react";
import {
  Grid,
  Typography,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import WishCard from "./WishCard";

const ParentWishes = ({ wishes, children, onApprove, onReject, onAddTask }) => {
  const [selectedChildId, setSelectedChildId] = useState("");

  const getChildById = (id) => children.find((c) => c._id === id);

  const filteredWishes = selectedChildId
    ? wishes.filter(
        (w) =>
          w.childId === selectedChildId || w.childId?._id === selectedChildId
      )
    : wishes;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        All Wishes ({filteredWishes.length}
        {selectedChildId ? ` for ${getChildById(selectedChildId)?.name}` : ""})
      </Typography>

      {children.length > 0 && (
        <Box sx={{ mb: 3, maxWidth: 300 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="select-child-label">Filter by Child</InputLabel>
            <Select
              labelId="select-child-label"
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
            >
              <MenuItem value="">
                <em>All Children</em>
              </MenuItem>
              {children.map((child) => (
                <MenuItem key={child._id} value={child._id}>
                  {child.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {filteredWishes.length === 0 ? (
        <Alert severity="info">
          {selectedChildId
            ? `No wishes for ${getChildById(selectedChildId)?.name}.`
            : "No wishes created yet."}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredWishes.map((wish) => (
            <Grid item xs={12} sm={6} md={4} key={wish._id}>
              <WishCard
                wish={wish}
                child={getChildById(wish.childId?._id || wish.childId)}
                userRole="parent"
                onApprove={onApprove}
                onReject={onReject}
                onAddTask={onAddTask}
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
