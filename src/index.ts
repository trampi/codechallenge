import express from "express";

const app = express();
const port = 3000;

app.set("view engine", "hbs");

app.get("/", (_req, res) => {
  res.render("index", { name: "test" });
});
app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
