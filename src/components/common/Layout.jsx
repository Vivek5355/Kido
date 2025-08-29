import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Badge,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Logout,
  Dashboard,
  ChildCare,
  SwapHoriz,
  PersonOutline,
  EmailOutlined,
  BadgeOutlined,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Layout = ({
  children,
  activeTab,
  setActiveTab,
  pendingApprovals = 0,
  isParent,
}) => {
  const { user, logout, switchRole } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const parentTabs = [
    { label: "My Children", value: 0 },
    { label: "All Tasks", value: 1 },
    { label: "All Wishes", value: 2 },
    {
      label: (
        <Box display="flex" alignItems="center" gap={1}>
          Approvals
          {pendingApprovals > 0 && (
            <Badge badgeContent={pendingApprovals} color="error" />
          )}
        </Box>
      ),
      value: 3,
    },
  ];

  const childTabs = [
    { label: "My Tasks", value: 0 },
    { label: "My Wishes", value: 1 },
    { label: "Achievements", value: 2 },
  ];

  const currentTabs = isParent ? parentTabs : childTabs;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSwitchRole = () => {
    switchRole(isParent ? "child" : "parent");
    setActiveTab(0); // Reset to first tab when switching roles
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    handleMenuClose();
  };

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: "#6366f1" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🌟 Kiddo Rewards
          </Typography>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: "#fff" } }}
            sx={{
              "& .MuiTab-root": {
                color: "rgba(255,255,255,0.7)",
                fontWeight: "bold",
                "&.Mui-selected": { color: "#fff" },
              },
            }}
          >
            {currentTabs.map((tab, i) => (
              <Tab
                key={i}
                label={tab.label}
                value={tab.value}
                sx={
                  tab.value === 3 && pendingApprovals > 0
                    ? { color: "#ffeb3b", fontWeight: "bold" }
                    : {}
                }
              />
            ))}
          </Tabs>



           <Stack direction="row" spacing={4} alignItems="center" sx={{ mr: 5 }}>
            <Chip
              label={isParent ? "Parent" : "Child"}
              variant="outlined"
              size="small"
              sx={{
                color: "white",
                borderColor: "rgba(239, 177, 177, 0.5)",
                "& .MuiChip-icon": { color: "white" },
                fontWeight: "bold",
              }}
            />
           
          </Stack>

          {/* User Menu */}

          <Tooltip title="Log out">
            <IconButton onClick={handleLogout}>
              <Avatar>
                <Box display="flex" alignItems="center" gap={1}>
                  <ListItemIcon>
                    <Logout />
                  </ListItemIcon>
                </Box>
              </Avatar>
            </IconButton>
          </Tooltip>
          
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main">{children}</Box>
    </Box>
  );
};

export default Layout;
