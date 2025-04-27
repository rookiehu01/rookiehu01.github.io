import { BrowserRouter, Routes, Route } from "react-router-dom";

import { UserProvider, useUser } from "./context/UserContext.jsx";

import MainPage from "./routes/MainPage.jsx";
import Login from "./routes/Login.jsx";
import Author from "./routes/Author.jsx";
import NotFound from "./routes/NotFound.jsx";
import Blog from "./routes/Blog.jsx";
import BlogForm from "./routes/BlogForm.jsx";


import Header from "./components/Header.jsx";
import Alert from "./components/Alert.jsx";

import "./styling/App.css"
import "./styling/Header.css"
import "./styling/Login.css"
import "./styling/BlogForm.css"
import "./styling/MainPage.css"
import "./styling/Alert.css"
import "./styling/Blog.css"
import "./styling/Author.css"
import "./styling/Heartbeat.css"
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
        <Route path="/login" element={<Login />} />
        <Route path="/author/:username" element={<Author />} />
        <Route path="/newblog" element={<BlogForm />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/blog/:id/edit" element={<BlogForm />} />
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
