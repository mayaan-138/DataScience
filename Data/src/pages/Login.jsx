import { useState } from 'react';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { mockAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      // This will show the Google account picker
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user is admin
      const isAdmin = user.email === 'datascience1424@gmail.com';

      if (isAdmin) {
        // Admin login
        const adminUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Admin User',
          isAdmin: true,
        };
        mockAuth.setCurrentUser(adminUser);

        // Save admin to 'admin' collection
        try {
          const adminRef = doc(db, 'admin', user.uid);
          await setDoc(adminRef, {
            admin_id: user.uid,
            email: user.email,
            name: user.displayName || 'Admin User',
            role: 'admin',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            provider: 'google'
          }, { merge: true });
          console.log('Admin profile saved/updated in Firestore');
        } catch (dbError) {
          console.error('Error saving to Firestore:', dbError);
          setError('Login successful but failed to save to database. Please check Firebase configuration.');
          setGoogleLoading(false);
          return;
        }

        setGoogleLoading(false);
        window.location.href = '/admin/dashboard';
        return;
      } else {
        // Student login/signup
        const studentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          isAdmin: false,
        };
        mockAuth.setCurrentUser(studentUser);

        // Check if student already exists in Firestore
        const studentRef = doc(db, 'students', user.uid);
        const studentDoc = await getDoc(studentRef);

        if (studentDoc.exists()) {
          // Update last login for existing student
          await setDoc(studentRef, {
            lastLogin: new Date().toISOString(),
            provider: 'google'
          }, { merge: true });
        } else {
          // Create new student profile
          await setDoc(studentRef, {
            student_id: user.uid,
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            completed_videos: 0,
            xp_points: 0,
            completed_videos_by_topic: {},
            certificates: [],
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            provider: 'google'
          });
          console.log('Student profile created in Firestore');
        }

        setGoogleLoading(false);
        window.location.href = '/dashboard';
        return;
      }
    } catch (err) {
      // Don't show error if user cancelled the popup
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request' || err.code === 'auth/user-cancelled') {
        setGoogleLoading(false);
        return;
      }
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        if (!email || !password) {
          setError('Please enter email and password');
          setLoading(false);
          return;
        }
        // Check if user is admin first
        const isAdmin = email === 'datascience1424@gmail.com' && password === 'Science@1424';
        
        if (isAdmin) {
          // Admin login
          const user = mockAuth.login(email, password);
          
          // Save admin to 'admin' collection
          try {
            const adminRef = doc(db, 'admin', user.uid);
            await setDoc(adminRef, {
              admin_id: user.uid,
              email: email,
              name: user.displayName || 'Admin User',
              role: 'admin',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            }, { merge: true });
            console.log('Admin profile saved/updated in Firestore');
          } catch (dbError) {
            console.error('Error saving to Firestore:', dbError);
          }
          
          setTimeout(() => {
            setLoading(false);
            window.location.href = '/admin/dashboard';
          }, 150);
          return;
        } else {
          // Student login - verify user exists in Firestore
          try {
            // Query students collection by email
            const studentsRef = collection(db, 'students');
            const q = query(studentsRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
              setError('Invalid email or password. Please sign up first.');
              setLoading(false);
              return;
            }
            
            // User exists in database - allow login
            const studentDoc = querySnapshot.docs[0];
            const studentData = studentDoc.data();
            
            const user = {
              uid: studentData.student_id || studentDoc.id,
              email: email,
              displayName: studentData.name || email.split('@')[0],
              isAdmin: false,
            };
            mockAuth.setCurrentUser(user);
            
            // Update last login
            await setDoc(doc(db, 'students', studentDoc.id), {
              lastLogin: new Date().toISOString()
            }, { merge: true });
            
            setTimeout(() => {
              setLoading(false);
              window.location.href = '/dashboard';
            }, 150);
            return;
          } catch (dbError) {
            console.error('Error checking user in Firestore:', dbError);
            setError('Error verifying credentials. Please try again.');
            setLoading(false);
            return;
          }
        }
      } else {
        if (!email || !password || !name) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        
        // Sign up user immediately (mock auth - synchronous)
        const user = mockAuth.signup(name, email, password);
        
        // Save to Firestore before navigating
        try {
          await setDoc(doc(db, 'students', user.uid), {
            student_id: user.uid,
            name: name,
            email: email,
            completed_videos: 0,
            xp_points: 0,
            completed_videos_by_topic: {},
            certificates: [],
            createdAt: new Date().toISOString()
          });
          console.log('Student profile saved to Firestore successfully');
        } catch (dbError) {
          console.error('Error saving to Firestore:', dbError);
          // Show error but don't block signup
          setError('Account created but failed to save to database. Please check Firebase configuration.');
          setLoading(false);
          return;
        }
        
        // Small delay to ensure state updates, then navigate
        setTimeout(() => {
          setLoading(false);
          // Use window.location for reliable navigation
          window.location.href = '/dashboard';
        }, 150);
        
        return;
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-primary transition-colors z-10"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Home</span>
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">DataScience Academy</h1>
          <p className="text-gray-400">Learn Data Science through video lectures and practice</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-primary text-white button-glow'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <LogIn className="inline-block mr-2 w-4 h-4" />
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-primary text-white button-glow'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <UserPlus className="inline-block mr-2 w-4 h-4" />
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 pr-10 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="mt-4 w-full flex items-center justify-center gap-3 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
            >
              {googleLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
