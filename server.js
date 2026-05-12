const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Server Running Successfully");
});

app.get("/status", (req, res) => {
  res.json({
    success: true,
    message: "Server is online"
  });
});

app.post("/api/test", (req, res) => {
  const data = req.body;

  res.json({
    success: true,
    received: data
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
