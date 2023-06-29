import * as dotenv from "dotenv";
dotenv.config();
import { Configuration, OpenAIApi } from "openai";
import fetch from "node-fetch";
import { enStoppingWords, itStoppingWords } from "./globals";

export const requestGPTCompletion = async (query: string) => {
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_KEY,
    });

    const openai = new OpenAIApi(configuration);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-16k",
        messages: [{ role: "user", content: query }],
      }),
    });

    const data = await res.json();
    const completion = data.choices[0].message.content;

    return completion;
  } catch (error) {
    return error;
  }
};

//takes the natural language query and remove all stopping words
export const formatQueryForSearch = (nlQuery: string) => {
  const nlQueryArr = nlQuery
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]'/g, "")
    .split(" ");

  let optimizedQuery: string = "";
  for (const item of nlQueryArr) {
    if (!(itStoppingWords.includes(item) || enStoppingWords.includes(item)))
      optimizedQuery += `${item} `;
  }

  return optimizedQuery;
};
