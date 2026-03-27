import { Router } from "express";
import multer from "multer";
import mammoth from "mammoth";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const nameOk =
      file.originalname.match(/\.(pdf|doc|docx)$/i) !== null;

    if (allowed.includes(file.mimetype) || nameOk) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Word documents (.pdf, .doc, .docx) are supported"));
    }
  },
});

router.post("/parse-cv", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const { mimetype, buffer, originalname } = req.file;
  let text = "";

  try {
    const isPdf =
      mimetype === "application/pdf" ||
      originalname.toLowerCase().endsWith(".pdf");

    const isDocx =
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      originalname.toLowerCase().endsWith(".docx");

    const isDoc =
      mimetype === "application/msword" ||
      originalname.toLowerCase().endsWith(".doc");

    if (isPdf) {
      const { default: pdfParse } = await import("pdf-parse");
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (isDocx || isDoc) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      res.status(400).json({
        error:
          "Unsupported file type. Please upload a PDF or Word document (.pdf, .doc, .docx).",
      });
      return;
    }

    const cleaned = text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleaned) {
      res.status(422).json({
        error:
          "Could not extract text from the file. It may be a scanned image-based document. Please paste the text manually instead.",
      });
      return;
    }

    req.log.info(
      { filename: originalname, chars: cleaned.length },
      "CV parsed successfully"
    );

    res.json({ text: cleaned, filename: originalname });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    req.log.error({ err, filename: originalname }, "CV parse failed");
    res.status(500).json({ error: `Failed to parse file: ${message}` });
  }
});

export default router;
