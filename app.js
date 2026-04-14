const express = require("express");
const axios = require("axios");

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

app.get("/api/classify", async (req, res) => {
  const { name } = req.query;

  if (name === undefined || name === "") {
    return res.status(400).json({
      status: "error",
      message: "Missing or empty name parameter",
    });
  }


  if (typeof name !== "string") {
    return res.status(422).json({
      status: "error",
      message: "name must be a string",
    });
  }

  try {
    const { data: genderizeData } = await axios.get(
      `https://api.genderize.io/?name=${encodeURIComponent(name)}`,
      { timeout: 4500 },
    );

    if (!genderizeData.gender || genderizeData.count === 0) {
      return res.status(200).json({
        status: "error",
        message: "No prediction available for the provided name",
      });
    }

    const { gender, probability } = genderizeData;
    const sample_size = genderizeData.count;
    const is_confident = probability >= 0.7 && sample_size >= 100;

    return res.status(200).json({
      status: "success",
      data: {
        name: name.toLowerCase(),
        gender,
        probability,
        sample_size,
        is_confident,
        processed_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err.response) {
      return res.status(502).json({
        status: "error",
        message: "Bad response from upstream API",
      });
    }
    if (err.code === "ECONNABORTED") {
      return res.status(504).json({
        status: "error",
        message: "Upstream API timed out",
      });
    }
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

module.exports = app;
