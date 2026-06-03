import multer from "multer";
import cloudinary from "../confiq/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    resource_type: "auto",
    folder: "my-app-media",
    public_id: Date.now() + "_" + file.originalname,
  }),
});
import path from "path";

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "video/mp4",
    ];

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".mp4"];

    const ext = path.extname(file.originalname).toLowerCase();

    if (
      allowedMimeTypes.includes(file.mimetype) ||
      allowedExtensions.includes(ext)
    ) {
      return cb(null, true);
    }

    cb(new Error("Only images and mp4 videos allowed"));
  },
});

export default upload;
