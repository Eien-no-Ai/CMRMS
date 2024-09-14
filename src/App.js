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



function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route index element={<Login />} />
          <Route path="/sign-up" element={<SignUp/>} />
          <Route path="/home" element={<HomePage/>} />
          <Route path="/patients" element={<Patients/>} />
          <Route path="/patients-profile" element={<PatientsProfile/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/admin" element={<AdminHomePage/>} />
          <Route path="/admin-sign-up" element={<AdminSignUp/>} />


        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
