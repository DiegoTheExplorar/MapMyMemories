import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignInPage.module.css';

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
    <div className={styles.container}>
      <div className={styles.imageSection}></div>
      <div className={styles.formSection}>
        <div className={styles.message}>
          <p>Welcome to MapMyMemories!</p>
          <p>Discover and remember your favorite places with ease.</p>
        </div>
        <button onClick={handleGoogleSignIn} className={styles.signin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default SignInPage;
