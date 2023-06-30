import * as dotenv from "dotenv";
dotenv.config();
import fastify, { FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import fetch from "node-fetch";
import { requestGPTCompletion } from "../../helpers";
import LanguageDetect from "languagedetect";
import { createSession } from "better-sse";
import { Configuration, OpenAIApi } from "openai";
import { FastifySSEPlugin } from "fastify-sse-v2";

async function start() {
  const app = fastify();

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
  });

  const openai = new OpenAIApi(configuration);

  await app.register(cors, {
    origin: "http://localhost:3000",
    allowedHeaders: ["Authorization", "Content-Type"],
  });

  await app.register(FastifySSEPlugin);

  app.get("/api/AskChatGPT/:query", async (req, reply) => {
    try {
      //@ts-ignore
      const { query } = req.params;
      console.log("got query");
      if (query === "") return JSON.stringify("");
      const langDetector = new LanguageDetect();
      const prob = langDetector.detect(query);
      const res = await fetch(`http://localhost:4000/cognitive/${query}`);
      if (!res.ok) {
        reply.status(404).send({ ok: false });
      }
      const apiData = await res.json();
      const { data: parsedData }: { data: string[] } = apiData;
      //possibility of having a response either in italian (if your query matches italian) or english in any other case
      const newQuery = `${query}, ${
        prob[0][0] === "italian" ? "sapendo che" : "knowing that"
      }: ${parsedData?.slice(0, 15)}`;

      /*const { data } = await openai.createChatCompletion(
        {
          model: "gpt-3.5-turbo-16k",
          messages: [{ role: "user", content: newQuery }],
          temperature: 0.1,
          stream: true,
        },
        {
          responseType: "stream",
        }
      );

      //@ts-ignore
      data.on("data", (text) => {
        console.log(text);
        const lines = text
          .toString()
          .split("\n")
          //@ts-ignore
          .filter((line) => line.trim() !== "");
        for (const line of lines) {
          const message = line.replace(/^data: /, "");
          if (message === "[DONE]") {
            reply?.sse({ data: "DONE" });
            return;
          }
          try {
            const { choices } = JSON.parse(message);
            const r = reply?.sse({ data: choices[0].text });
            console.log(r);
          } catch (err) {
            console.log(err);
          }
        }
      });

      //@ts-ignore
      data.on("close", () => {
        console.log("close");
      });*/

      let gptRes = await requestGPTCompletion(newQuery);
      if (parsedData?.length)
        gptRes = `${
          prob[0][0] === "italian"
            ? "Secondo la documentazione"
            : "The documentation says"
        }: \n${gptRes}`;
      return JSON.stringify(gptRes);
    } catch (err) {
      return new Error(`Err: ${err}`);
    }
  });

  app.listen({ port: 8000 });
}

start()
  .then(() => console.log("Client connected"))
  .catch((err) => console.error(err));
