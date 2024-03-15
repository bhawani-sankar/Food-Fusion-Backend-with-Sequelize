import app from "./index.mjs";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server run at http://localhost:${port}`);
});
