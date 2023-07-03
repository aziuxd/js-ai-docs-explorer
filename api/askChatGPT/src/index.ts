import * as dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import { requestGPTCompletion } from "../../helpers";
import LanguageDetect from "languagedetect";
import { Configuration, OpenAIApi } from "openai";
import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
  },
});

const config = new Configuration({
  organization: "org-JhTBz8SPoOJ4KHpwSAGwWqXz",
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(config);

io.on("connection", (socket) => {
  socket.on("askChatGPT", async (data) => {
    const { query } = data;
    console.log(query);
    try {
      if (typeof query !== "string" || query === "") {
        console.log("no valid query");
        socket.emit("err", { msg: "Not valid query" });
      }
      const langDetector = new LanguageDetect();
      const prob = langDetector.detect(query);
      const res = await fetch(`http://localhost:4000/cognitive/${query}`);
      if (!res.ok) {
        socket.emit("err", { msg: "No data" });
      } else {
        const apiData = await res.json();
        const { data: parsedData }: { data: string[] } = apiData;
        //possibility of having a response either in italian (if your query matches italian) or english in any other case
        const newQuery = `${query}, ${
          prob[0][0] === "italian" ? "sapendo che" : "knowing that"
        }: ${parsedData?.slice(0, 15)}`;

        const { data } = await openai.createChatCompletion(
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

        socket.emit("askChatGPTResponse", {
          data: `${
            prob[0][0] === "italian"
              ? "Secondo la documentazione: "
              : "The documentation says: "
          }`,
        });

        //@ts-ignore
        data.on("data", (text) => {
          const lines = text
            .toString()
            .split("\n")
            //@ts-ignore
            .filter((line) => line.trim() !== "");
          for (const line of lines) {
            const message = line.replace(/^data: /, "");
            if (message === "[DONE]") {
              socket.emit("askChatGPTResponse", { data: "DONE" });
              return;
            }
            try {
              const { choices } = JSON.parse(message);
              const progressiveData = choices[0]?.delta?.content;
              socket.emit("askChatGPTResponse", { data: progressiveData });
            } catch (err) {
              console.log(err);
            }
          }
        });

        //@ts-ignore
        data.on("close", () => {
          console.log("close");
        });

        /*let gptRes = await requestGPTCompletion(newQuery);
    if (parsedData?.length)
      gptRes = `${
        prob[0][0] === "italian"
          ? "Secondo la documentazione"
          : "The documentation says"
      }: \n${gptRes}`;

    return JSON.stringify(parsedData?.slice(0, 15));
    socket.emit("askChatGPTResponse", data);*/
      }
    } catch (err) {
      console.log(err);
      socket.emit("err", { msg: err });
    }
  });

  socket.on("ciao", (data) => {
    console.log(data);
  });
});

io.listen(8000);

/*async function start() {
  const app = fastify();

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
  });

  const openai = new OpenAIApi(configuration);

  await app.register(cors, {
    origin: "http://localhost:3000",
    allowedHeaders: ["Authorization", "Content-Type"],
  });

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

/*let gptRes = await requestGPTCompletion(newQuery);
      if (parsedData?.length)
        gptRes = `${
          prob[0][0] === "italian"
            ? "Secondo la documentazione"
            : "The documentation says"
        }: \n${gptRes}`;

      return JSON.stringify(parsedData?.slice(0, 15));
    } catch (err) {
      return new Error(`Err: ${err}`);
    }
  });

  app.listen({ port: 8000 });
}

start()
  .then(() => console.log("Client connected"))
  .catch((err) => console.error(err));*/
