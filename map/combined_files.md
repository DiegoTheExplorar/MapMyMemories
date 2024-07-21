# Combined JSX and CSS Files

## JSX Files

### src\App.jsx
```jsx
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import DetailsPage from './DetailsPage';
import MyMap from './MyMap';
import SignInPage from './SignInPage';

const PrivateRoute = ({ element }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return user ? element : <Navigate to="/signin" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate replace to="/signin" />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/map" element={<PrivateRoute element={<MyMap />} />} />
        <Route path="/details/:lat/:lng" element={<PrivateRoute element={<DetailsPage />} />} />
      </Routes>
    </Router>
  );
}

export default App;

```

### src\DetailsPage.jsx
```jsx
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './DetailsPage.css'; // Import a separate CSS file for styling
import { db } from './firebase-config';

const DetailsPage = () => {
  const { lat, lng } = useParams();
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const userDocRef = collection(db, `users/${userId}/locations`);
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const q = query(userDocRef, where("latitude", "==", latNum), where("longitude", "==", lngNum));

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const allImages = querySnapshot.docs.flatMap(doc => doc.data().images);
          setImages(allImages);
        } else {
          console.log("No images found at this location.");
        }
      }
    };

    fetchImages();
  }, [lat, lng]);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const toMap = () => {
    navigate('/map');
  };

  return (
    <div className="container">
      <h1>Images at Latitude: {lat}, Longitude: {lng}</h1>
      {images.length > 0 ? (
        <div className="image-carousel">
          <img src={images[currentImage]} alt="Slideshow image" />
          <div className="carousel-controls">
            <button onClick={prevImage}>Previous</button>
            <button onClick={nextImage}>Next</button>
          </div>
        </div>
      ) : (
        <p>No images available for this location.</p>
      )}
      <button onClick={toMap} className="back-button">Back to Map</button>
    </div>
  );
};

export default DetailsPage;

```

### src\HamburgerMenu\Hamburger.jsx
```jsx
import { faHome, faMap, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
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
```

### src\main.jsx
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

```

### src\MyMap.jsx
```jsx
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { addDoc, arrayUnion, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { db } from './firebase-config';
import HamburgerMenu from './HamburgerMenu/Hamburger';
const SearchBar = () => {
  const map = useMap();

  useEffect(() => {
    // Define a red marker icon
    const redIcon = new L.Icon({
      iconUrl: './redmarker.png', // URL to your custom icon image
      iconSize: [32, 32], // Size of the icon
      iconAnchor: [16, 32], // Anchor point of the icon
      popupAnchor: [0, -32] // Popup anchor relative to the iconAnchor
    });

    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      autoComplete: true,
      autoCompleteDelay: 250,
      showMarker: true,
      showPopup: false,
      marker: {
        icon: redIcon, // Use the red marker icon here
        draggable: false,
      },
      maxMarkers: 1,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: 'Enter address',
      keepResult: true
    });

    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
};

const photoIcon = new L.Icon({
  iconUrl: './camera.png',
  iconSize: [20, 20], // Size of the icon
  iconAnchor: [20, 20], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -40] // Point from which the popup should open relative to the iconAnchor
});

