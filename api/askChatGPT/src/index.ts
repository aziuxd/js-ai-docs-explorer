import * as dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import LanguageDetect from "languagedetect";
import { Configuration, OpenAIApi } from "openai";
import { Server } from "socket.io";

interface GptMessage {
  role: "assistant" | "user" | "function" | "system";
  content: string;
}

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

const msgs: GptMessage[] = [];

io.on("connection", (socket) => {
  socket.on("askChatGPT", async (data) => {
    console.log("enpoint hit");
    const { query, temperature, model, variant } = data;
    //console.log("msg: ", ms);
    //const msgs: GptMessage[] = [] as GptMessage[];
    try {
      if (typeof query !== "string" || query === "") {
        socket.emit("err", { msg: "Not valid query" });
      }
      const langDetector = new LanguageDetect();
      const prob = langDetector.detect(query);
      const res = await fetch(`http://localhost:4000/cognitive/${query}`);
      /*if (!res.ok) {
        //socket.emit("err", { msg: "No data", originalQuery: query });
      } else {*/
      const apiData = await res.json();
      const { data: parsedData }: { data: string[] } = apiData;
      //possibility of having a response either in italian (if your query matches italian) or english in any other case
      const newQuery = `${query}, ${
        prob[0][0] === "italian" ? "sapendo che" : "knowing that"
      }: ${parsedData?.slice(0, 15)}`;

      msgs.push({ role: "user", content: newQuery });

      console.log(msgs.filter(({ role }) => role === "system"));
      const { data } = await openai.createChatCompletion(
        {
          model: model ? model : "gpt-3.5-turbo-16k",
          messages: msgs,
          temperature: temperature ? temperature : 0.1,
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
        originalQuery: query,
        variant,
      });

      let gptRes = `${
        prob[0][0] === "italian"
          ? "Secondo la documentazione: "
          : "The documentation says: "
      }`;

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
            msgs.push({ role: "system", content: gptRes });
            //console.log(msgs.filter(({ role }) => role === "system"));
            socket.emit("askChatGPTResponse", { data: "DONE" });
            return;
          }
          try {
            const { choices } = JSON.parse(message);
            console.log(choices);
            const progressiveData = choices[0]?.delta?.content;
            gptRes += progressiveData;
            socket.emit("askChatGPTResponse", {
              data: progressiveData,
              originalQuery: query,
              finishReason: choices[0]?.finish_reason,
            });
          } catch (err) {
            socket.emit("err", { msg: err });
          }
        }
      });

      //@ts-ignore
      data.on("close", () => {});
      //}
    } catch (err) {
      socket.emit("err", { msg: err });
    }
  });
});

io.listen(8000);
