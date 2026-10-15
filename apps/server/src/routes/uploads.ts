import { Router, type IRouter, type Request, type Response } from "express";
import { createCloudinaryUploader, isCloudinaryConfigured } from "../lib/cloudinary";
import { uploadLimiter } from "../middleware/publicLimiter";

const upload = createCloudinaryUploader(
  process.env.UPLOAD_FOLDER || "ayesha-fragrances/uploads"
);

const router: IRouter = Router();

/** POST /api/uploads — accepts up to 10 files, uploads them to Cloudinary, returns their secure URLs */
router.post("/uploads", uploadLimiter, (req: Request, res: Response) => {
  if (!isCloudinaryConfigured) {
    res.status(503).json({
      error:
        "Image uploads are not configured on the server yet (Cloudinary keys missing). " +
        "You can still save the product — paste an image URL instead.",
    });
    return;
  }

  const handler = upload.array("files", 10);

  handler(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      res.status(400).json({ error: message });
      return;
    }

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) {
      res.status(400).json({ error: "No files were uploaded" });
      return;
    }

    // multer-storage-cloudinary sets `file.path` to the Cloudinary secure_url.
    const urls = files.map((f) => f.path);
    res.status(201).json({ urls });
  });
});

export default router;