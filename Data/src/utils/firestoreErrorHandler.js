// Utility to handle Firestore errors gracefully
// Suppresses errors if Firestore is not configured

export const safeFirestoreOperation = async (operation, defaultValue = null) => {
  try {
    return await operation();
  } catch (error) {
    // Suppress Firestore errors if not configured
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Firestore operation skipped (not configured):', error.message);
    }
    return defaultValue;
  }
};

// Wrapper for Firestore operations that should fail silently
export const silentFirestoreOperation = async (operation) => {
  try {
    await operation();
  } catch (error) {
    // Completely silent - no console logs
    // Firestore is optional, so errors should not break the app
  }
};
