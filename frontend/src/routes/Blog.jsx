import { useParams, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { useUser } from "../context/UserContext.jsx"
import Alert from "../components/Alert.jsx"
import BlogAuthor from "../components/BlogAuthor.jsx";
import ReactMarkdown from "react-markdown"

function Blog() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [blog, setBlog] = useState(null)
    const [alert, setAlert] = useState(null)
    const { user } = useUser()
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const fetchBlog = async () => {
        try {
            const res = await fetch(`https://rookiehu.ddns.net/blogs/${id}`)
            const data = await res.json()

            if (data.message === "Blog not found") {
                navigate("/notfound");
                return;
            }

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

    const fetchComments = async () => {
        const res = await fetch(`https://rookiehu.ddns.net/blogs/${id}/comments`);
        const data = await res.json();
        setComments(data);
    };

    const handleCommentPost = async () => {
        if (!newComment.trim()) return;
        const res = await fetch(`https://rookiehu.ddns.net/blogs/${id}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`
            },
            body: JSON.stringify({ content: newComment })
        });

        const data = await res.json();

        if (!res.ok) {
            setAlert({
                title: "Error",
                message: data.message,
                color: "red"
            });
            return;
        }

        setNewComment("");
        fetchComments();
    };

    const handleLike = async () => {
        try {
            const res = await fetch(`https://rookiehu.ddns.net/blogs/${id}/like`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            })

            const data = await res.json()

            if (data.likers) {
                setAlert({
                    title: "Liked by",
                    message: (
                        <div style={{}}>
                            {data.likers.length > 0 ? (
                                data.likers.map((username, i) => (
                                    <p
                                        className="pointer blue"
                                        key={i}
                                        onClick={() => navigate(`/author/${username}`)}
                                    >
                                        {username}
                                    </p>
                                ))
                            ) : (
                                <p>No likes yet.</p>
                            )}
                        </div>
                    )
                });
                return;
            }

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

    const handleDelete = async () => {
        try {
            const res = await fetch(`https://rookiehu.ddns.net/blogs/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            });

            const data = await res.json();

            if (!res.ok) {
                setAlert({
                    title: "Error",
                    message: data.message || "Something went wrong",
                    color: "red"
                });
                return;
            }

            navigate("/");
        } catch (err) {
            setAlert({
                title: "Error",
                message: err.message,
                color: "red"
            });
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const res = await fetch(`https://rookiehu.ddns.net/comments/${commentId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            const data = await res.json();
            if (!res.ok) {
                setAlert({
                    title: "Error",
                    message: data.message || "Failed to delete comment",
                    color: "red"
                });
                return;
            }
            fetchComments();
        } catch (err) {
            setAlert({
                title: "Error",
                message: err.message,
                color: "red"
            });
        }
    };

    useEffect(() => {
        fetchBlog()
        fetchComments()
    }, [])

    if (alert) return <Alert title={alert.title} message={alert.message} color={alert.color} onClose={() => setAlert(null)} />

    if (!blog) return <Alert title="Loading" message="Please wait..." />

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const autoGrow = (element) => {
        element.style.height = "inherit";
        element.style.height = `${element.scrollHeight}px`;
    };

    const isLiked = user && blog.likes.includes(user.id);

    return (
        <div className="blog-page">
            <div className="blog-container">
                <div className="blog-title-data">
                    <div className="blog-title">
                        <h1>{blog.title}</h1>
                        {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                            <p className="blog-updated-date">Updated: {formatDate(blog.updatedAt)}</p>
                        )}
                    </div>
                    <BlogAuthor user={blog.createdBy} date={blog.createdAt} />
                </div>

                <div className="blog-content">
                    {blog.coverImageIndex !== undefined && blog.coverImageIndex !== null && blog.images && blog.images[blog.coverImageIndex] && (
                        <img
                            src={`https://rookiehu.ddns.net/uploads/blog-images/${blog.images[blog.coverImageIndex]}`}
                            alt="cover"
                        />
                    )}
                    <hr />
                    <ReactMarkdown>{blog.content}</ReactMarkdown>
                </div>

                <div className="blog-interact">
                    <div className="blog-like-div">
                        <button
                            className={`blog-interact-button ${isLiked ? "liked" : ""}`}
                            onClick={user ? handleLike : null}
                            disabled={!user}
                        >
                            <span style={{ color: isLiked ? "black" : "#00bfff", display: "inline-flex", alignItems: "center" }}>❤</span> Like ({blog.likes.length})
                        </button>
                    </div>

                    {user && blog.createdBy._id === user.id && (
                        <div className="blog-edit-div" style={{ display: "flex", gap: "1rem" }}>
                            <button
                                className="blog-interact-button"
                                onClick={() => navigate(`/blog/${id}/edit`)}
                            >
                                Edit
                            </button>
                            <button
                                className="blog-interact-button delete"
                                onClick={() => setDeleteConfirm(true)}
                            >
                                Delete
                            </button>

                            {deleteConfirm && (
                                <Alert
                                    title="Delete Blog"
                                    message={
                                        <div>
                                            <p>Are you sure you want to delete this blog?</p>
                                            <div style={{
                                                display: "flex",
                                                gap: "1rem",
                                                marginTop: "1rem",
                                                justifyContent: "center"
                                            }}>
                                                <button
                                                    onClick={handleDelete}
                                                    className="blog-interact-button delete"
                                                >
                                                    Yes, delete
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(false)}
                                                    className="blog-interact-button"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    }
                                    color="red"
                                    onClose={() => setDeleteConfirm(false)}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="blog-container">
                <div className="blog-comment">
                    <h2 className="blog-comment-title">Comments ({comments.length})</h2>
                    {user ? (
                        <div className="blog-comment-form">
                            <div className="blog-comment-textarea-wrapper">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => {
                                        setNewComment(e.target.value);
                                        autoGrow(e.target);
                                    }}
                                    placeholder="Write a comment..."
                                    className="blog-comment-textarea textarea"
                                    maxLength={250}
                                    rows={1}
                                />
                                <div className="blog-comment-charcounter">
                                    {newComment.length}/250
                                </div>
                            </div>
                            <button
                                className="fancy-button"
                                onClick={handleCommentPost}
                            >
                                Post
                            </button>
                        </div>
                    ) : (
                        <p>Log in to comment!</p>
                    )}

                    {comments.length === 0 ? (
                        <p>No comments yet.</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment._id} className="blog-comments">
                                <div className="blog-comment-details">
                                    <BlogAuthor user={comment.createdBy} date={comment.createdAt} />
                                    {user && comment.createdBy._id === user.id && (
                                        <button className="blog-interact-button delete" onClick={() => handleDeleteComment(comment._id)}>
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <p className="blog-comment-content">{comment.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default Blog;
