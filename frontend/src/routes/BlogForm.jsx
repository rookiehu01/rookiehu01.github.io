import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import { useEffect, useState } from "react";
import Alert from "../components/Alert.jsx";

function BlogForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [attachments, setAttachments] = useState([]);
  const [coverIndex, setCoverIndex] = useState(null);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [removedAttachmentIndexes, setRemovedAttachmentIndexes] = useState([]);
  const MAX_IMAGES = 10;

  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    content: ""
  });

  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (isEditMode) {
      fetchBlog();
    } else {
      setCoverIndex(null);
    }
  }, [user]);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`/api/blogs/${id}`);
      const data = await res.json();

      if (data.message === "Blog not found") {
        navigate("/notfound");
        return;
      }

      if (!res.ok) {
        setAlert({
          title: "Error",
          message: data.message || "Blog not found",
          color: "red"
        });
        return;
      }

      if (data.createdBy._id !== user.id) {
        navigate("/");
        return;
      }

      setFormData({ title: data.title, content: data.content });
      setExistingAttachments(data.images || []);
      setCoverIndex(
        data.coverImageIndex !== undefined && data.coverImageIndex !== null
          ? `existing-${data.coverImageIndex}`
          : null
      );
    } catch (err) {
      setAlert({
        title: "Error",
        message: err.message,
        color: "red"
      });
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

    if (e.target.name === "content") {
      autoGrow(e.target);
    }
  };

  const autoGrow = (element) => {
    element.style.height = "inherit";
    element.style.height = `${element.scrollHeight}px`;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImagesCount = files.length + (existingAttachments.length - removedAttachmentIndexes.length);

    if (totalImagesCount > MAX_IMAGES) {
      setAlert({
        title: "Too many images",
        message: `You can upload a maximum of ${MAX_IMAGES} images per blog post. Please reduce the number of images.`,
        color: "red"
      });
      e.target.value = '';
      return;
    }

    setAttachments(files);
  };

  const handleRemoveAttachment = (index, isExisting) => {
    if (isExisting) {
      setRemovedAttachmentIndexes(prev => [...prev, index]);
    } else {
      setAttachments(prev => prev.filter((_, i) => i !== index));
    }

    if (coverIndex === (isExisting ? `existing-${index}` : `new-${index}`)) {
      setCoverIndex(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalImagesCount = attachments.length + (existingAttachments.length - removedAttachmentIndexes.length);
    if (totalImagesCount > MAX_IMAGES) {
      setAlert({
        title: "Too many images",
        message: `You can upload a maximum of ${MAX_IMAGES} images per blog post. You currently have ${totalImagesCount}.`,
        color: "red"
      });
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);

      attachments.forEach((file) => {
        data.append("images", file);
      });

      if (isEditMode) {
        data.append("remove", JSON.stringify(removedAttachmentIndexes));
        data.append("blogId", id);
      }

      if (coverIndex !== null) {
        data.append("coverIndex", coverIndex);
      }

      const url = isEditMode
        ? `/api/blogs/edit`
        : `/api/newblog`;
      const method = isEditMode ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${user.token}`
        },
        body: data
      });

      const result = await res.json();

      if (!res.ok) {
        setAlert({
          title: "Error",
          message: result.message || (isEditMode ? "Failed to edit blog" : "Failed to create blog"),
          color: "red"
        });
        return;
      }

      navigate(isEditMode ? `/blog/${id}` : "/");
    } catch (error) {
      setAlert({
        title: "Network error",
        message: error.message,
        color: "red"
      });
    }
  };

  const getRemainingImageCount = () => {
    const existingCount = existingAttachments.length - removedAttachmentIndexes.length;
    const newCount = attachments.length;
    return MAX_IMAGES - (existingCount + newCount);
  };

  return (
    <div className="blogform-page">
      {alert && (
        <Alert
          title={alert.title}
          message={alert.message}
          color={alert.color}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="blogform-container">
        <h1>{isEditMode ? "Edit Your Blog" : "Create New Blog"}</h1>
        <form className="blogform-form" onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Blog title"
            maxLength={40}
          />

          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            placeholder={isEditMode ? "Update your blog content..." : "Write your blog content here..."}
            rows={6}
            className="textarea"
          />

          <label htmlFor="attachments">
            Attachments ({getRemainingImageCount()} of {MAX_IMAGES} images remaining)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={getRemainingImageCount() <= 0}
          />

          <div className="attachment-preview-container">
            {existingAttachments.map((img, index) => {
              if (removedAttachmentIndexes.includes(index)) return null;
              const globalIndex = `existing-${index}`;
              const isCover = coverIndex === globalIndex;
              return (
                <div
                  key={globalIndex}
                  className={`attachment-preview ${isCover ? "selected" : ""}`}
                >
                  <img src={`/api/uploads/blog-images/${img}`} alt={`existing-${index}`} />
                  <p>{img.length > 20 ? img.substring(0, 17) + '...' : img}</p>
                  <div className="attachment-actions">
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index, true)}
                      className="blog-interact-button delete"
                    >
                      Remove
                    </button>
                    {isCover ? (
                      <button
                        type="button"
                        onClick={() => setCoverIndex(null)}
                        className="fancy-button"
                      >
                        Remove Cover
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCoverIndex(globalIndex)}
                        className="fancy-button"
                      >
                        Set as Cover
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {attachments.map((file, index) => {
              const globalIndex = `new-${index}`;
              const isCover = coverIndex === globalIndex;
              return (
                <div
                  key={globalIndex}
                  className={`attachment-preview ${isCover ? "selected" : ""}`}
                >
                  <img src={URL.createObjectURL(file)} alt={`new-${index}`} />
                  <p>{file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name}</p>
                  <div className="attachment-actions">
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index, false)}
                      className="blog-interact-button delete"
                    >
                      Remove
                    </button>
                    {isCover ? (
                      <button
                        type="button"
                        onClick={() => setCoverIndex(null)}
                        className="fancy-button"
                      >
                        Remove Cover
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCoverIndex(globalIndex)}
                        className="fancy-button"
                      >
                        Set as Cover
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button type="submit" className="fancy-button">
            {isEditMode ? "Edit" : "Publish"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BlogForm;
