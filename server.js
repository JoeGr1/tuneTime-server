require("dotenv").config();

const express = require("express");
const app = express();
const PORT = 8080;

console.log(process.env.CLIENT_ID);

app.get("/", (req, res) => {
  const data = {
    name: "joe",
    isLearning: true,
  };
  res.json(data);
});

app.get("/learning-checker", (req, res) => {
  const { name, isLearning } = req.query;

  res.send(
    `${name} is ${JSON.parse(isLearning) ? "leanring" : "not learning"}`
  );
});

app.listen(PORT, () => {
  console.log(`Express App is listening to PORT: ${PORT}`);
});
