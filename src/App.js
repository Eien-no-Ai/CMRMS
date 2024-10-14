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
import Laboratory from "./Components/Laboratory/Laboratory";
import Clinic from "./Components/Clinic/Clinic";
import Xray from "./Components/Xray/Xray";
import Package from "./Components/Package/Package";
import LaboratoryResult from "./Components/Laboratory/LaboratoryResult";
import PhysicalTherapy from "./Components/PhysicalTherapy/PhysicalTherapy";
import XrayResult from "./Components/Xray/XrayResult";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          
          {/* random url */}
          <Route path="*" element={<NotFound />} />
          <Route path="/packages" element={<Package />} />

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
              <PrivateRoute allowedRoles={['user', 'nurse', 'doctor', 'pathologist', 'junior medtech', 'senior medtech', 'radiologic technologist', 'radiologist','special trainee','physical therapist', 'dentist']}>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <PrivateRoute allowedRoles={['nurse', 'doctor', 'pathologist', 'junior medtech', 'senior medtech', 'radiologic technologist', 'radiologist','special trainee','physical therapist', 'dentist']}>
                <Patients />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <PrivateRoute allowedRoles={['nurse', 'doctor', 'pathologist', 'junior medtech', 'senior medtech', 'radiologic technologist', 'radiologist','special trainee','physical therapist', 'dentist']}>
                <PatientsProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute allowedRoles={['user', 'nurse', 'doctor', 'pathologist', 'junior medtech', 'senior medtech', 'radiologic technologist', 'radiologist', 'admin','special trainee','physical therapist', 'dentist']}>
                <Profile />
              </PrivateRoute>
            }
          />

           {/* Clinic Route */}
           <Route
            path="/clinic/records"
            element={
              <PrivateRoute allowedRoles={['nurse', 'doctor']}>
                <Clinic />
              </PrivateRoute>
            }
          />

          {/* Laboratory Routes */}
          <Route 
            path="/laboratory/requests" 
            element={
              <PrivateRoute allowedRoles={['junior medtech', 'senior medtech', 'pathologist']}>
                <Laboratory />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/laboratory/records" 
            element={
              <PrivateRoute allowedRoles={['junior medtech', 'senior medtech', 'pathologist', 'doctor']}>
                <LaboratoryResult />
              </PrivateRoute>
            } 
          />

          {/* X-ray Routes */}
          <Route
            path="/xray/requests"
            element={
              <PrivateRoute allowedRoles={['radiologic technologist', 'radiologist', 'dentist']}>
                <Xray />
              </PrivateRoute>
            }
          />
           <Route
            path="/xray/records"
            element={
              <PrivateRoute allowedRoles={['radiologic technologist', 'radiologist', 'dentist']}>
                <XrayResult />
              </PrivateRoute>
            }
          />
          
           {/* Physical Therapy Routes */}
           <Route
            path="/physicaltherapy/records"
            element={
              <PrivateRoute allowedRoles={['physical therapist','special trainee', 'doctor']}>
                <PhysicalTherapy />
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