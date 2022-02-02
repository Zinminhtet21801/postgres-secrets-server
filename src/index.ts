require("dotenv").config();
import * as express from "express"
import * as cors from "cors"
import { Request, Response } from "express";
import "reflect-metadata";
import {
  createConnection,
  ConnectionOptions,
  getConnectionOptions,
} from "typeorm";
import { Secrets } from "./entity/Secrets";

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const https = require("https");
// const fs = require("fs");

// const options = {
//   key: fs.readFileSync("key.pem"),
//   cert: fs.readFileSync("cert.pem"),
// };

// const server = https.createServer(options, app);
app.listen(PORT, () => {
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

    app.get("/", (req: Request, res: Response) => {
      res.json({
        message : "SHIT"
      })
    })

    const secretRepo = connection.getRepository(Secrets);
    //Get All Secrets
    app.get("/getAll/:page", async (req: Request, res: Response) => {
      const { page } = req.params;
      const secrets = await secretRepo
        .createQueryBuilder("secrets")
        .skip(12 * parseInt(page))
        .take(12)
        .orderBy("secrets.createdAt", "DESC")
        .getManyAndCount();
      res.json(secrets);
    });

    //Post a secret
    app.post("/", async (req: Request, res: Response) => {
      const { id, title, body, createdAt } = req.body;

      console.log("Inserting a new secret into the database...");
      const secret = new Secrets();
      secret.id = id;
      secret.title = title;
      secret.body = body;
      secret.createdAt = createdAt;
      await secretRepo.save(secret).then((data) => res.json(data));
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
