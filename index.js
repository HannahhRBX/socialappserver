import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { v4 as uuidv4 } from 'uuid';
import multer from "multer";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import {Register,Login,UpdateProfile,UpdatePassword} from "./controllers/UserController.js";
import {CreatePost,GetAllPostsByKeyword} from "./controllers/PostController.js";
import { GetMatchingUsers } from "./controllers/GameController.js";
import helmet from "helmet";
import userRoutes from "./routes/UserRoutes.js";
import gameRoutes from "./routes/GameRoutes.js";
import postRoutes from "./routes/PostRoutes.js";
import {authenticateToken} from "./middleware/Authenticate.js";
//import loginRoute from "./routes/login.js";

// Initialising express app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}))
app.use(express.json());
app.use(bodyParser.json({limit:"30mb", extended: true}));
app.use(bodyParser.urlencoded({limit:"30mb", extended: true}));
app.use(morgan("common"));
app.use(cors());
app.use("/images",express.static(path.join(__dirname,"public/images")))


// Initialising Multer for file uploads
const storage = multer.diskStorage({
    destination: function(req,file,cb) {
        cb(null, "public/images");
    },
    filename: function(req,file,cb) {
        cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    }
})
const upload = multer({storage: storage});

// Setting up routes
app.post("/post",authenticateToken,upload.single("Image"),CreatePost)
app.post("/login",Login);
app.post("/editProfile",upload.single("ProfilePicture"),UpdateProfile);
app.post("/changePassword",authenticateToken,UpdatePassword);
app.post("/register",upload.single("ProfilePicture"),Register);
app.get("/search/:keyword",GetAllPostsByKeyword)
app.get("/matchusers/:id",GetMatchingUsers)
app.use("/users",userRoutes)
app.use("/games",gameRoutes)
app.use("/posts",postRoutes)

// Initialising MongoDB
const PORT = 10000 || 5001;
const DB_URL = "mongodb+srv://admin:Password123@socialapp.7endutk.mongodb.net/?retryWrites=true&w=majority" || "";

// Initialising server
mongoose.connect("mongodb+srv://admin:Password123@socialapp.7endutk.mongodb.net/?retryWrites=true&w=majority").then(()=>{
    app.listen(PORT,() => console.log(`Server listening on Port: ${PORT}`))
}).catch((error)=>console.log(`${error}: failed to connect.`))

