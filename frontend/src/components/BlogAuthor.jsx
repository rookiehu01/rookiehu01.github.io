import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function BlogAuthor({ user, date }) {
    const navigate = useNavigate();
    const [author, setAuthor] = useState(user);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/users/${user.username}`);
                const data = await res.json();
                setAuthor(data);
            } catch (err) {
                setAuthor(user);
            }
        };
        fetchUser();
    }, [user.username]);

    const avatarUrl = author.avatar ? `/api${author.avatar}` : `/api/public/defaultavatar.jpg`;

    return (
        <div className="blog-data">
            <div className="blog-author-avatar">
                <img src={avatarUrl} alt="user-avatar" className="user-avatar pointer" onClick={() => navigate(`/author/${author.username}`)} />
            </div>
            <div className="blog-details">
                <p className="blog-author-name pointer" onClick={() => navigate(`/author/${author.username}`)}>{author.username}</p>
                <p>{new Date(date).toLocaleDateString("hu-HU", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                })}</p>
            </div>
        </div>
    );
}

export default BlogAuthor;
