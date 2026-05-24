import express from "express";
import multer from "multer";

const app = express();
const upload = multer({ dest: "uploads/" });

// Route تجريبي
app.post("/test", upload.single("file"), (req, res) => {
  // مجرد تجربة: نرجع اسم الملف اللي المستخدم رفعه
  res.json({ message: "تم استلام الملف ✅", file: req.file.originalname });
});

app.listen(3000, () => console.log("NovaClip running on port 3000"));
