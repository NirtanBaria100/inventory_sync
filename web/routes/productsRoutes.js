import express from "express";
const router = express.Router();

router.get("/batch/:page", (req, res) => {
  return res.status(200).json("working");
});


export default router