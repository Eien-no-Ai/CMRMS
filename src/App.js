import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Components/Login/Login";
import SignUp from "./Components/SignUp/SignUp";
import HomePage from "./Components/HomePage/HomePage";
import Patients from "./Components/Patients/Patients";
import PatientsProfile from "./Components/Patients/PatientsProfile";
import Profile from "./Components/Profile/Profile";
import AdminHomePage from "./Components/Admin/AdminHomePage";
import AdminSignUp from "./Components/Admin/AdminSignUp";
import PrivateRoute from "./Components/PrivateRoute";
import PublicRoute from "./Components/PublicRoute"; 
import NotFound from "./Components/NotFound/NotFound";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          
          {/* random url */}

        <Route path="*" element={<NotFound />} />

          {/* Public routes that redirect logged-in users */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/sign-up"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path="/admin-sign-up"
            element={
              <PublicRoute>
                <AdminSignUp />
              </PublicRoute>
            }
          />

          {/* Private routes that require login */}
          <Route
            path="/home"
            element={
              <PrivateRoute allowedRoles={['user', 'doctor', 'clinic staff', 'laboratory staff', 'xray staff']}>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <PrivateRoute allowedRoles={['user', 'doctor', 'clinic staff', 'laboratory staff', 'xray staff']}>
                <Patients />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <PrivateRoute allowedRoles={['user', 'doctor', 'clinic staff', 'laboratory staff', 'xray staff']}>
                <PatientsProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute allowedRoles={['user', 'doctor', 'clinic staff', 'laboratory staff', 'xray staff', 'admin']}>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminHomePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
