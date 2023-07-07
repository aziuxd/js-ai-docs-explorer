"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doMaxTokensCalc = exports.doCognitiveQuery = exports.optimizeQuery = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const languagedetect_1 = __importDefault(require("languagedetect"));
//@ts-ignore
const lang_it_1 = require("@nlpjs/lang-it");
//@ts-ignore
const lang_en_1 = require("@nlpjs/lang-en");
const search_documents_1 = require("@azure/search-documents");
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
const optimizeQuery = (nlQuery, useStemming = true) => {
    const langDetector = new languagedetect_1.default();
    const prob = langDetector.detect(nlQuery);
    let optimizedQuery = "";
    if (prob[0][0] == "italian") {
        const stemmer = new lang_it_1.StemmerIt();
        stemmer.stopwords = new lang_it_1.StopwordsIt();
        if (useStemming) {
            const arr = stemmer.tokenizeAndStem(nlQuery, false);
            arr.forEach((item) => {
                optimizedQuery += `${item} `;
            });
        }
        else {
            const stopwords = new lang_it_1.StopwordsIt();
            const arr = stopwords.removeStopwords(nlQuery.split(" "));
            arr.forEach((item) => {
                optimizedQuery += `${item} `;
            });
        }
        return optimizedQuery;
    }
    else if (prob[0][0] == "english") {
        const stemmer = new lang_en_1.StemmerEn();
        stemmer.stopwords = new lang_en_1.StopwordsEn();
        if (useStemming) {
            const arr = stemmer.tokenizeAndStem(nlQuery, false);
            arr.forEach((item) => {
                optimizedQuery += `${item} `;
            });
        }
        else {
            const stopwords = new lang_en_1.StopwordsEn();
            const arr = stopwords.removeStopwords(nlQuery.split(" "));
            arr.forEach((item) => {
                optimizedQuery += `${item} `;
            });
        }
        return optimizedQuery;
    }
    else {
        return nlQuery;
    }
};
exports.optimizeQuery = optimizeQuery;
const doCognitiveQuery = (query, currIndex) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c, _d, e_2, _e, _f, _g, e_3, _h, _j;
    var _k, _l, _m;
    const endpoint = process.env.SEARCH_ENDPOINT;
    const api_key = process.env.API_KEY;
    const optimizedQuery = (0, exports.optimizeQuery)(query);
    console.log("GUARDA QUI PROGRAMMATORE: ", optimizedQuery);
    const credentials = new search_documents_1.AzureKeyCredential(api_key);
    const client = new search_documents_1.SearchClient(endpoint, currIndex, credentials);
    let results = yield client.search(optimizedQuery, {
        highlightFields: "content",
        top: 1,
    });
    let res = [];
    try {
        for (var _o = true, _p = __asyncValues(results.results), _q; _q = yield _p.next(), _a = _q.done, !_a; _o = true) {
            _c = _q.value;
            _o = false;
            const result = _c;
            res.push({ score: result.score });
            //@ts-ignore
            for (const curr_highlight of (_k = result.highlights) === null || _k === void 0 ? void 0 : _k.content) {
                //@ts-ignore
                res[0].content = curr_highlight;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_o && !_a && (_b = _p.return)) yield _b.call(_p);
        }
        finally { if (e_1) throw e_1.error; }
    }
    //if there some cognitive search data return them
    if (res.length)
        return res[0];
    //if not redo the process without stemming (sometimes this can be the issue)
    else {
        results = yield client.search((0, exports.optimizeQuery)(query, false), {
            highlightFields: "content",
            top: 1,
        });
        try {
            for (var _r = true, _s = __asyncValues(results.results), _t; _t = yield _s.next(), _d = _t.done, !_d; _r = true) {
                _f = _t.value;
                _r = false;
                const result = _f;
                res.push({ score: result.score });
                //@ts-ignore
                for (const curr_highlight of (_l = result.highlights) === null || _l === void 0 ? void 0 : _l.content) {
                    //@ts-ignore
                    res[0].content = curr_highlight;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_r && !_d && (_e = _s.return)) yield _e.call(_s);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (!res.length) {
            results = yield client.search(query, {
                highlightFields: "content",
                top: 1,
            });
            try {
                for (var _u = true, _v = __asyncValues(results.results), _w; _w = yield _v.next(), _g = _w.done, !_g; _u = true) {
                    _j = _w.value;
                    _u = false;
                    const result = _j;
                    res.push({ score: result.score });
                    //@ts-ignore
                    for (const curr_highlight of (_m = result.highlights) === null || _m === void 0 ? void 0 : _m.content) {
                        //@ts-ignore
                        res[0].content = curr_highlight;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (!_u && !_g && (_h = _v.return)) yield _h.call(_v);
                }
                finally { if (e_3) throw e_3.error; }
            }
            if (!res.length)
                return [];
            return res[0];
        }
        return res[0];
    }
});
exports.doCognitiveQuery = doCognitiveQuery;
const doMaxTokensCalc = (model) => {
    if (model === "gpt-3.5-turbo-16k") {
        return 16000;
    }
    else {
        return 4000;
    }
};
exports.doMaxTokensCalc = doMaxTokensCalc;
