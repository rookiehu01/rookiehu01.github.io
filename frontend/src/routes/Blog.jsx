import { useParams, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { BACKEND } from "../components/config.jsx"
import { useUser } from "../context/UserContext.jsx"
import Alert from "../components/Alert.jsx"

function Blog() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [blog, setBlog] = useState(null)
    const [alert, setAlert] = useState(null)
    const { user } = useUser()

    const fetchBlog = async () => {
        try {
            const res = await fetch(`${BACKEND}blogs/${id}`)
            const data = await res.json()

            if (!res.ok) {
                setAlert({
                    title: "Error",
                    message: data.message || "Something went wrong",
                    color: "red"
                })
                return;
            }

            setBlog(data)

        } catch (err) {
            setAlert({
                title: "Error",
                message: err.message,
                color: "red"
            })
        }
    }

    const handleLike = async () => {
        try {
            const res = await fetch(`${BACKEND}blogs/${id}/like`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            })

            const data = await res.json()

            if (!res.ok) {
                setAlert({
                    title: "Error",
                    message: data.message || "Something went wrong",
                    color: "red"
                })
                return;
            }

            fetchBlog()
        } catch (err) {
            setAlert({
                title: "Error",
                message: err.message,
                color: "red"
            })
        }
    }


    useEffect(() => {
        fetchBlog()
    }, [])

    if (alert) return <Alert title={alert.title} message={alert.message} color={alert.color} onClose={() => setAlert(null)} />

    if (!blog) return <Alert title="Loading" message="Please wait..." />

    const formattedDate = new Date(blog.createdAt).toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const isLiked = user && blog.likes.includes(user.id)

    return (
        <div className="blog-page">
            <div className="blog-container">
                <div className="blog-title-data">
                    <div className="blog-title">
                        <h1>{blog.title}</h1>
                    </div>
                    <div className="blog-data">
                        <div className="blog-author-profilepic pointer" onClick={() => navigate(`/author/${blog.createdBy?.username}`)} />
                        <div className="blog-details">
                            <p className="blog-author-name pointer" onClick={() => navigate(`/author/${blog.createdBy?.username}`)}>{blog.createdBy?.username}</p>
                            <p>{formattedDate}</p>
                        </div>
                    </div>
                </div>

                <div className="blog-content">
                    <p>{blog.content}</p>
                </div>
                <div className="blog-like">
                    <div className="blog-like-div">
                        <button
                            className={`blog-like-button ${user && blog.likes.includes(user.id) ? "liked" : ""}`}
                            onClick={user ? handleLike : null}
                            disabled={!user}
                        >
                            <span style={{ color: isLiked ? "black" : "#00bfff" }}>❤</span> Like ({blog.likes.length})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Blog;
