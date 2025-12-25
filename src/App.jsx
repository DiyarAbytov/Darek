import React, { useEffect, useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { IntlProvider } from "react-intl";

import Home from "./pages/Home";
import Sidebar from "./Admin/Sidebar/Sidebar";
import Register from "./Auth/Register/Register";
import Login from "./Auth/Login/Login";
import Profile from "./Admin/Profile/Profile";
import Location from "./Admin/Location/Location";
import CreateListing from "./Admin/CreateListing/CreateListing";
import Listings from "./pages/Listings/Listings";
import Favorites from "./pages/Favorites/Favorites";
import Header from "./pages/Header/Header";
import ImageAdmin from "./Admin/ImageAdmin/ImageAdmin";
import AboutUs from "./Admin/AboutUs/AboutUs";
import Applications from "./Admin/Applications/Applications";
import Complex from "./Admin/Complex/Complex";
import EditListing from "./Admin/EditListing/EditListing";
import ListingManager from "./Admin/ListingManager/ListingManager";
import Employee from "./Admin/Employee/Employee";
import MyListings from "./Admin/MyListings/MyListings";

import { messages } from "./translations";
import "./App.scss";

import api, { getMe } from "./Api/Api";

/* ==== auth hook через axios Api.js ==== */
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [error, setError] = useState(null);

  const verify = useCallback(async () => {
    const access = localStorage.getItem("access_token");
    if (!access) {
      setIsAuthenticated(false);
      return;
    }
    try {
      await getMe(); // интерсептор сам обновит токен при 401
      setIsAuthenticated(true);
      setError(null);
    } catch (e) {
      console.error(e?.message || "Auth error");
      // Интерсептор уже мог очистить токены, но на всякий случай:
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsAuthenticated(false);
      setError("Ошибка аутентификации. Пожалуйста, войдите снова.");
    }
  }, []);

  useEffect(() => {
    verify();
  }, [verify]);

  return { isAuthenticated, error, setIsAuthenticated, setError };
};

/* ==== защищённые/публичные роуты ==== */
const ProtectedRoute = ({ isAuthenticated, children }) => {
  const location = useLocation();
  if (isAuthenticated === null) return <div className="app__loading">Загрузка…</div>;
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

const PublicRoute = ({ isAuthenticated, children }) => {
  if (isAuthenticated === null) return <div className="app__loading">Загрузка…</div>;
  return isAuthenticated ? <Navigate to="/sidebar" replace /> : children;
};

/* ==== layout ==== */
const Layout = ({ children, showError, error, onCityChange, onLanguageChange, language, city }) => (
  <>
    <Header onCityChange={onCityChange} onLanguageChange={onLanguageChange} language={language} city={city} />
    {showError && error ? <div className="app__error">{error}</div> : null}
    {children}
  </>
);

const App = () => {
  const [searchParams, setSearchParams] = useState({});
  const [selectedCity, setSelectedCity] = useState("");
  const [language, setLanguage] = useState("ru");
  const { isAuthenticated, error, setIsAuthenticated, setError } = useAuth();

  const handleSearch = (params) => setSearchParams(params);
  const handleCityChange = (city) => setSelectedCity(city);
  const handleLanguageChange = (lang) => setLanguage(lang);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  const handleLogin = () => {
    // После успешного логина токены уже в localStorage
    setIsAuthenticated(true);
    setError(null);
  };

  return (
    <IntlProvider locale={language} messages={messages[language]}>
      <div className="app">
        <Router>
          {isAuthenticated === null ? (
            <div className="app__loading">Загрузка…</div>
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <PublicRoute isAuthenticated={isAuthenticated}>
                    <Layout
                      showError={false}
                      error={error}
                      onCityChange={handleCityChange}
                      onLanguageChange={handleLanguageChange}
                      language={language}
                      city={selectedCity}
                    >
                      <Home
                        onSearch={handleSearch}
                        searchParams={searchParams}
                        selectedCity={selectedCity}
                        language={language}
                      />
                    </Layout>
                  </PublicRoute>
                }
              />
              <Route
                path="/listing/:id"
                element={
                  <PublicRoute isAuthenticated={isAuthenticated}>
                    <Layout
                      showError={false}
                      error={error}
                      onCityChange={handleCityChange}
                      onLanguageChange={handleLanguageChange}
                      language={language}
                      city={selectedCity}
                    >
                      <Home
                        onSearch={handleSearch}
                        searchParams={searchParams}
                        selectedCity={selectedCity}
                        language={language}
                      />
                    </Layout>
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <Layout
                    showError
                    error={error}
                    onCityChange={handleCityChange}
                    onLanguageChange={handleLanguageChange}
                    language={language}
                    city={selectedCity}
                  >
                    <Login onLogin={handleLogin} />
                  </Layout>
                }
              />
              <Route
                path="/favorites"
                element={
                  <Layout
                    showError
                    error={error}
                    onCityChange={handleCityChange}
                    onLanguageChange={handleLanguageChange}
                    language={language}
                    city={selectedCity}
                  >
                    <Favorites />
                  </Layout>
                }
              />
              <Route
                path="/sidebar/*"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Sidebar onLogout={handleLogout} />
                  </ProtectedRoute>
                }
              >
                <Route path="register" element={<Register />} />
                <Route path="profile" element={<Profile />} />
                <Route path="locations" element={<Location />} />
                <Route path="listing" element={<Listings searchParams={searchParams} />} />
                <Route path="create-listing" element={<CreateListing />} />
                <Route path="image-admin" element={<ImageAdmin />} />
                <Route path="about-us" element={<AboutUs />} />
                <Route path="applications" element={<Applications />} />
                <Route path="complex" element={<Complex />} />
                <Route path="edit-listing" element={<EditListing />} />
                <Route path="listing-manager" element={<ListingManager />} />
                <Route path="employee" element={<Employee />} />
                <Route path="my-listings" element={<MyListings />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </Router>
      </div>
    </IntlProvider>
  );
};

export default App;
