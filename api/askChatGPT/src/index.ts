import * as dotenv from "dotenv";
dotenv.config();
import fastify, { FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { Configuration } from "openai";
import fetch from "node-fetch";
import { requestGPTCompletion } from "../../helpers";
import LanguageDetect from "languagedetect";

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
      const langDetector = new LanguageDetect();
      const prob = langDetector.detect(query);
      const res = await fetch(`http://localhost:4000/cognitive/${query}`);
      const data = await res.json();
      const { data: parsedData }: { data: string[] } = data;
      //possibility of having a response either in italian (if your query matches italian) or english in any other case
      const newQuery = `${query}, ${
        prob[0][0] === "italian" ? "sapendo che" : "knowing that"
      }: ${parsedData.slice(0, 15)}`;

      let gptRes = await requestGPTCompletion(newQuery);
      if (parsedData?.length)
        gptRes = `${
          prob[0][0] === "italian"
            ? "Secondo la documentazione"
            : "The documentation says"
        }: \n${gptRes}`;
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
