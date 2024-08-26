import { faGlobe, faImage, faMap, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Switch from 'react-switch';

const HamburgerMenu = ({ toggleDarkMode, isDarkMode }) => {
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
      <div 
        className={`fixed top-4 right-4 cursor-pointer transition-colors duration-300 z-[9999] ${isOpen ? 'text-white' : 'text-black dark:text-white'}`} 
        onClick={toggleMenu}
        style={{ fontSize: '2.5rem' }} // Adjust font size as needed
      >
        &#9776;
      </div>
      <div className={`fixed top-0 right-0 h-full bg-gray-900 transition-width duration-500 flex flex-col justify-start pt-16 z-[9998] ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <button onClick={() => { navigate('/map'); closeMenu(); }} className="text-gray-400 p-4 text-left hover:text-white hover:bg-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faMap} /> Map
        </button>
        <button onClick={() => { navigate('/gallery'); closeMenu(); }} className="text-gray-400 p-4 text-left hover:text-white hover:bg-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faImage} /> View Gallery
        </button>
        <button onClick={() => { navigate('/country'); closeMenu(); }} className="text-gray-400 p-4 text-left hover:text-white hover:bg-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faGlobe} /> View Images by Country
        </button>
        <button onClick={() => { handleSignOut(); closeMenu(); }} className="text-gray-400 p-4 text-left hover:text-white hover:bg-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
        </button>
        <div className="text-gray-400 p-4 text-left hover:text-white hover:bg-gray-800 flex items-center gap-2">
          <span className="mr-2">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          <Switch 
            onChange={toggleDarkMode} 
            checked={isDarkMode} 
            offColor="#888"
            onColor="#000"
            offHandleColor="#fff"
            onHandleColor="#fff"
            uncheckedIcon={false}
            checkedIcon={false}
            height={20}
            width={40}
          />
        </div>
        {profilePicUrl && (
          <div className="absolute bottom-8 w-full flex flex-col items-center text-gray-400">
            <img src={profilePicUrl} alt="Profile" className="w-16 h-16 rounded-full mb-2" />
            <span className="text-lg">{username}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default HamburgerMenu;
