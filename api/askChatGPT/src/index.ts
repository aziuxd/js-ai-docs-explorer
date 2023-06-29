import * as dotenv from "dotenv";
dotenv.config();
import fastify, { FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { Configuration } from "openai";
import fetch from "node-fetch";
import { requestGPTCompletion } from "../../helpers";

async function start() {
  const app = fastify();

  await app.register(cors, {
    origin: "http://localhost:3000",
    allowedHeaders: ["Authorization", "Content-Type"],
  });

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
  });

  app.get("/api/AskChatGPT/:query", async function (req: FastifyRequest, res) {
    try {
      //@ts-ignore
      const { query } = req.params;
      const res = await fetch(`http://localhost:4000/cognitive/${query}`);
      const data = await res.json();
      const { data: parsedData }: { data: string[] } = data;
      if (!parsedData?.length) return "No data matching your query";

      const newQuery = `${query}, sapendo che: ${parsedData.slice(0, 15)}`;

      const gptRes = await requestGPTCompletion(newQuery);

      return JSON.stringify(gptRes);
    } catch (err) {
      return JSON.stringify({ err });
    }
  });

  app.listen({ port: 8000 });
}

start()
  .then(() => console.log("Client connected"))
  .catch((err) => console.error(err));
