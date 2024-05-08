import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './App.css';
import Header from './components/Header/Header';
import AcceptancePage from "./Pages/AcceptancePage/AcceptancePage";
import LoginPage from "./Pages/LoginPage/LoginPage";
import { useEffect, useState } from "react";
import DevelopmentPage2 from "./Pages/DevelopmentPage/DevelopmentPage2";
import SettingsPage from "./Pages/SettingsPage/SettingsPage";
import AssemblyPage2 from "./Pages/AssemblyPage/AssemblyPage2";
import ArchivePage from "./Pages/ArchivePage/ArchivePage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLevel, setUserLevel] = useState(null)
  const firstTimeStart = async () => {
    await window.api.addDefaultUserIfNeeded()
  }

  useEffect(() => {
    firstTimeStart()
    // Check if user is already logged in (e.g., by checking local storage)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(isLoggedIn);
    const user = JSON.parse(localStorage.getItem('user'));
    setUserLevel(user?.level)
  }, []);

  return (
    <div className="App">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} id="header" />
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/acceptance-page" /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/development-page" element={<DevelopmentPage2 userLevel={userLevel} />} />
        <Route path="/assembly-page" element={<AssemblyPage2  userLevel={userLevel}/>}  />
        <Route path='/acceptance-page' element={<AcceptancePage userLevel={userLevel} />} />
        <Route
          path="/settings"
          element={userLevel > 1 ? <Navigate to="/" /> : <SettingsPage userLevel={userLevel} /> }
        />
        <Route path="/archive" element={<ArchivePage userLevel={userLevel} />} />
      </Routes>
    </div>
  );
}

export default App;
