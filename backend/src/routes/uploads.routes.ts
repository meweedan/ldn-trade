// backend/src/routes/uploads.routes.ts
import { Router } from "express";
import multer from "multer";
import { put } from "@vercel/blob";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // <-- buffer, no disk

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file required" });

    const key = `uploads/${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;
    const { url } = await put(key, req.file.buffer, {
      access: "public",
      contentType: req.file.mimetype,
      addRandomSuffix: false,
    });

    // store `url` in your table (banner, course image, etc.)
    // await prisma.banner.update({ data: { imageUrl: url }, ... })

    return res.json({ ok: true, url });
  } catch (e: any) {
    console.error("upload failed:", e);
    return res.status(500).json({ ok: false, error: "upload_failed" });
  }
});

export default router;
