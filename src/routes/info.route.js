import express from "express";

const router = express.Router();

router.get("/model", (req, res) => {
  res.json({
    answer: "Mình là một trợ lý AI (mô hình ngôn ngữ) do OpenAI phát triển.",
  });
});

export default router;

