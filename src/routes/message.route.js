import  express  from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar , getMessages ,  sendMessage } from "../controllers/message.controllers.js"
import { upload } from "../middleware/upload.js";
const router = express.Router();

router.get("/users" , protectRoute , getUsersForSidebar);
router.get("/:id" , protectRoute , getMessages);
// router.post("/send/:id" , protectRoute , sendMessage);
router.post("/send/:id", protectRoute, upload.single("file"), sendMessage);
export default router