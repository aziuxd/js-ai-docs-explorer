import * as dotenv from "dotenv";
dotenv.config();
import { Configuration, OpenAIApi } from "openai";
import fetch from "node-fetch";
import { enStoppingWords, itStoppingWords } from "./globals";
import LanguageDetect from "languagedetect";
//@ts-ignore
import { StemmerIt, StopwordsIt } from "@nlpjs/lang-it";
//@ts-ignore
import { StemmerEn, StopwordsEn } from "@nlpjs/lang-en";

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
//OLD FUNCTION
/*export const formatQueryForSearch = (nlQuery: string) => {
  const nlQueryArr = nlQuery
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]'/g, "")
    .split(" ");

  let optimizedQuery = "";
  for (const item of nlQueryArr) {
    if (!(itStoppingWords.includes(item) || enStoppingWords.includes(item)))
      optimizedQuery += `${item} `;
  }

  return optimizedQuery;
};*/

//new function: does remove of stopping words and, in case, stemming
//this should optimized the query string for cognitive search
export const optimizeQuery = (nlQuery: string, useStemming: boolean = true) => {
  const langDetector = new LanguageDetect();
  const prob = langDetector.detect(nlQuery);
  let optimizedQuery = "";
  if (prob[0][0] == "italian") {
    const stemmer = new StemmerIt();
    stemmer.stopwords = new StopwordsIt();
    if (useStemming) {
      const arr = stemmer.tokenizeAndStem(nlQuery, false);
      arr.forEach((item: string) => {
        optimizedQuery += `${item} `;
      });
    } else {
      const stopwords = new StopwordsIt();
      const arr = stopwords.removeStopwords(nlQuery.split(" "));
      arr.forEach((item: string) => {
        optimizedQuery += `${item} `;
      });
    }
    return optimizedQuery;
  } else if (prob[0][0] == "english") {
    const stemmer = new StemmerEn();
    stemmer.stopwords = new StopwordsEn();
    if (useStemming) {
      const arr = stemmer.tokenizeAndStem(nlQuery, false);
      arr.forEach((item: string) => {
        optimizedQuery += `${item} `;
      });
    } else {
      const stopwords = new StopwordsEn();
      const arr = stopwords.removeStopwords(nlQuery.split(" "));
      arr.forEach((item: string) => {
        optimizedQuery += `${item} `;
      });
    }
    return optimizedQuery;
  } else {
    return nlQuery;
  }
};
