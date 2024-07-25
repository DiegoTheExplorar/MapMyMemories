// SignInPage.js
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignInPage.module.css';

const imageCredits = {
  photo1: (
    <>
      <a href="https://stocksnap.io/photo/sunrise-sunset-XSTO5645BM">Photo</a> by <a href="https://stocksnap.io/author/653">Jordan McQueen</a> on <a href="https://stocksnap.io">StockSnap</a>
    </>
  ),
  photo2: (
    <>
      <a href="https://www.freepik.com/free-photo/medium-shot-contemplative-man-seaside_47696347.htm">Image by freepik</a>
    </>
  ),
  photo3: (
    <>
      <a href="https://www.freepik.com/free-photo/beautiful-girl-standing-boat-looking-mountains-ratchaprapha-dam-khao-sok-national-park-surat-thani-province-thailand_13180933.htm#fromView=search&page=1&position=21&uuid=8dcae0bb-3af0-45e2-9386-99741de8513d">Image by tawatchai07 on Freepik</a>
    </>
  ),
};

const SignInPage = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState('photo1');

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

  useEffect(() => {
    const cycleImages = () => {
      const current = currentImage === 'photo1' ? 'photo2' : currentImage === 'photo2' ? 'photo3' : 'photo1';
      setCurrentImage(current);
    };
    const interval = setInterval(cycleImages, 5000);
    return () => clearInterval(interval);
  }, [currentImage]);

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
      <div className={styles.credits}>
        {imageCredits[currentImage]}
      </div>
    </div>
  );
};

export default SignInPage;
