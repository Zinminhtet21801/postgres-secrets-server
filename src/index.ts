require("dotenv").config();
import { Request, Response } from "express";
import "reflect-metadata";
import {
  createConnection,
  ConnectionOptions,
  getConnectionOptions,
} from "typeorm";
import { Secrets } from "./entity/Secrets";

const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const https = require("https");
const fs = require("fs");

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

const server = https.createServer(options, app);
server.listen(PORT, () => {
  console.log("STARTED");
});

createConnection({
  type: "postgres",
  url: process.env.DATABASE_URL,
  logging: false,
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: ["src/entity/**/*.ts"],
})
  .then(async (connection) => {
    const secretRepo = connection.getRepository(Secrets);
    //Get All Secrets
    app.get("/getAll", async (req: Request, res: Response) => {
      const secret = new Secrets();
      const result = await secretRepo.find();
      res.json(result);
    });

    //Post a secret
    app.post("/", async (req: Request, res: Response) => {
      const { title, body } = req.body;

      console.log("Inserting a new secret into the database...");
      const secret = new Secrets();
      secret.title = title;
      secret.body = body;
      const saveSecret = await secretRepo.save(secret);
      connection.createQueryBuilder().delete().from(Secrets).execute();
      res.json(saveSecret);
    });

    // Update a secret
    app.put("/", async (req: Request, res: Response) => {
      const { id, title, body } = req.body;
      const secretUpdate = await secretRepo.findOne({ id: id });
      secretUpdate.title = title;
      secretUpdate.body = body;
      const result = await secretRepo.save(secretUpdate);
      res.json(result);
    });

    //Delete a secret
    app.delete("/", async (req: Request, res: Response) => {
      const { id } = req.body;
      const secretDelete = await secretRepo.findOne({ id: id });
      console.log(secretDelete);

      const result = await secretRepo.remove(secretDelete);
      res.json(result);
    });
  })
  .catch((error) => console.log(error));
