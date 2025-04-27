import { useNavigate } from "react-router-dom";
import BlogAuthor from "../components/BlogAuthor.jsx";
import { BACKEND } from "../components/config.jsx";


function BlogList({ blogs }) {
  const navigate = useNavigate();

  if (!blogs || blogs.length === 0) {
    return (
      <div className="no-blogs">
        <h2>No blogs found</h2>
      </div>
    );
  }

  return (
    <div>
      {blogs.map((blog) => {
        const hasCoverImage = blog.images && blog.images.length > 0 && typeof blog.coverImageIndex === 'number' && blog.coverImageIndex < blog.images.length;
        const coverImage = hasCoverImage ? blog.images[blog.coverImageIndex] : null;
        const imageToDisplay = coverImage;

        return (
          <div
            key={blog._id}
            className="blogs-card"
            onClick={() => navigate(`/blog/${blog._id}`)}
          >
            <div className="blogs-card-left">
              <div
                className="blogs-card-image"
                style={imageToDisplay ? {
                  backgroundImage: `url(${BACKEND}/uploads/blog-images/${imageToDisplay})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
              >
                {!imageToDisplay && <div className="blogs-card-placeholder">✖</div>}
              </div>
            </div>

            <div className="blogs-card-center">
              <h2 className="blogs-card-title">{blog.title}</h2>
              <p className="blogs-card-content">
                {blog.content.length > 20
                  ? `${blog.content.slice(0, 100)}...`
                  : blog.content}
              </p>
              <p className="blogs-card-stats">
                <span style={{ color: "#00bfff" }}>❤</span> {blog.likes.length}
                <span style={{ color: "#00bfff", marginLeft: '10px' }}>💬</span> {blog.commentCount}
              </p>
            </div>
            <div className="blogs-card-right">
              <BlogAuthor user={blog.createdBy} date={blog.createdAt} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BlogList;
