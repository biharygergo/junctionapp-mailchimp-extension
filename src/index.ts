import express from "express";
import * as dotenv from "dotenv";
import { onRegistration } from "./mailchimp";
import { validateAPIKey } from "./security";

dotenv.config();
const app = express();

app.use(express.json());

app.post("/registration/", (req, res) => {
  if (!validateAPIKey(req)) {
    res.json({ success: false, message: "Invalid API key" });
    return;
  }

  return onRegistration(req.body)
    .then((_) => {
      res.json({ success: true });
    })
    .catch((e) => res.json({ success: false, message: e.message }));
});

app.listen(process.env.PORT, () => {
  console.log(`The application is listening on port: ${process.env.PORT}`);
});
