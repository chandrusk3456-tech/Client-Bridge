import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

// Configure list of authorized admin emails
export const adminEmails = [
  "admin@yourcompany.com"
];

export const isAdminEmail = (email) => {
  if (!email) return false;
  return adminEmails.map(e => e.toLowerCase()).includes(email.toLowerCase());
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Sync session with the Express/Node/MongoDB backend
  const syncWithBackend = async (firebaseUser, role) => {
    try {
      const res = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          avatar: firebaseUser.photoURL || '',
          role: role
        })
      });
      const data = await res.json();
      if (!data.success) {
        console.error('Failed to sync session with backend:', data.message);
      }
    } catch (err) {
      console.error('Error syncing with backend:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          try {
            const role = isAdminEmail(firebaseUser.email) ? 'admin' : 'client';

            const initialUserData = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              avatar: firebaseUser.photoURL || '',
              role: role,
              updatedAt: new Date().toISOString(),
              phone: '',
              whatsapp: '',
              telegram: '',
              company: ''
            };

            // Set user state and release loading indicator immediately
            setUser(initialUserData);
            setLoading(false);

            // Safe Firestore access & MongoDB sync in background
            (async () => {
              try {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                  const existingData = userDoc.data();
                  setUser((prev) => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      name: existingData.name || prev.name,
                      avatar: existingData.avatar || prev.avatar,
                      phone: existingData.phone || '',
                      whatsapp: existingData.whatsapp || '',
                      telegram: existingData.telegram || '',
                      company: existingData.company || '',
                    };
                  });
                } else {
                  // Create record in Firestore if it doesn't exist
                  await setDoc(userDocRef, {
                    uid: initialUserData.uid,
                    name: initialUserData.name,
                    email: initialUserData.email,
                    avatar: initialUserData.avatar,
                    role: initialUserData.role,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  });
                }
              } catch (fsError) {
                console.warn('Firestore database access skipped (not initialized or permission denied):', fsError.message);
              }

              // Sync session to Node/Express + MongoDB
              syncWithBackend(firebaseUser, role);
            })();
          } catch (error) {
            console.error('Error resolving user in auth state change:', error);
            toast(`Auth State Resolution Error: ${error.message}`, 'error');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (fatalError) {
        console.error('Fatal error in auth state listener:', fatalError);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Email login failed:', error.message);
      setLoading(false);
      return { success: false, message: error.message };
    }
  };

  const registerWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Email registration failed:', error.message);
      setLoading(false);
      return { success: false, message: error.message };
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Google login failed:', error.message);
      setLoading(false);
      return { success: false, message: error.message };
    }
  };

  const updateProfile = async (profileData) => {
    if (!user) return { success: false, message: 'No authenticated user' };
    
    try {
      // 1. Update in Firebase Authentication
      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: profileData.name || user.name,
          photoURL: profileData.avatar || user.avatar
        });
      }

      // 2. Update in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const updatedFields = {
        name: profileData.name || user.name,
        avatar: profileData.avatar || user.avatar,
        phone: profileData.phone || '',
        whatsapp: profileData.whatsapp || '',
        telegram: profileData.telegram || '',
        company: profileData.company || '',
        updatedAt: new Date().toISOString()
      };
      
      try {
        await setDoc(userDocRef, updatedFields, { merge: true });
      } catch (fsWriteErr) {
        console.warn('Firestore profile sync failed:', fsWriteErr.message);
      }

      // 3. Update in MongoDB
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      
      if (data.success) {
        setUser((prev) => ({
          ...prev,
          ...updatedFields
        }));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Failed to update profile:', err);
      return { success: false, message: err.message || 'Failed to update profile' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear the local Express session
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      return true;
    } catch (err) {
      console.error('Logout error:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      loginWithEmail, 
      registerWithEmail, 
      loginWithGoogle, 
      updateProfile, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
