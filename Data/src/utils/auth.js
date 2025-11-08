// Simple mock authentication using localStorage
// This will be replaced with Firebase Auth later

export const mockAuth = {
  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Set current user in localStorage
  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      // Trigger custom event for same-tab updates
      window.dispatchEvent(new Event('authStateChange'));
    } else {
      localStorage.removeItem('currentUser');
      // Trigger custom event for same-tab updates
      window.dispatchEvent(new Event('authStateChange'));
    }
  },

  // Login function (synchronous - just localStorage)
  login: (email, password) => {
    // Mock login - check if admin
    if (email === 'datascience1424@gmail.com' && password === 'Science@1424') {
      const user = {
        uid: 'admin-123',
        email: email,
        displayName: 'Admin User',
        isAdmin: true,
      };
      mockAuth.setCurrentUser(user);
      return user;
    }
    
    // Mock student login - accept any email/password for now
    // In production, you would validate against a database
    if (email && password) {
      const user = {
        uid: `user-${Date.now()}`,
        email: email,
        displayName: email.split('@')[0],
        isAdmin: false,
      };
      mockAuth.setCurrentUser(user);
      return user;
    }
    
    return null;
  },

  // Signup function (synchronous - just localStorage)
  signup: (name, email, password) => {
    const user = {
      uid: `user-${Date.now()}`,
      email: email,
      displayName: name,
      isAdmin: false,
    };
    mockAuth.setCurrentUser(user);
    return user;
  },

  // Logout function
  logout: () => {
    localStorage.removeItem('currentUser');
  },

  // Check if user is admin
  isAdmin: (user) => {
    return user?.email === 'datascience1424@gmail.com' || user?.isAdmin === true;
  },
};

// Listen to auth state changes (mock)
export const onAuthStateChanged = (callback) => {
  // Check immediately
  const user = mockAuth.getCurrentUser();
  callback(user);

  // Listen to storage changes (for logout/login from other tabs and same tab)
  const handleStorageChange = (e) => {
    // Check if it's a currentUser change or a custom storage event
    if (!e.key || e.key === 'currentUser') {
      const user = mockAuth.getCurrentUser();
      callback(user);
    }
  };

  // Listen to storage events (for cross-tab updates)
  window.addEventListener('storage', handleStorageChange);
  
  // Also listen to custom storage events (for same-tab updates)
  // We'll use a different event name to avoid conflicts
  const handleCustomStorage = () => {
    const user = mockAuth.getCurrentUser();
    callback(user);
  };
  window.addEventListener('authStateChange', handleCustomStorage);

  // Return unsubscribe function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('authStateChange', handleCustomStorage);
  };
};
