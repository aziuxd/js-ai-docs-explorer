import * as dotenv from "dotenv";
dotenv.config();
import fastify, { FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { AzureKeyCredential, SearchClient } from "@azure/search-documents";
import { optimizeQuery } from "../../helpers";

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

  app.get("/cognitive/:query", async function (req: FastifyRequest, reply) {
    try {
      //@ts-ignore
      const { query } = req.params;
      const index = process.env.INDEX as string;
      const endpoint = process.env.SEARCH_ENDPOINT as string;
      const api_key = process.env.API_KEY as string;

      const optimizedQuery = optimizeQuery(query);
      const credentials = new AzureKeyCredential(api_key);
      const client = new SearchClient(endpoint, index, credentials);

      let results = await client.search(optimizedQuery, {
        highlightFields: "content",
      });

      let res = [];

      for await (const result of results.results) {
        //@ts-ignore
        for (const curr_highlight of result.highlights?.content) {
          res.push(curr_highlight);
        }
      }

      //if there some cognitive search data return them
      if (res.length) return JSON.stringify({ data: res });
      //if not redo the process without stemming (sometimes this can be the issue)
      else {
        const r = optimizeQuery(query, false);
        console.log(r);
        results = await client.search(optimizeQuery(query, false), {
          highlightFields: "content",
        });

        for await (const result of results.results) {
          //@ts-ignore
          for (const curr_highlight of result.highlights?.content) {
            res.push(curr_highlight);
          }
        }

        if (!res.length) reply.status(404).send({ ok: false });

        console.log(res);

        return JSON.stringify({ data: res });
      }
    } catch (err) {
      return new Error(`Err: ${err}`);
    }
  });

  app.listen({ port: 4000 });
}

start()
  .then(() => console.log("Silwa api running"))
  .catch((err) => console.error(err));
