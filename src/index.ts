import express from "express";

const app = express();
const port = 3000;
app.get("/", (_req, res) => {
  res.send("hello boilerplate");
});
app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
