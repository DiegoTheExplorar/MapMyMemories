import { faGlobe, faHome, faImage, faMap, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Hamburger.css';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [username, setUsername] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setProfilePicUrl(user.photoURL);
        setUsername(user.displayName);
      } else {
        setProfilePicUrl(null);
        setUsername(null);
        console.log("No user is signed in.");
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      navigate('/');
    }).catch((error) => {
      console.error('Error signing out: ', error);
    });
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <div className={`menu-icon ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
        &#9776;
      </div>
      <div className={`menu ${isOpen ? 'open' : ''}`}>
        <button onClick={() => { navigate('/map'); closeMenu(); }}>
          <FontAwesomeIcon icon={faHome} /> Home
        </button>
        <button onClick={() => { navigate('/map'); closeMenu(); }}>
          <FontAwesomeIcon icon={faMap} /> Map
        </button>
        <button className="sign-out-button" onClick={() => { handleSignOut(); closeMenu(); }}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
        </button>
        <button onClick={() => { navigate('/gallery'); closeMenu(); }}>
          <FontAwesomeIcon icon={faImage} /> View Gallery
        </button>
        <button onClick={() => { navigate('/country'); closeMenu(); }}>
          <FontAwesomeIcon icon={faGlobe} /> View Images by Country
        </button>
        {profilePicUrl && (
          <div className="profile-container">
            <img src={profilePicUrl} alt="Profile" className="profile-pic" />
            <span className="username">{username}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default HamburgerMenu;