const MyMap = () => {
  const navigate = useNavigate();
  const [markers, setMarkers] = useState([]);
  const [location, setLocation] = useState({ lat: null, long: null });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);



  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude
          });
        },
        (error) => {
          setError(error.message);
          console.error(error);
        }
      );
    } else {
      setLocation({
            lat: 1.359167,
            long:  103.989441
          });
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocations = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const userDocRef = doc(db, "users", userId);
      const locationsRef = collection(userDocRef, "locations");
      const querySnapshot = await getDocs(locationsRef);
      const fetchedMarkers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        lat: doc.data().latitude,
        lng: doc.data().longitude,
        images: doc.data().images
      }));
      setMarkers(fetchedMarkers);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to upload images.");
      return;
    }
    const userId = user.uid;
    acceptedFiles.forEach(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('https://travelphoto-4c6a27f33f4a.herokuapp.com/upload', formData);
      const { latitude, longitude } = response.data;
      const storage = getStorage();
      const storageRef = ref(storage, `images/${userId}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const userDocRef = doc(db, "users", userId);
      const locationsRef = collection(userDocRef, "locations");
      const locQuery = query(locationsRef, where("latitude", "==", latitude), where("longitude", "==", longitude));
      const locQuerySnapshot = await getDocs(locQuery);
      if (!locQuerySnapshot.empty) {
        const locDoc = locQuerySnapshot.docs[0];
        await updateDoc(doc(locationsRef, locDoc.id), {
          images: arrayUnion(downloadURL)
        });
      } else {
        await addDoc(locationsRef, {
          latitude,
          longitude,
          images: [downloadURL],
          timestamp: new Date()
        });
      }
      alert('Image successfully added!');
      fetchLocations(); // Refresh markers
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="app-container">
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag 'n' drop images here, or click to select images</p>
      </div>
      {location.lat && location.long && (
        <MapContainer center={[location.lat, location.long]} zoom={13} className="map-container">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {markers.map((marker, index) => (
            <Marker
            key={index}
            position={[marker.lat, marker.lng]}
            icon={photoIcon}
            eventHandlers={{
              click: () => navigate(`/details/${marker.lat}/${marker.lng}`),
              mouseover: (e) => {
                e.target.openPopup();
              },
              mouseout: (e) => {
                e.target.closePopup();
              }
            }}
          >
            <Popup>Click the marker to see all images.</Popup>
          </Marker>          
          ))}
          <SearchBar />
        </MapContainer>
      )}
      <HamburgerMenu />
    </div>
  );
};

export default MyMap;

```

### src\SearchBar.jsx
```jsx
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const SearchBar = () => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider(); // or any other provider like BingMapProvider, EsriProvider, etc.
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      autoComplete: true, // optional: true|false  - default true
      autoCompleteDelay: 250, // optional: number      - default 250
      showMarker: true, // optional: true|false  - default true
      showPopup: false, // optional: true|false  - default false
      marker: { // optional: L.Marker    - default L.Icon.Default
        icon: new L.Icon.Default(),
        draggable: false,
      },
      maxMarkers: 1, // optional: number      - default 1
      retainZoomLevel: false, // optional: true|false  - default false
      animateZoom: true, // optional: true|false  - default true
      autoClose: true, // optional: true|false  - default false
      searchLabel: 'Enter address', // optional: string      - default 'Enter address'
      keepResult: true // optional: true|false  - default false
    });

    map.addControl(searchControl);
    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
};

export default SearchBar;

```

### src\SignInPage.jsx
```jsx
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

```

### src\TestPage.jsx
```jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const TestPage = () => {
  const { lat, lng } = useParams();

  return (
    <div>
      <h1>Test Page</h1>
      <p>Latitude: {lat}</p>
      <p>Longitude: {lng}</p>
    </div>
  );
};

export default TestPage;

```

### src\UserDropdown.jsx
```jsx
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
```

## CSS Files

### src\App.css
```css
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  background: white;
}

.map-container {
  height: 75vh;
  width: 80%;
  margin-top: 20px;
  margin-bottom: 20px;
}

.dropzone {
  border: 2px dashed #007bff;
  padding: 20px;
  text-align: center;
  margin: 20px auto;
  cursor: pointer;
  background-color: #ffffff;
  border-radius: 5px;
  color: #007bff;
  transition: background-color 0.2s;
  width: 70%;
}

.dropzone:hover {
  background-color: #e2e6ea;
}

.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.signin-card {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.signin-button, .signout-button {
  padding: 10px 20px;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
}

.signin-button:hover, .signout-button:hover {
  background-color: #0056b3;
}

.back-button, .signout-button {
  padding: 10px 20px;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 10px;
}
.details-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.details-image {
  max-width: 20%; /* Smaller image size */
  height: auto;
  display: block;
  margin: auto; /* Ensures centering */
}

.details-nav {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}



.back-button:hover, .signout-button:hover {
  background-color: #0056b3;
}

@media (max-width: 600px) {
  .map-container {
    height: 50vh;
  }

  .signin-card, .dropzone {
    width: 90%;
  }
}

```

### src\DetailsPage.css
```css
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #f4f4f4;
    padding: 20px;
  }
  
  .image-carousel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  img {
    max-width: 100%; /* Ensure the image is responsive and does not exceed its parent's width */
    height: 303px; /* Set the height to roughly 8cm on a typical screen */
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    object-fit: cover; /* Ensures the image covers the set height and width, may crop if necessary */
  }
  
  
  .carousel-controls {
    display: flex;
    margin-top: 10px;
  }
  
  button {
    padding: 8px 16px;
    margin: 0 5px;
    border: none;
    background-color: #007BFF;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  .back-button {
    margin-top: 20px;
  }
  
```

### src\HamburgerMenu\Hamburger.css
```css
body {
    font-family: Arial, sans-serif;
  }
  
  .menu-icon {
    font-size: 30px;
    cursor: pointer;
    position: fixed;
    top: 15px;
    right: 15px;
    color: black;
    transition: color 0.3s;
    z-index: 1001;
  }
  
  .menu-icon.open {
    color: white;
  }
  
  .menu {
    height: 100%;
    width: 0;
    position: fixed;
    top: 0;
    right: 0;
    background-color: #111;
    overflow-x: hidden;
    transition: width 0.5s;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 60px;
    z-index: 1000; 
  }
  
  .menu button {
    padding: 15px 20px;
    text-decoration: none;
    font-size: 18px;
    color: #818181;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background-color 0.3s, color 0.3s;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
  }
  
  .menu button:hover {
    color: #f1f1f1;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .menu.open {
    width: 250px;
  }
  
  .profile-container {
    position: absolute;
    bottom: 20px;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20px;
  }
  
  .profile-pic {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-bottom: 10px;
  }
  
  .username {
    font-size: 20px;
    color: #818181;
  }
  
  @media (max-width: 768px) {
    .menu {
      padding-top: 20px;
    }
  
    .menu button {
      font-size: 16px;
      padding: 12px 15px;
    }
  
    .profile-pic {
      width: 50px;
      height: 50px;
    }
  
    .username {
      font-size: 18px;
    }
  }
  
  @media (max-width: 480px) {
    .menu-icon {
      font-size: 24px;
      top: 10px;
      right: 10px;
    }
  
    .menu.open {
      width: 200px;
    }
  
    .menu button {
      font-size: 14px;
      padding: 10px 10px;
    }
  
    .profile-pic {
      width: 40px;
      height: 40px;
    }
  
    .username {
      font-size: 16px;
    }
  }
```

### src\index.css
```css
html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: 'Arial', sans-serif;
  }
  
  #root {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  h1{
    text-align: center;
    margin-top: 20px;
    font-size: 1em;
  }
  
```

### src\UserDropdown.css
```css
.user-icon-container {
    position: fixed;
    top: 20px;
    right: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .profile-pic {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .dropdown-menu {
    position: absolute;
    right: 0;
    top: 50px; /* Adjusted to appear below the icon */
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    width: 160px;
    overflow: hidden;
  }
  
  .dropdown-menu button {
    background: none;
    border: none;
    padding: 12px 16px;
    cursor: pointer;
    width: 100%;
    text-align: left;
    color: #333;
    font-size: 14px;
    transition: background-color 0.2s, color 0.2s;
  }
  
  .dropdown-menu button:hover, .dropdown-menu button:focus {
    background-color: #f7f7f7;
    color: #1a202c;
    outline: none;
  }
  
  .dropdown-menu button:focus {
    box-shadow: inset 0 0 0 2px #5b67ca;
  }
```
