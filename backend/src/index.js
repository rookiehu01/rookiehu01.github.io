import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config()
const { DB_USER, DB_PASSWORD, DB_URL, DB_DB, TOKEN_SECRET, PORT } = process.env
const mongoStr = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}/?retryWrites=true&w=majority&appName=Cluster0`

const uploadDir = './uploads/blog-images/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Images only! (JPEG, JPG, PNG, GIF, WEBP)");
    }
  }
});

mongoose.connect(mongoStr, {
  dbName: DB_DB
})

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, index: true, maxlength: 16 },
  password: { type: String, required: true, select: false },
  firstName: { type: String, trim: true, required: true },
  lastName: { type: String, trim: true, required: true },
  registeredAt: { type: Date, select: false, default: Date.now },
  avatar: { type: String, default: "/public/defaultavatar.jpg" },
})

userSchema.set("toJSON", {
  virtuals: true
})
const User = mongoose.model("User", userSchema)

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true, maxlength: 40 },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  updatedAt: { type: Date, default: null },
  images: [{ type: String }],
  coverImageIndex: { type: Number, default: null },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
})
blogSchema.set("toJSON", {
  virtuals: true
})
const Blog = mongoose.model("Blog", blogSchema)

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  blogId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Blog" }
})
commentSchema.set("toJSON", {
  virtuals: true
})
const Comment = mongoose.model("Comment", commentSchema)

mongoose.connection.once("open", async () => {
  console.log("Connected to mongo")
}).on("error", (err) => {
  console.log("Error", err)
})


const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors());

app.use('/uploads', express.static('uploads'))
app.use('/public', express.static('public'))


const authMW = async (req, res, next) => {
  try {
    const token = req.headers?.authorization?.replace("Bearer ", "")
    const { userId } = await jwt.verify(token, TOKEN_SECRET)
    req.userId = userId
    next()
  }
  catch (error) {
    next(error);
  }
}

const ownMW = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next("Blog not found")
    }

    const blog = await Blog.findById(id)
    if (!blog) return next("Blog not found");
    if (blog.createdBy.toString() === req.userId) {
      req.blog = blog;
      next()
    } else {
      next("Not authorized")
    }
  } catch (error) {
    next("error")
  }
}


// POST /login
app.post("/login", async (req, res, next) => {
  const { username, password } = req.body
  const user = await User.findOne({ username }).select("+password")
  if (!user) {
    next("Invalid username or password")
  } else {
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      next("Invalid username or password")
    } else {
      const token = await jwt.sign({ userId: user.id }, TOKEN_SECRET, { expiresIn: "1h" })
      res.json({ token })
    }
  }
})


// POST /register
app.post("/register", async (req, res, next) => {
  const { username, password, firstName, lastName } = req.body
  const user = await User.findOne({ username })
  if (user) {
    next("User already exists")
  } else {
    const hashedPassword = await bcrypt.hash(password, 10)
    const createdUser = await User.create({ username, password: hashedPassword, firstName, lastName })
    res.json({ id: createdUser.id, username: createdUser.username })
  }
})


// GET /me
app.get("/me", authMW, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password")
    if (!user) {
      next("User not found")
    } else {
      res.json(user)
    }
  } catch (error) {
    next(error)
  }
})


// GET /blogs
app.get("/blogs", async (req, res, next) => {
  try {
    const blogs = await Blog.find().populate("createdBy", "username");

    const blogsWithComments = await Promise.all(
      blogs.map(async (blog) => {
        const commentCount = await Comment.countDocuments({ blogId: blog._id });
        return { ...blog.toObject(), commentCount };
      })
    );

    res.json(blogsWithComments);
  } catch (error) {
    next(error);
  }
})


// GET /blogs/:id
app.get("/blogs/:id", async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next("Blog not found")
    }

    const blog = await Blog.findById(id).populate("createdBy", "username")
    if (!blog) {
      next("Blog not found")
    } else {
      res.json(blog)
    }
  } catch (error) {
    next(error)
  }
})


// POST /newblog
app.post("/newblog", authMW, upload.array("images", 10), async (req, res, next) => {
  try {
    const { title, content, coverIndex } = req.body;

    const imageFiles = req.files || [];

    if (imageFiles.length > 10) {
      return next("Maximum of 10 images allowed per blog post");
    }

    const imageFilenames = imageFiles.map(file => file.filename);

    const blog = await Blog.create({
      title,
      content,
      createdBy: req.userId,
      images: imageFilenames,
      coverImageIndex: coverIndex !== undefined ? Number(coverIndex.replace('new-', '')) : null
    });

    res.json(blog);
  } catch (error) {
    next(error);
  }
})

// PUT /blogs/edit
app.put("/blogs/edit", authMW, upload.array("images", 10), async (req, res, next) => {
  try {
    const { title, content, blogId, coverIndex, remove } = req.body;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return next("Blog not found");
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return next("Blog not found");
    }

    if (blog.createdBy.toString() !== req.userId) {
      return next("Not authorized");
    }

    let currentImages = [...(blog.images || [])];
    if (remove) {
      const indexesToRemove = JSON.parse(remove);

      indexesToRemove.forEach(index => {
        const filename = currentImages[index];
        if (filename) {
          const filePath = path.join(uploadDir, filename);
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.log("Failed to delete file:", filePath, err);
          }
        }
      });

      currentImages = currentImages.filter((_, index) => !indexesToRemove.includes(index));
    }

    const newImages = req.files.map(file => file.filename);
    const allImages = [...currentImages, ...newImages];

    if (allImages.length > 10) {
      newImages.forEach(filename => {
        try {
          fs.unlinkSync(path.join(uploadDir, filename));
        } catch (err) {
          console.log("Failed to delete file:", filename, err);
        }
      });

      return next("Maximum of 10 images allowed per blog post");
    }

    let coverImageIndex = null;
    if (coverIndex !== undefined) {
      if (coverIndex.startsWith('existing-')) {
        coverImageIndex = Number(coverIndex.split('-')[1]);
      } else if (coverIndex.startsWith('new-')) {
        const newIndex = Number(coverIndex.split('-')[1]);
        coverImageIndex = currentImages.length + newIndex;
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        title,
        content,
        images: allImages,
        coverImageIndex: coverImageIndex,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json(updatedBlog);
  } catch (error) {
    next(error);
  }
})


// PATCH /blogs/:id/like
app.patch("/blogs/:id/like", authMW, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("likes", "username _id");
    if (!blog) return next("Blog not found");

    const userId = req.userId;

    if (blog.createdBy.toString() === userId) {
      return res.json({
        likers: blog.likes.map(user => user.username)
      });
    }

    const alreadyLiked = blog.likes.some(user => user._id.toString() === userId);

    if (alreadyLiked) {
      blog.likes = blog.likes.filter(user => user._id.toString() !== userId);
    } else {
      blog.likes.push(userId);
    }

    await blog.save();

    res.json({
      message: alreadyLiked ? "Unliked" : "Liked",
      likes: blog.likes.length
    });

  } catch (error) {
    next(error);
  }
});


// DELETE /blogs/:id
app.delete("/blogs/:id", authMW, ownMW, async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = req.blog;

    if (blog.images && blog.images.length > 0) {
      blog.images.forEach(filename => {
        const filePath = path.join(uploadDir, filename);
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.log("Failed to delete file:", filePath, err);
        }
      });
    }

    await Blog.findByIdAndDelete(id);
    await Comment.deleteMany({ blogId: id });

    res.json({ message: "Blog deleted" });
  } catch (error) {
    next(error);
  }
});


// POST /blogs/:id/comments
app.post("/blogs/:id/comments", authMW, async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return next("Comment cannot be empty");
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next("Blog not found");
    }

    const comment = await Comment.create({
      content,
      createdBy: req.userId,
      blogId: id
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("createdBy", "username");

    res.json(populatedComment);
  } catch (error) {
    next(error);
  }
});


// GET /blogs/:id/comments
app.get("/blogs/:id/comments", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next("Blog not found");
    }

    const comments = await Comment.find({ blogId: req.params.id })
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    next(error);
  }
});


// GET /comments - user comments
app.get("/comments", async (req, res, next) => {
  try {
    const { user: username } = req.query;

    if (!username) {
      return next("Username is required");
    }

    const user = await User.findOne({ username });

    if (!user) {
      return next("User not found");
    }

    const comments = await Comment.find({ createdBy: user._id })
      .populate("blogId", "title");

    res.json(comments);
  } catch (error) {
    next(error);
  }
});


// DELETE /comments/:id
app.delete("/comments/:id", authMW, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next("Comment not found");
    }
    const comment = await Comment.findById(id);
    if (!comment) {
      return next("Comment not found");
    }
    if (comment.createdBy.toString() !== req.userId) {
      return next("Not authorized");
    }
    await Comment.findByIdAndDelete(id);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    next(error);
  }
});


// GET /users
app.get("/users", async (req, res, next) => {
  try {
    const users = await User.find({}, "-password").sort({ username: 1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});


// GET /users/:username
app.get("/users/:username", async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    res.json(user);
    if (!user) {
      return next("User not found");
    }
  } catch (error) {
    next(error);
  }
});


// DELETE /users/:username
app.delete("/users/:username", authMW, async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return next("User not found");
    }
    if (user._id.toString() !== req.userId) {
      return next("Not authorized");
    }
    const blogs = await Blog.find({ createdBy: user._id });
    for (const blog of blogs) {
      if (blog.images && blog.images.length > 0) {
        blog.images.forEach(filename => {
          const filePath = path.join(uploadDir, filename);
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.log("Failed to delete file:", filePath, err);
          }
        });
      }
      await Blog.findByIdAndDelete(blog._id);
      await Comment.deleteMany({ blogId: blog._id });
    }
    await Comment.deleteMany({ createdBy: user._id });
    await Blog.updateMany(
      { likes: user._id },
      { $pull: { likes: user._id } }
    );
    if (
      user.avatar &&
      !user.avatar.includes("defaultavatar") &&
      fs.existsSync(path.join(__dirname, "..", user.avatar))
    ) {
      try {
        fs.unlinkSync(path.join(__dirname, "..", user.avatar));
      } catch (err) {
        console.log("Failed to delete avatar:", user.avatar, err);
      }
    }
    await User.findByIdAndDelete(user._id);
    res.json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
});


// POST /users/:username/avatar
app.post("/users/:username/avatar", authMW, upload.single("avatar"), async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return next("User not found");
    if (user._id.toString() !== req.userId) return next("Not authorized");
    if (!req.file) return next("No file uploaded");

    if (
      user.avatar &&
      !user.avatar.includes("defaultavatar") &&
      fs.existsSync(path.join(__dirname, "..", user.avatar))
    ) {
      fs.unlinkSync(path.join(__dirname, "..", user.avatar));
    }

    user.avatar = `/uploads/blog-images/${req.file.filename}`;
    await user.save();
    res.json({ avatar: user.avatar });
  } catch (error) {
    next(error);
  }
});

// GET /heartbeat
app.get('/heartbeat', async (req, res) => {
  res.json({ connection: 'ok' })
})


app.use((err, req, res, next) => {
  const message = typeof err === "string"
    ? err
    : err?.message || "Unknown server error";
  res.status(500).json({ message, color: "red" })
})

app.listen(PORT, '0.0.0.0', () => {
  console.info(`Server listening on localhost:${PORT}`)
})

