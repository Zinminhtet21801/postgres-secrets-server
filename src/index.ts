import { Request, Response } from "express";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { Secrets } from "./entity/Secrets";

const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();
const fs = require("fs");
const https = require("https");
const privateKey = fs.readFileSync("./server.key");
const certificate = fs.readFileSync("./server.cert");
var credentials = { key: privateKey, cert: certificate };
var httpsServer = https.createServer(credentials, app);
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

httpsServer.listen(PORT, () => console.log("SHIT"));

createConnection()
  .then(async (connection) => {
    app.get("/", async (req: Request, res: Response) => {
      const secret = new Secrets();
      const result = await connection.manager.find(Secrets);
      res.json(result);
    });

    app.post("/", async (req: Request, res: Response) => {
      console.log(req.body);

      const { title, body } = req.body;

      console.log("Inserting a new user into the database...");
      const secret = new Secrets();
      secret.title = title;
      secret.body = body;
      const saveSecret = await connection.manager.save(secret);
      res.json(saveSecret);
    });
  })
  .catch((error) => console.log(error));
