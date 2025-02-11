import classNames from 'classnames';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="flex flex-col md:flex-row h-screen w-screen font-sans">
      <div className={classNames("flex-1 bg-cover bg-center relative transition-all duration-1000", {
        'bg-[url("/photo1.jpg")]': currentImage === 'photo1',
        'bg-[url("/photo2.jpg")]': currentImage === 'photo2',
        'bg-[url("/photo3.jpg")]': currentImage === 'photo3',
      })}>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 bg-opacity-90 p-6">
        <div className="text-center mb-4 text-white text-lg">
          <h1>Welcome to MapMyMemories!</h1>
          <h2>Discover and remember your favorite places with ease.</h2>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="btn-grad"
        >
          Sign in with Google
        </button>
      </div>
      <div className="absolute bottom-2 left-2 text-white text-xs">
        {imageCredits[currentImage]}
      </div>
    </div>
  );
};

export default SignInPage;
