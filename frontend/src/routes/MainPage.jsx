import { useUser } from "../context/UserContext.jsx"
import Alert from "../components/Alert.jsx"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { BACKEND } from "../components/config.jsx"

const MainPage = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const [alert, setAlert] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [sortBy, setSortBy] = useState("createdAt-desc");
  const [showOnlyOwn, setShowOnlyOwn] = useState(false);



  const fetchBlogs = async () => {
    const blogs = await fetch(`${BACKEND}blogs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })

    const data = await blogs.json()

    if (!blogs.ok) {
      setAlert({
        title: "Error",
        message: data.message,
        color: "red"
      })
    }


    if (Array.isArray(data) && data.length === 0) {
      setAlert({
        title: "No blogs found",
        message: (
          <>
            {user ? (<button
              onClick={() => navigate("/newblog")}
              className="fancy-button"
            >
              Create one here!
            </button>) : (
              <button onClick={() => navigate("/login")}
                className="fancy-button"> Log in to create one! </button>
            )}

          </>
        )
      });
    } else {
      setBlogs(data);
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  if (!blogs) return <Alert title="Loading" message="Please wait..." />

  let filteredBlogs = [...blogs];

  if (user && showOnlyOwn) {
    filteredBlogs = filteredBlogs.filter(
      blog => blog.createdBy._id?.toString() === user.userId || blog.createdBy._id === user._id
    );
  }

  filteredBlogs.sort((a, b) => {
    switch (sortBy) {
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "likes-asc":
        return a.likes.length - b.likes.length;
      case "likes-desc":
        return b.likes.length - a.likes.length;
      case "author-asc":
        return a.createdBy.username.localeCompare(b.createdBy.username);
      case "author-desc":
        return b.createdBy.username.localeCompare(a.createdBy.username);
      case "createdAt-asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "createdAt-desc":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });


  return (

    <div className="main-page">
      {alert && (
        <Alert
          title={alert.title}
          message={alert.message}
          color={alert.color}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="blogs-title-div">
        <div className="blogs-filter-controls">
          <select className="blogs-filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="likes-asc">Likes ↑</option>
            <option value="likes-desc">Likes ↓</option>
            <option value="author-asc">Author A-Z</option>
            <option value="author-desc">Author Z-A</option>
            <option value="createdAt-asc">Date ↑ (Oldest first)</option>
            <option value="createdAt-desc">Date ↓ (Newest first)</option>
          </select>

          {user && (
            <button
              className={`blogs-myblogs-button ${showOnlyOwn ? "active" : ""}`}
              onClick={() => setShowOnlyOwn(prev => !prev)}
            >
              My blogs
            </button>
          )}
        </div>

        <h1 className="blogs-title"> Blogs </h1>
      </div>
      <div className="blogs-list">
        {filteredBlogs.map((blog) => {
          const formattedDate = new Date(blog.createdAt).toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });

          return (
            <div key={blog._id} className="blogs-card" onClick={() => navigate(`/blog/${blog._id}`)}>
              <div className="blogs-card-left">
                <div className="blogs-card-image" />
              </div>

              <div className="blogs-card-center">
                <h2 className="blogs-card-title">{blog.title}</h2>
                <p className="blogs-card-author">{blog.createdBy?.username}</p>
                <p className="blogs-card-content">
                  {blog.content.length > 20
                    ? `${blog.content.slice(0, 100)}...`
                    : blog.content}
                </p>
              </div>

              <div className="blogs-card-right">
                <p>{formattedDate}</p>
                <p><span style={{ color: "#00bfff" }}>❤</span> {blog.likes.length}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default MainPage