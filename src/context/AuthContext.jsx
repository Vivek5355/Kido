// import  { createContext, useContext, useState, useEffect } from 'react';
// const AuthContext = createContext();
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [userRole, setUserRole] = useState(null);
//   useEffect(() => {
//     const savedUser = localStorage.getItem('kiddoUser');
//     const savedRole = localStorage.getItem('kiddoUserRole');
//     if (savedUser && savedRole) {
//       setUser(JSON.parse(savedUser));
//       setUserRole(savedRole);
//     }
//     setLoading(false);
//   }, []);
//   const login = (userData, role) => {
//     setUser(userData);
//     setUserRole(role);
//     localStorage.setItem('kiddoUser', JSON.stringify(userData?.user));
//     localStorage.setItem('token',userData?.token)
//     localStorage.setItem('kiddoUserRole', role);
//   };
//   const logout = () => {
//     setUser(null);
//     setUserRole(null);
//     localStorage.removeItem('kiddoUser');
//     localStorage.removeItem('token');
//     localStorage.removeItem('kiddoUserRole');
//   };
//   const switchRole = (role) => {
//     setUserRole(role);
//     localStorage.setItem('kiddoUserRole', role);
//   };
//   const value = {
//     user,
//     userRole,
//     loading,
//     isAuthenticated: !!user,
//     isParent: userRole === 'parent',
//     isChild: userRole === 'child',
//     login,
//     logout,
//     switchRole,
//   };
//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading]   = useState(true);

  /* safe JSON helper */
  const safeParse = (value, def = null) => {
    try {
      if (!value || value === 'undefined' || value === 'null') return def;
      return JSON.parse(value);
    } catch {
      localStorage.removeItem(value);
      return def;
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('kiddoUser');
    const savedRole = localStorage.getItem('kiddoUserRole');

    setUser(safeParse(savedUser));
    setUserRole(savedRole && savedRole !== 'undefined' ? savedRole : null);
    setLoading(false);
  }, []);

  const login = (userData, role) => {
    setUser(userData);
    setUserRole(role);
    if (userData) localStorage.setItem('kiddoUser', JSON.stringify(userData));
    if (userData?.token) localStorage.setItem('token', userData.token);
    if (role) localStorage.setItem('kiddoUserRole', role);
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    ['kiddoUser', 'token', 'kiddoUserRole'].forEach(k => localStorage.removeItem(k));
  };

  const switchRole = role => {
    setUserRole(role);
    localStorage.setItem('kiddoUserRole', role);
  };

  const value = {
    user,
    userRole,
    loading,
    isAuthenticated: !!user,
    isParent: userRole === 'parent',
    isChild:  userRole === 'child',
    login,
    logout,
    switchRole,
  };

  return loading ? null : <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};