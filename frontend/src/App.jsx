import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainPage from "./routes/MainPage.jsx";
import Heartbeat from "./routes/Heartbeat.jsx";
import Login from "./routes/Login.jsx";
import Profile from "./routes/Profile.jsx";
import NotFound from "./routes/NotFound.jsx";
import { UserProvider, useUser } from "./context/UserContext.jsx";

import Header from "./components/Header.jsx";
import Alert from "./components/Alert.jsx";

import "./styling/App.css"
import "./styling/Header.css"
import "./styling/Login.css"
import "./styling/Alert.css"
import "./styling/Everythingelse.css"

function AppContent() {
  const { isLoading } = useUser();

  if (isLoading) {
    return <Alert title="Loading" message="Please wait..." />
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/heartbeat" element={<Heartbeat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </UserProvider>
  );
}
export default App;
