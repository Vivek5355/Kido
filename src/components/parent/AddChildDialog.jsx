

// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   Box,
//   Alert,
// } from "@mui/material";
// import { API } from "../api/axiosInstance";

// const AddChildDialog = ({ open, onClose, onAdd, onUpdate, editChild }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     age: "",
//     interests: "",
//     email: "",
//     password: "",
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [serverError, setServerError] = useState("");

//   /* ----------------------------------------------------------
//      Reset form every time the dialog opens
//   ---------------------------------------------------------- */
//   useEffect(() => {
//     if (open) {
//       setServerError("");
//       if (editChild) {
//         setFormData({
//           name: editChild.name || "",
//           age: editChild.age || "",
//           interests: editChild.interests?.join(", ") || "",
//           email: "",           // <- not used in edit mode
//           password: "",        // <- not used in edit mode
//         });
//       } else {
//         setFormData({
//           name: "",
//           age: "",
//           interests: "",
//           email: "",
//           password: "",
//         });
//       }
//     }
//   }, [editChild, open]);

//   /* ----------------------------------------------------------
//      Validation
//   ---------------------------------------------------------- */
//   const validateForm = () => {
//     let newErrors = {};

//     if (!formData.name.trim()) newErrors.name = "Name is required";

//     if (!formData.age) {
//       newErrors.age = "Age is required";
//     } else if (isNaN(formData.age) || formData.age <= 0 || formData.age > 18) {
//       newErrors.age = "Enter a valid age (1-18)";
//     }

//     if (!formData.interests.trim())
//       newErrors.interests = "Interests are required";

//     // Validate email/password only when creating
//     if (!editChild) {
//       if (!formData.email.trim()) newErrors.email = "Email is required";
//       else if (!/\S+@\S+\.\S+/.test(formData.email))
//         newErrors.email = "Email is invalid";

//       if (!formData.password) newErrors.password = "Password is required";
//       else if (formData.password.length < 6)
//         newErrors.password = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   /* ----------------------------------------------------------
//      Field change handler
//   ---------------------------------------------------------- */
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     if (errors[e.target.name]) {
//       setErrors({ ...errors, [e.target.name]: "" });
//     }
//     if (serverError) setServerError("");
//   };

//   /* ----------------------------------------------------------
//      Submit handler
//   ---------------------------------------------------------- */
//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     setLoading(true);
//     setServerError("");

//     const payload = {
//       name: formData.name.trim(),
//       age: parseInt(formData.age, 10),
//       interests: formData.interests
//         .split(",")
//         .map((i) => i.trim())
//         .filter((i) => i.length > 0),
//     };

//     // Only attach email/password when creating
//     if (!editChild) {
//       payload.email = formData.email.trim();
//       payload.password = formData.password;
//     }

//     try {
//       let response;
//       if (editChild) {
//         // EDIT MODE
//         response = await API.put(`/children/${editChild._id}`, payload);
//         onUpdate(response.data);
//       } else {
//         // CREATE MODE
//         response = await API.post("/children", payload);
//         onAdd(response.data);
//       }
//       onClose();
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message ||
//         err.response?.data?.error ||
//         "Failed to save child. Please try again.";
//       setServerError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ----------------------------------------------------------
//      Render
//   ---------------------------------------------------------- */
//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle>{editChild ? "Edit Child" : "Add New Child"}</DialogTitle>
//       <DialogContent>
//         <Box display="flex" flexDirection="column" gap={2} mt={1}>
//           {serverError && (
//             <Alert severity="error" sx={{ mb: 2 }}>
//               {serverError}
//             </Alert>
//           )}

//           <TextField
//             label="Name"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             error={!!errors.name}
//             helperText={errors.name}
//             disabled={loading}
//             fullWidth
//           />
//           <TextField
//             label="Age"
//             name="age"
//             type="number"
//             value={formData.age}
//             onChange={handleChange}
//             error={!!errors.age}
//             helperText={errors.age}
//             disabled={loading}
//             fullWidth
//             inputProps={{ min: 1, max: 18 }}
//           />
//           <TextField
//             label="Interests (comma separated)"
//             name="interests"
//             value={formData.interests}
//             onChange={handleChange}
//             error={!!errors.interests}
//             helperText={errors.interests || "e.g. Reading, Sports, Music"}
//             disabled={loading}
//             fullWidth
//           />

//           {/* Only show email/password when creating */}
//           {!editChild && (
//             <>
//               <TextField
//                 label="Email"
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 error={!!errors.email}
//                 helperText={errors.email}
//                 disabled={loading}
//                 fullWidth
//               />
//               <TextField
//                 label="Password"
//                 name="password"
//                 type="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 error={!!errors.password}
//                 helperText={errors.password}
//                 disabled={loading}
//                 fullWidth
//               />
//             </>
//           )}
//         </Box>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} color="secondary" disabled={loading}>
//           Cancel
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           variant="contained"
//           color="primary"
//           disabled={loading}
//         >
//           {loading ? "Saving..." : editChild ? "Update" : "Add"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default AddChildDialog;


import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from "@mui/material";
import { API } from "../api/axiosInstance";

const AddChildDialog = ({ open, onClose, onAdd, onUpdate, editChild }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    interests: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (open) {
      setServerError("");
      setErrors({});
      if (editChild) {
        setFormData({
          name: editChild.name || "",
          age: editChild.age || "",
          interests: editChild.interests?.join(", ") || "",
          email: editChild.email || "", // Include email for editing
          password: "", // Keep password empty for editing
        });
      } else {
        setFormData({
          name: "",
          age: "",
          interests: "",
          email: "",
          password: "",
        });
      }
    }
  }, [editChild, open]);

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (isNaN(formData.age) || formData.age <= 0 || formData.age > 18) {
      newErrors.age = "Enter a valid age (1-18)";
    }
    if (!formData.interests.trim())
      newErrors.interests = "Interests are required";

    // Always validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Only validate password for new children
    if (!editChild) {
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
    if (serverError) setServerError("");
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      const payload = {
        name: formData.name.trim(),
        age: parseInt(formData.age, 10),
        interests: formData.interests
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i.length > 0),
        email: formData.email.trim(), 
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      console.log("Sending payload:", payload);

      let response;
      if (editChild) {
        response = await API.put(`/children/${editChild._id}`, payload);
        onUpdate(response.data);
      } else {
        response = await API.post("/children", payload);
        onAdd(response.data);
      }
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save child. Please try again.";
      setServerError(errorMessage);
      
      // More detailed error logging
      if (err.response) {
        console.error("Server response:", err.response);
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editChild ? "Edit Child" : "Add New Child"}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
            fullWidth
          />
          <TextField
            label="Age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            error={!!errors.age}
            helperText={errors.age}
            disabled={loading}
            fullWidth
            inputProps={{ min: 1, max: 18 }}
          />
          <TextField
            label="Interests (comma separated)"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            error={!!errors.interests}
            helperText={errors.interests || "e.g. Reading, Sports, Music"}
            disabled={loading}
            fullWidth
          />
          
          {/* Always show email field */}
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
            fullWidth
          />
          
          {/* Show password field for new children or as optional for editing */}
          {!editChild ? (
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              fullWidth
            />
          ) : (
            <TextField
              label="New Password (leave blank to keep current)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              helperText="Enter a new password only if you want to change it"
              disabled={loading}
              fullWidth
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? "Saving..." : editChild ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddChildDialog;