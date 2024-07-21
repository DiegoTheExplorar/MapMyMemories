import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDropdown.css';

function UserDropdown() {
    const auth = getAuth();
    const navigate = useNavigate();
    const [profilePicUrl, setProfilePicUrl] = useState(null);
    const [isOpen, setIsOpen] = useState(false); // State to manage dropdown visibility

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                setProfilePicUrl(user.photoURL);
            } else {
                setProfilePicUrl(null);
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

    const toggleDropdown = () => setIsOpen(!isOpen); // Toggle function for dropdown

    return (
        <div className="user-icon-container" onClick={toggleDropdown}>
            {profilePicUrl && <img src={profilePicUrl} alt="Profile" className="profile-pic" />}
            {isOpen && (
                <div className="dropdown-menu">
                    <button onClick={handleSignOut}>Sign Out</button>
                </div>
            )}
        </div>
    );
}

export default UserDropdown;