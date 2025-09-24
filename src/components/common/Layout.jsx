import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tabs,
  Tab,
  Badge,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import { Logout } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Layout = ({
  children,
  activeTab,
  setActiveTab,
  pendingApprovals = 0,
  isParent,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const parentTabs = [
    { label: "My Children", value: 0 },
    { label: "All Tasks", value: 1 },
    { label: "All Wishes", value: 2 },
    { label: "Rewards", value: 3 },
    {
      label: (
        <Box display="flex" alignItems="center" gap={1}>
          Approvals
          {pendingApprovals > 0 && (
            <Badge badgeContent={pendingApprovals} color="error" />
          )}
        </Box>
      ),
      value: 4,
    },];
  const childTabs = [
    { label: "My Tasks", value: 0 },
    { label: "My Wishes", value: 1 },
    { label: "Achievements", value: 2 },
    { label: "Rewards", value: 3},
  ];
  const currentTabs = isParent ? parentTabs : childTabs;

  const parentSegments = ["children", "tasks", "wishes","rewards" ,"approvals",];
  const childSegments = ["tasks", "wishes", "achievements","rewards",];
  const basePath = isParent ? "/dashboard/parent" : "/dashboard/child";

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    const segment = isParent ? parentSegments[newValue] : childSegments[newValue];
    navigate(`${basePath}/${segment}`, { replace: false });
  };

  useEffect(() => {
    const pathname = location.pathname || "";
    if (!pathname.startsWith(basePath)) return;
    const afterBase = pathname.slice(basePath.length + 1); 
    const segment = afterBase.split("/")[0] || "";
    const segments = isParent ? parentSegments : childSegments;
    const idx = segments.indexOf(segment);
    if (idx >= 0 && idx !== activeTab) {
      setActiveTab(idx);
    }
  }, [location.pathname, isParent]);
  const handleLogout = () => {
    logout();
    navigate("/");
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
            <Tooltip title="Log out">
              <IconButton onClick={handleLogout} color="inherit">
                <Logout />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Box component="main">{children}</Box>
      </Box>
  );
};

export default Layout;
