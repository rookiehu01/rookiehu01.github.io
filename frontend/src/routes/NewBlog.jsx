import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import { useEffect, useState } from "react";
import { BACKEND } from "../components/config.jsx";
import Alert from "../components/Alert.jsx";

function NewBlog() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    title: "",
    content: ""
  });

  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BACKEND}newblog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          title: "Error",
          message: data.message || "Failed to create blog",
          color: "red"
        });
        return;
      }

      navigate("/");
    } catch (error) {
      setAlert({
        title: "Network error",
        message: error.message,
        color: "red"
      });
    }
  };

  return (
    <div className="newblog-page">
      {alert && (
        <Alert
          title={alert.title}
          message={alert.message}
          color={alert.color}
          onClose={() => setAlert(null)}
        />
      )}
  
      <div className="newblog-container">
        <h1>Create New Blog</h1>
        <form className="newblog-form" onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Blog title"
          />
  
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            placeholder="Write your blog content here..."
            rows={6}
          />
  
          <button type="submit" className="login-button">Publish</button>
        </form>
      </div>
    </div>
  );
  
}

export default NewBlog;
