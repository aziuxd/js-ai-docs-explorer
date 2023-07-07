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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const node_fetch_1 = __importDefault(require("node-fetch"));
const languagedetect_1 = __importDefault(require("languagedetect"));
const openai_1 = require("openai");
const socket_io_1 = require("socket.io");
const helpers_1 = require("../../helpers");
const io = new socket_io_1.Server({
    cors: {
        origin: [
            "http://localhost:3000",
            "https://silwa-ai-docs-explorer.vercel.app",
        ],
    },
});
const config = new openai_1.Configuration({
    organization: "org-JhTBz8SPoOJ4KHpwSAGwWqXz",
    apiKey: process.env.OPENAI_KEY,
});
const openai = new openai_1.OpenAIApi(config);
let msgs = [];
io.on("connection", (socket) => {
    socket.on("askChatGPT", (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("enpoint hit");
        const { query, temperature, model, variant, index, possibleIndexes } = data;
        const threshold = model ? (0, helpers_1.doMaxTokensCalc)(model) : 16000;
        console.log("index: ", index);
        //console.log("msg: ", ms);
        //const msgs: GptMessage[] = [] as GptMessage[];
        try {
            if (typeof query !== "string" || query === "") {
                socket.emit("err", { msg: "Not valid query" });
            }
            const langDetector = new languagedetect_1.default();
            const prob = langDetector.detect(query);
            const res = yield (0, node_fetch_1.default)(`http://localhost:4000/cognitive/${query
                .replaceAll("/", ",")
                .replaceAll("?", "")}/${index}`, {
                method: "POST",
                body: JSON.stringify({
                    possibleIndexes,
                }),
            });
            if (!res.ok)
                console.log("no data");
            /*if (!res.ok) {
              //socket.emit("err", { msg: "No data", originalQuery: query });
            } else {*/
            const apiData = yield res.json();
            let { data: parsedData } = apiData;
            //checking if parsedData does not goes over the max token limit for gpt model
            while (parsedData.toString().length >= threshold) {
                let delta = parsedData.toString().length - threshold;
                if (parsedData[parsedData.length - 1] === "") {
                    parsedData = parsedData.slice(0, parsedData.length - 1);
                }
                parsedData[parsedData.length - 1] = parsedData[parsedData.length - 1].slice(0, parsedData[parsedData.length - 1].length - delta > 0
                    ? parsedData[parsedData.length - 1].length - delta
                    : 0);
            }
            console.log(Array.isArray(parsedData));
            //possibility of having a response either in italian (if your query matches italian) or english in any other case
            const newQuery = `${query}, ${prob[0][0] === "italian" ? "sapendo che" : "knowing that"}: ${parsedData === null || parsedData === void 0 ? void 0 : parsedData.slice(0, parsedData.length < 18 ? parsedData.length : 18)}`;
            msgs.push({ role: "user", content: newQuery });
            let cont = msgs.map((x) => x.content + x.role).join();
            //msgs.forEach((x) => (cont += x.role + x.content));
            while (cont.length > threshold) {
                msgs = msgs.splice(1);
                cont = "";
                cont = msgs.map((x) => x.role + x.content).join();
            }
            //console.log(msgs.filter(({ role }) => role === "system"));
            const { data } = yield openai.createChatCompletion({
                model: model || "gpt-3.5-turbo-16k",
                messages: msgs,
                temperature: temperature || 0.1,
                stream: true,
            }, {
                responseType: "stream",
            });
            socket.emit("askChatGPTResponse", {
                data: `${prob[0][0] === "italian"
                    ? "Secondo la documentazione: "
                    : "The documentation says: "}`,
                originalQuery: query,
                variant,
            });
            let gptRes = `${prob[0][0] === "italian"
                ? "Secondo la documentazione: "
                : "The documentation says: "}`;
            //@ts-ignore
            data.on("data", (text) => {
                var _a, _b, _c;
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
                        //console.log(choices);
                        const progressiveData = (_b = (_a = choices[0]) === null || _a === void 0 ? void 0 : _a.delta) === null || _b === void 0 ? void 0 : _b.content;
                        gptRes += progressiveData;
                        socket.emit("askChatGPTResponse", {
                            data: progressiveData,
                            originalQuery: query,
                            finishReason: (_c = choices[0]) === null || _c === void 0 ? void 0 : _c.finish_reason,
                        });
                    }
                    catch (err) {
                        socket.emit("err", { msg: err });
                    }
                }
            });
            //@ts-ignore
            data.on("close", () => { });
            //}
        }
        catch (err) {
            socket.emit("err", { msg: err });
        }
    }));
});
io.listen(8000);
