import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="auth-container">
      <div className="signin-card">
        <h2>Sign In</h2>
        <button onClick={handleGoogleSignIn} className="signin-button">Sign In with Google</button>
      </div>
    </div>
  );
};

export default SignInPage;
