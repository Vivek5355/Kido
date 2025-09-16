// import React, { useState } from "react";
// import {
//   Card,
//   CardHeader,
//   CardContent,
//   Avatar,
//   Typography,
//   Chip,
//   Stack,
//   IconButton,
//   Menu,
//   MenuItem,
// } from "@mui/material";
// import { MoreVert, Edit, Delete, TrendingUp } from "@mui/icons-material";

// const ChildCard = ({ child, onEdit, onDelete }) => {
//   const [anchorEl, setAnchorEl] = useState(null);

//   const availablePoints =
//     (child?.totalPoints || 0) - (child?.redeemedPoints || 0);

//   const handleMenuClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleEdit = () => {
//     onEdit(child);
//     handleMenuClose();
//   };

//   const handleDelete = () => {
//     if (
//       window.confirm(`Are you sure you want to delete ${child.name}'s profile?`)
//     ) {
//       onDelete(child._id);
//     }
//     handleMenuClose();
//   };

//   console.log("child :: ", child);
//   return (
//     <>
//       <Card
//         sx={{ height: "100%", display: "flex", flexDirection: "column" }}
//         key={child._id}
//       >
//         <CardHeader
//           avatar={
//             <Avatar
//               src={child?.profilePicture}
//               sx={{ bgcolor: "primary.main", width: 56, height: 56 }}
//             >
//               {child?.name?.charAt(0)?.toUpperCase()}
//             </Avatar>
//           }
//           action={
//             <IconButton onClick={handleMenuClick}>
//               <MoreVert />
//             </IconButton>
//           }
//           title={
//             <Typography variant="h6" fontWeight="bold">
//               {child?.name}
//             </Typography>
//           }
//           subheader={`Age: ${child?.age} years`}
//         />

//         <CardContent sx={{ flexGrow: 1 }}>
//           <Stack spacing={2}>
//             <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
//               <Chip
//                 label={`${availablePoints} points`}
//                 color="primary"
//                 size="small"
//                 icon={<TrendingUp />}
//               />
//               <Chip
//                 label={`${child?.totalPoints || 0} earned`}
//                 color="success"
//                 size="small"
//               />
              
//             </Stack>
//           </Stack>
//         </CardContent>
//       </Card>

//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleMenuClose}
//       >
//         <MenuItem onClick={handleEdit}>
//           <Edit sx={{ mr: 1 }} />
//           Edit
//         </MenuItem>
//         <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
//           <Delete sx={{ mr: 1 }} />
//           Delete
//         </MenuItem>
//       </Menu>
//     </>
//   );
// };

// export default ChildCard;


import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  Chip,
  Stack,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { MoreVert, Edit, Delete, TrendingUp } from "@mui/icons-material";

const ChildCard = ({ child, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const availablePoints =
    (child?.totalPoints || 0) - (child?.redeemedPoints || 0);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(child);
    handleMenuClose();
  };

  /*  NEW : await the server call before closing the menu  */
  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${child.name}'s profile?`
    );
    if (confirmed) {
      await onDelete(child._id);
    }
    handleMenuClose();
  };

  return (
    <>
      <Card
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        key={child._id}
      >
        <CardHeader
          avatar={
            <Avatar
              src={child?.profilePicture}
              sx={{ bgcolor: "primary.main", width: 56, height: 56 }}
            >
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
              {child?.name}
            </Typography>
          }
          subheader={`Age: ${child?.age} years`}
        />

        <CardContent sx={{ flexGrow: 1 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={`${availablePoints} points`}
                color="primary"
                size="small"
                icon={<TrendingUp />}
              />
              <Chip
                label={`${child?.totalPoints || 0} earned`}
                color="success"
                size="small"
              />
            </Stack>
          </Stack>
        </CardContent>
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
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default ChildCard;