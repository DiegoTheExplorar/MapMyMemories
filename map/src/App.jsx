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
