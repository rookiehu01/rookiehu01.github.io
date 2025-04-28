import { useUser } from "../context/UserContext.jsx"
import Alert from "../components/Alert.jsx"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import BlogList from "../components/BlogList.jsx";

const MainPage = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const [alert, setAlert] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [sortBy, setSortBy] = useState("createdAt-desc");
  const [showOnlyOwn, setShowOnlyOwn] = useState(false);



  const fetchBlogs = async () => {
    const blogs = await fetch(`http://140.238.168.70:8000/blogs`, {
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
    setBlogs(data);
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
      case "updatedAt-asc":
        return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
      case "updatedAt-desc":
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
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
            <option value="likes-desc">Most liked</option>
            <option value="likes-asc">Least liked</option>
            <option value="author-asc">Author A-Z</option>
            <option value="author-desc">Author Z-A</option>
            <option value="createdAt-asc">Oldest created</option>
            <option value="createdAt-desc">Newest created</option>
            <option value="updatedAt-asc">Oldest updated</option>
            <option value="updatedAt-desc">Recently updated</option>
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
        {filteredBlogs.length === 0 ? (
          <div className="no-blogs">
            <h2>No blogs found</h2>
            {user ? (
              <button
                onClick={() => navigate("/newblog")}
                className="fancy-button"
              >
                Create one here!
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="fancy-button"
              >
                Log in to create one!
              </button>
            )}
          </div>
        ) : (
          <BlogList blogs={filteredBlogs} />
        )}
      </div>
    </div>
  )
}

export default MainPage