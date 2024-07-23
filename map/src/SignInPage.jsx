import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './SignInPage.css';

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
      <button 
        onClick={handleGoogleSignIn} 
        className={`login-button`}
      >
        Login
      </button>
  );
};

export default SignInPage;
