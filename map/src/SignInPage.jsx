import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignInPage.module.css'; // Correct import for CSS Module

const SignInPage = () => {
  const navigate = useNavigate();
  
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    try {
      await signInWithPopup(auth, provider);
      navigate('/map');
    } catch (error) {
      alert('Failed to sign in with Google: ' + error.message);
    }
  };

  return (
    <div>
    <div className={styles.bodyBackground}>
      <div className={styles.message}>
        <p>Welcome to MapMyMemories!</p>
        <p>Discover and remember your favorite places with ease.</p>
      </div>
      <footer className={styles.credits}>
        Photo credits: <a href="https://stocksnap.io/photo/sunrise-sunset-XSTO5645BM">Jordan McQueen</a> and <a href="https://stocksnap.io/photo/city-tourist-OPR16B55Q8">Matt Moloney</a>
      </footer>
    </div>
    <div>
      <button 
        onClick={handleGoogleSignIn} 
        className={styles.signin}
      >
        <img 
          src="/google.webp" 
          alt="Sign In with Google" 
          className={styles.signinImage}
        />
      </button>
    </div>
    </div>
  );
};

export default SignInPage;
