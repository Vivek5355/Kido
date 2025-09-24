import { createContext, useContext, useState, useEffect } from "react";
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
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const savedRaw = safeParse(localStorage.getItem("kiddoUser"), null);
    const savedRole = localStorage.getItem("kiddoUserRole");
    const normalized = savedRaw
      ? savedRaw.user
        ? savedRaw
        : { user: savedRaw }
      : null;
    setUser(normalized);
    setUserRole(savedRole && savedRole !== "undefined" ? savedRole : null);
    setLoading(false);
  }, []);
  const updateUserPoints = (newPoints) => {
    if (user?.user) {
      const updatedUser = {
        ...user,
        user: {
          ...user.user,
          points: newPoints,
        },
      };
      setUser(updatedUser);
      localStorage.setItem("kiddoUser", JSON.stringify(updatedUser));
    }
  };
  const login = (userData, role) => {
    const normalized = userData ? { user: userData } : null;
    setUser(normalized);
    setUserRole(role);
    if (normalized)
      localStorage.setItem("kiddoUser", JSON.stringify(normalized));
    if (userData?.token) localStorage.setItem("token", userData.token);
    if (role) localStorage.setItem("kiddoUserRole", role);
  };
  const logout = () => {
    setUser(null);
    setUserRole(null);
    ["kiddoUser", "token", "kiddoUserRole"].forEach((key) =>
      localStorage.removeItem(key)
    );
  };
  const switchRole = (role) => {
    setUserRole(role);
    localStorage.setItem("kiddoUserRole", role);
  };
  const value = {
    user,
    userRole,
    loading,
    isAuthenticated: Boolean(user?.user),
    isParent: userRole === "parent",
    isChild: userRole === "child",
    login,
    logout,
    switchRole,
    updateUserPoints,
  };
  if (loading) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
