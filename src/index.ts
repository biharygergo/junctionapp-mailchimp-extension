import express from "express";
import * as dotenv from "dotenv";
import { onRegistration } from "./mailchimp";

dotenv.config();
const app = express();

app.use(express.json());

app.post("/registration/", (req, res) => {
  return onRegistration(req.body)
    .then((_) => {
      res.json({ success: true });
    })
    .catch((e) => res.json({ success: false, message: e.message }));
});

app.listen(8000, () => {
  console.log("The application is listening on port 8000!");
});
