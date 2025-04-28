import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import { useEffect, useState, useRef } from "react";
import BlogList from "../components/BlogList.jsx";
import Alert from "../components/Alert.jsx";

function Author() {
    const { username: paramUsername } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const [blogs, setBlogs] = useState([]);
    const [alert, setAlert] = useState(null);
    const [visibleCount, setVisibleCount] = useState(3);
    const [blogStats, setBlogStats] = useState({ blogs: 0, likes: 0, comments: 0 });
    const [authorData, setAuthorData] = useState(null);

    const username = paramUsername || user?.username;
    const isOwnProfile = user?.username === username;
    const inputRef = useRef();

    useEffect(() => {
        if (!username) {
            navigate("/notfound");
            return;
        }

        const fetchAuthor = async () => {
            try {
                const res = await fetch(`https://rookiehu.ddns.net/users/${username}`);
                const data = await res.json();
                setAuthorData(data);
            } catch (err) {
                setAuthorData(null);
            }
        };
        fetchAuthor();

        const checkUser = async () => {
            try {
                const res = await fetch(`https://rookiehu.ddns.net/users`);
                const users = await res.json();
                const exists = users.some(u => u.username === username);
                if (!exists) {
                    navigate("/notfound");
                }
            } catch (err) {
                setAlert({
                    title: "Error",
                    message: err.message,
                    color: "red"
                });
            }
        };
        checkUser();

        const fetchData = async () => {
            try {
                const res = await fetch(`https://rookiehu.ddns.net/blogs`);
                const data = await res.json();

                const filtered = data.filter(blog => blog.createdBy?.username === username);
                setBlogs(filtered);

                const blogCount = filtered.length;
                const likeCount = filtered.reduce((sum, blog) => sum + (blog.likes?.length || 0), 0);

                setBlogStats(prev => ({ ...prev, blogs: blogCount, likes: likeCount }));
            } catch (err) {
                setAlert({
                    title: "Error",
                    message: err.message,
                    color: "red"
                });
            }
        };

        const fetchComments = async () => {
            try {
                const res = await fetch(`https://rookiehu.ddns.net/comments?user=${username}`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setBlogStats(prev => ({ ...prev, comments: data.length }));
                }
            } catch { }
        };

        fetchData();
        fetchComments();
    }, [username]);

    if (alert) return <Alert {...alert} onClose={() => setAlert(null)} />;

    const fullName = isOwnProfile && user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : null;

    const handleDeleteProfile = async () => {
        setAlert(null);
        try {
            const res = await fetch(`https://rookiehu.ddns.net/users/${user.username}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (!res.ok) {
                setAlert({ title: "Error", message: data.message || "Failed to delete profile", color: "red" });
                return;
            }
            logout();
            navigate("/login");
        } catch (err) {
            setAlert({ title: "Error", message: err.message, color: "red" });
        }
    };

    const handleAvatarUpdate = () => {
        if (inputRef.current) inputRef.current.click();
    };

    return (
        <div className="author-page">
            <h1 className="author-title">
                <img
                    src={`https://rookiehu.ddns.net${authorData?.avatar || "/public/defaultavatar.jpg"}`}
                    alt="user-avatar-big"
                    className={`user-avatar-big${isOwnProfile ? " pointer" : ""}`}
                    {...(isOwnProfile ? { onClick: handleAvatarUpdate } : {})}
                />
                {isOwnProfile && fullName
                    ? `${fullName} (${username})`
                    : `${username}'s profile`
                }
            </h1>

            {isOwnProfile && (
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                    <button
                        className="blog-interact-button delete"
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                    >
                        Logout
                    </button>
                    <button
                        className="blog-interact-button delete"
                        style={{ backgroundColor: 'black' }}
                        onClick={() => setAlert({
                            title: "Delete Profile",
                            message: (
                                <div>
                                    <p>Are you sure you want to delete your profile? This cannot be undone!</p>
                                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", justifyContent: "center" }}>
                                        <button className="blog-interact-button delete" onClick={handleDeleteProfile}>
                                            Yes, delete
                                        </button>
                                        <button className="blog-interact-button" onClick={() => setAlert(null)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ),
                            color: "red",
                            onClose: () => setAlert(null)
                        })}
                    >
                        Delete Profile
                    </button>
                </div>
            )}

            <div className="author-stats">
                <div className="author-stat-box">
                    <div className="author-stat-content">
                        <h2>Blogs posted</h2>
                        <h2>{blogStats.blogs}</h2>
                    </div>
                </div>
                <div className="author-stat-box">
                    <div className="author-stat-content">
                        <h2>Likes</h2>
                        <h2>{blogStats.likes}</h2>
                    </div>
                </div>
                <div className="author-stat-box">
                    <div className="author-stat-content">
                        <h2>Comments made</h2>
                        <h2>{blogStats.comments}</h2>
                    </div>
                </div>
            </div>

            <div className="author-blogs">
                <div className="blogs-list">
                    <BlogList blogs={[...blogs].reverse().slice(0, visibleCount)} />
                </div>
                {blogs.length > visibleCount && (
                    <div className="author-show-more">
                        <button className="fancy-button" onClick={() => setVisibleCount(c => c + 3)}>
                            Show more
                        </button>
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={inputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("avatar", file);
                    try {
                        const res = await fetch(`https://rookiehu.ddns.net/users/${user.username}/avatar`, {
                            method: "POST",
                            headers: { Authorization: `Bearer ${user.token}` },
                            body: formData
                        });
                        const data = await res.json();
                        if (!res.ok) {
                            setAlert({ title: "Error", message: data.message || "Upload failed", color: "red" });
                            return;
                        }
                        window.location.reload();
                    } catch (err) {
                        setAlert({ title: "Error", message: err.message, color: "red" });
                    }
                }}
            />
        </div>
    );
}

export default Author;
