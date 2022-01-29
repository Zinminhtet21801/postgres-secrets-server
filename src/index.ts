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

https
  .createServer(options, function (req: Request, res: Response) {
    res.writeHead(200);
    res.end("hello world\n");
  })
  .listen(5000);

const getOptions = async () => {
  let connectionOptions: ConnectionOptions;
  connectionOptions = {
    type: "postgres",
    synchronize: false,
    logging: false,
    ssl: {
      rejectUnauthorized: false,
    },
    entities: ["entity/**/*.ts"],
  };
  if (process.env.DATABASE_URL) {
    Object.assign(connectionOptions, { url: process.env.DATABASE_URL });
  } else {
    connectionOptions = await getConnectionOptions();
  }

  return connectionOptions;
};

const connect2Database = async (): Promise<any> => {
  const typeormconfig = await getOptions();
  await createConnection(typeormconfig);
};

connect2Database()
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
