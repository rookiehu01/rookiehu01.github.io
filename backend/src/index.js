import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import api from './routes/api.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

dotenv.config()
const { DB_USER, DB_PASSWORD, DB_URL, DB_DB, TOKEN_SECRET, PORT } = process.env
const mongoStr = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.connect(mongoStr, {
  dbName: DB_DB
})

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  firstName: { type: String, trim: true, required: true },
  lastName: { type: String, trim: true, required: true },
  registeredAt: { type: Date, select: false, default: Date.now }
})

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})
userSchema.set("toJSON", {
  virtuals: true
})
const User = mongoose.model("User", userSchema)

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  updatedAt: { type: Date, default: Date.now },
  attachments: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
})
blogSchema.set("toJSON", {
  virtuals: true
})
const Blog = mongoose.model("Blog", blogSchema)

mongoose.connection.once("open", async () => {
  console.log("Connected to mongo")
}).on("error", (err) => {
  console.log("Error", err)
})

const app = express()
app.use('/api', api)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())


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
    const blog = await Blog.findById(id)
    if (todo.createdBy == req.userId) {
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
    next("User not found")
  } else {
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      next("Wrong password")
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
  }catch (error) {
    next(error)
  }
})


// GET /blogs
app.get("/blogs", async (req, res, next) => {
  try {
    const blogs = await Blog.find().populate("createdBy", "username");
    res.json(blogs)
  } catch (error) {
    next(error)
  }
})


// GET /blogs/:id
app.get("/blogs/:id", async (req, res, next) => {
  try {
    const { id } = req.params
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
app.post("/newblog", authMW, async (req, res, next) => {
  const { title, content } = req.body
  const blog = await Blog.create({ title, content, createdBy: req.userId })
  res.json(blog)
})


// POST /blogs/:id/like
app.post("/blogs/:id/like", authMW, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next("Blog not found");

    const userId = req.userId;
    const alreadyLiked = blog.likes.includes(userId);

    if (alreadyLiked) {
      blog.likes = blog.likes.filter(uid => uid.toString() !== userId);
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




app.use((err, req, res, next) => {
  const message = typeof err === "string"
  ? err
  : err?.message || "Unknown server error";
  res.status(500).json({ message, color:"red" })
})

app.listen(PORT, () => {
  console.info(`Server listening on localhost:${PORT}`)
})

