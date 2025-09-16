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
      console.log("Login response:", userData);

      // Store user data in localStorage for components to access
      if (userData.user) {
        localStorage.setItem("kiddoUser", JSON.stringify(userData.user));
      }
      if (userData.token) {
        localStorage.setItem("token", userData.token);
      }

      // Call AuthContext login
      login(userData, userData?.user?.role);
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            🌟 Welcome Back
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to your Kiddo Rewards account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Stack spacing={2}>
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

              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange("email")}
              />

              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange("password")}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }}>OR</Divider>

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
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/")}
                sx={{ mt: 1, display: "block" }}
              >
                Back to Home
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
