import * as dotenv from "dotenv";
dotenv.config();
import fastify, { FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { Configuration, OpenAIApi } from "openai";
import { AzureKeyCredential, SearchClient } from "@azure/search-documents";
import { formatQueryForSearch } from "../../helpers";

async function start() {
  const app = fastify();

  await app.register(cors, {
    origin: [
      "http://localhost:3000",
      "http://localhost:8000/api/AskChatGPT/*",
      "*",
    ],
    allowedHeaders: ["Authorization", "Content-Type"],
  });

  app.get("/cognitive/:query", async function (req: FastifyRequest, res) {
    try {
      //@ts-ignore
      const { query } = req.params;
      const index = process.env.INDEX as string;
      const endpoint = process.env.SEARCH_ENDPOINT as string;
      const api_key = process.env.API_KEY as string;

      const optimizedQuery = formatQueryForSearch(query);
      console.log(optimizedQuery);

      const credentials = new AzureKeyCredential(api_key);
      const client = new SearchClient(endpoint, index, credentials);

      const results = await client.search(optimizedQuery, {
        highlightFields: "content",
      });

      const res = [];

      for await (const result of results.results) {
        //@ts-ignore
        for (const curr_highlight of result.highlights?.content) {
          res.push(curr_highlight);
        }
      }

      return JSON.stringify({ data: res });
    } catch (err) {
      return JSON.stringify({ err });
    }
  });

  app.listen({ port: 4000 });
}

start()
  .then(() => console.log("Silwa api running"))
  .catch((err) => console.error(err));
