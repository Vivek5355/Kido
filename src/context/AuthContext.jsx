
import { createContext, useContext, useState, useEffect } from "react";

// Create the AuthContext
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

const safeParse = (value, defaultValue = null) => {
  if (!value || value === "undefined" || value === "null") return defaultValue;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, load user and role from localStorage
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("kiddoUser"));
    const savedRole = localStorage.getItem("kiddoUserRole");
    setUser(savedUser?.user);
    setUserRole(savedRole && savedRole !== "undefined" ? savedRole : null);
    setLoading(false);
  }, []);

  // Login function: save user and role to state and localStorage
  const login = (userData, role) => {
    setUser(userData);
    setUserRole(role);
    if (userData) localStorage.setItem("kiddoUser", JSON.stringify(userData));
    if (userData?.token) localStorage.setItem("token", userData.token);
    if (role) localStorage.setItem("kiddoUserRole", role);
    // console.lo
  };

  // Logout function: clear user and role from state and localStorage
  const logout = () => {
    setUser(null);
    setUserRole(null);
    ["kiddoUser", "token", "kiddoUserRole"].forEach((key) => localStorage.removeItem(key));
  };

  // Switch user role
  const switchRole = (role) => {
    setUserRole(role);
    localStorage.setItem("kiddoUserRole", role);
  };

  // Context value
  const value = {
    user,
    userRole,
    loading,
    isAuthenticated: Boolean(user),
    isParent: userRole === "parent",
    isChild: userRole === "child",
    login,
    logout,
    switchRole,
  };

  // Optionally, show a loading indicator while loading
  if (loading) return null;

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
