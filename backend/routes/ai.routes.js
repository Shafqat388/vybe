import express from "express";
import { chatWithMistral } from "../controllers/ai.controller.js";
import isAuth from "../middlewares/isAuth.js"; // Optional if auth needed

const router = express.Router();

router.post("/ask",  chatWithMistral); // or remove isAuth if open

export default router;
