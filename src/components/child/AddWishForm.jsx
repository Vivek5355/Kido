// import React, { useState } from 'react';
// import {
//   Box,
//   Card,
//   CardContent,
//   TextField,
//   Button,
//   Typography,
//   Alert,
//   CircularProgress
// } from '@mui/material';
// import { API } from '../api/axiosInstance';

// const AddWishForm = ({ childId, onWishAdded }) => {
//   const [formData, setFormData] = useState({
//     title: '',
//     description: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     // Clear messages when user starts typing
//     if (error) setError('');
//     if (success) setSuccess('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       if (!formData.title || !formData.description ) {
//         setError('Please fill in all fields');
//         setLoading(false);
//         return;
//       }

//       if (formData.pointsRequired <= 0) {
//         setError('Points required must be greater than 0');
//         setLoading(false);
//         return;
//       }

//       // Prepare API call data
//       const wishData = {
//         title: formData.title,
//         description: formData.description,
//         childId: childId 
//       };

//       // Make API call using the configured API instance
//       const response = await API.post('/wishes', wishData);

//       // Handle success
//       setSuccess('Wish added successfully!');
//       setFormData({
//         title: '',
//         description: '',
//       });

//       // Call parent callback if provided
//       if (onWishAdded) {
//         onWishAdded(response.data);
//       }

//     } catch (err) {
//       console.error('Error adding wish:', err);
//       setError(
//         err.response?.data?.message || 
//         err.message || 
//         'Failed to add wish. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card sx={{ maxWidth: 500, margin: '20px auto' }}>
//       <CardContent>
//         <Typography variant="h5" component="h2" gutterBottom>
//           Add New Wish
//         </Typography>

//         {error && (
//           <Alert severity="error" sx={{ mb: 2 }}>
//             {error}
//           </Alert>
//         )}

//         {success && (
//           <Alert severity="success" sx={{ mb: 2 }}>
//             {success}
//           </Alert>
//         )}

//         <Box component="form" onSubmit={handleSubmit}>
//           <TextField
//             fullWidth
//             label="Wish Title"
//             name="title"
//             value={formData.title}
//             onChange={handleInputChange}
//             margin="normal"
//             required
//             placeholder="e.g., Buy a new storybook"
//             disabled={loading}
//           />

//           <TextField
//             fullWidth
//             label="Description"
//             name="description"
//             value={formData.description}
//             onChange={handleInputChange}
//             margin="normal"
//             required
//             multiline
//             rows={3}
//             placeholder="e.g., I want to buy the new Harry Potter book"
//             disabled={loading}
//           />

          

//           <Button
//             type="submit"
//             variant="contained"
//             fullWidth
//             sx={{ mt: 3 }}
//             disabled={loading}
//             startIcon={loading && <CircularProgress size={20} />}
//           >
//             {loading ? 'Adding Wish...' : 'Add Wish'}
//           </Button>
//         </Box>
//       </CardContent>
//     </Card>
//   );
// };

// export default AddWishForm;

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { API } from '../api/axiosInstance';

const AddWishForm = ({ childId, onWishAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.title || !formData.description) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Prepare API call data
      const wishData = {
        title: formData.title,
        description: formData.description,
        childId: childId 
      };

      // Make API call using the configured API instance
      const response = await API.post('/wishes', wishData);

      // Handle success
      setSuccess('Wish added successfully!');
      setFormData({
        title: '',
        description: '',
      });

      // Call parent callback if provided - pass the actual wish data
      if (onWishAdded) {
        // Adjust this based on your API response structure
        const newWish = response.data.data || response.data;
        onWishAdded(newWish);
      }

    } catch (err) {
      console.error('Error adding wish:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to add wish. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 500, margin: '20px auto' }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Add New Wish
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

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
            {loading ? 'Adding Wish...' : 'Add Wish'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddWishForm;