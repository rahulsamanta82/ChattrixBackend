import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../library/cloudinary.js";
import { getReceiverSocketId, io } from "../library/socket.js";

// ================= GET USERS =================
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ================= GET MESSAGES =================
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ================= SEND MESSAGE =================
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID missing" });
    }

    if (!text && !req.file) {
      return res.status(400).json({ error: "Empty message" });
    }

    let fileUrl = null;
    let fileType = null;

    // ================= FILE UPLOAD =================
    if (req.file) {
      try {
        // 🔥 Size limit (optional but smart)
        if (req.file.size > 20 * 1024 * 1024) {
          return res.status(400).json({ error: "File too large (max 20MB)" });
        }

        const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        const uploadResponse = await cloudinary.uploader.upload(base64, {
          resource_type: "auto",
          type: "upload",          // 🔥 FORCE PUBLIC ACCESS
          access_mode: "public",   // 🔥 IMPORTANT
        });

        fileUrl = uploadResponse.secure_url; // ✅ KEEP ORIGINAL URL
        fileType = req.file.mimetype;

      } catch (err) {
        console.log("Cloudinary Error:", err);
        return res.status(500).json({ error: "File upload failed" });
      }
    }

    // ================= SAVE MESSAGE =================
    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || "",
      file: fileUrl,
      fileType: fileType,
    });

    await newMessage.save();

    // ================= SOCKET =================
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);

  } catch (error) {
    console.log("🔥 ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};