import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import CountryGallery from './CountryPhotos/CountryGallery';
import DetailsPage from './DetailsPage/DetailsPage';
import ImageGallery from './ImageGallery/ImageGallery';
import MainLayout from './MainLayout';
import MyMap from './Map/MyMap';
import SignInPage from './SigninPage/SignInPage';

function RouterAwareComponent() {
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem('lastLocation', location.pathname);
  }, [location]);

  return null;
}

// Component for protected routes
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

const routes = [
  { path: "/", element: <Navigate replace to="/signin" /> },
  { path: "/signin", element: <SignInPage /> },
  { path: "/map", element: <PrivateRoute element={<MainLayout><MyMap /></MainLayout>} /> },
  { path: "/details/:lat/:lng", element: <PrivateRoute element={<MainLayout><DetailsPage /></MainLayout>} /> },
  { path: "/gallery", element: <PrivateRoute element={<MainLayout><ImageGallery /></MainLayout>} /> },
  { path: "/country", element: <PrivateRoute element={<MainLayout><CountryGallery /></MainLayout>} /> },
];

const App = () => {
  return (
    <Router>
      <RouterAwareComponent />
      <Routes>
        {routes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={element}
          />
        ))}
      </Routes>
    </Router>
  );
};

export default App;
