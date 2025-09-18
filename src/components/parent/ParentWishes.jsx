import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Alert,
  Box,
  TextField,
  Autocomplete,
  Pagination,
  Stack,
  Button,
} from "@mui/material";
import WishCard from "./WishCard";

const ParentWishes = ({ wishes, children, onApprove, onReject, onAddTask }) => {
  const [selectedChildId, setSelectedChildId] = useState("");
  const [wishPage, setWishPage] = useState(1);
  const wishesPerPage = 5;

  const getChildById = (id) => children.find((c) => c._id === id);
  const filteredWishes = selectedChildId
    ? wishes.filter(
        (w) =>
          w.childId === selectedChildId || w.childId?._id === selectedChildId
      )
    : wishes;

  const paginatedWishes = filteredWishes.slice(
    (wishPage - 1) * wishesPerPage,
    wishPage * wishesPerPage
  );

  useEffect(() => {
    setWishPage(1);
  }, [selectedChildId]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        All Wishes ({filteredWishes.length}
        {selectedChildId ? ` for ${getChildById(selectedChildId)?.name}` : ""})
      </Typography>

      {children.length > 0 && (
        <Box sx={{ mb: 3, maxWidth: 300 }}>
          <Autocomplete
            size="small"
            options={[{ _id: "", name: "All Children" }, ...children]}
            getOptionLabel={(child) => child.name}
            value={
              children.find((child) => child._id === selectedChildId) ||
              (selectedChildId === "" ? { _id: "", name: "All Children" } : null)
            }
            onChange={(event, newValue) => {
              setSelectedChildId(newValue ? newValue._id : "");
            }}
            renderInput={(params) => (
              <TextField {...params} label="Filter by Child" variant="outlined" />
            )}
            clearOnEscape
          />
        </Box>
      )}

      {filteredWishes.length === 0 ? (
        <Alert severity="info">
          {selectedChildId
            ? `No wishes for ${getChildById(selectedChildId)?.name}.`
            : "No wishes created yet."}
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedWishes.map((wish) => (
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
          <Stack alignItems="center" sx={{ mt: 2, gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            
              <Pagination
                count={Math.ceil(filteredWishes.length / wishesPerPage)}
                page={wishPage}
                onChange={(e, page) => setWishPage(page)}
                color="primary"
                size="small"
              />
              
            </Box>
          </Stack>
        </>
      )}
    </Box>
  );
};

export default ParentWishes;
