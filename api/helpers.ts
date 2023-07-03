import * as dotenv from "dotenv";
dotenv.config();
import LanguageDetect from "languagedetect";
//@ts-ignore
import { StemmerIt, StopwordsIt } from "@nlpjs/lang-it";
//@ts-ignore
import { StemmerEn, StopwordsEn } from "@nlpjs/lang-en";

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
