import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API } from "../components/api/axiosInstance";

const ROLES = {
  PARENT: "parent",
  CHILD: "child",
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: ROLES.PARENT,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        role: formData.role, 
      });
      const userData = response.data;
      login(userData, userData?.user?.role);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }

    console.log("Form submitted", formData)
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" component="h1" gutterBottom>
              🌟 Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your Kiddo Rewards account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                placeholder="parent@example.com"
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange("password")}
                placeholder="Your password"
              />

              <FormControl fullWidth>
                <InputLabel>I am a</InputLabel>
                <Select
                  value={formData.role}
                  label="I am a"
                  onChange={handleChange("role")}
                >
                  <MenuItem value={ROLES.PARENT}>Parent</MenuItem>
                  <MenuItem value={ROLES.CHILD}>Child</MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{ py: 1.5 }}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box textAlign="center">
            <Typography variant="body2">
              Don't have an account?{" "}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/register")}
              >
                Sign up here
              </Link>
            </Typography>
          </Box>

          <Box textAlign="center" mt={2}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;