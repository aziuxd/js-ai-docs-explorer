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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const search_documents_1 = require("@azure/search-documents");
const helpers_1 = require("../../helpers");
const sql = __importStar(require("mssql"));
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, fastify_1.default)();
        yield app.register(cors_1.default, {
            origin: [
                "http://localhost:3000",
                "http://localhost:8000/api/AskChatGPT/*",
                "*",
                "https://silwa-ai-docs-explorer.vercel.app",
            ],
            allowedHeaders: ["Authorization", "Content-Type"],
        });
        app.post("/cognitive/:query/:index", function (req, reply) {
            var _a, e_1, _b, _c, _d, e_2, _e, _f, _g, e_3, _h, _j;
            var _k, _l, _m;
            return __awaiter(this, void 0, void 0, function* () {
                console.log("endpoint hit");
                try {
                    //@ts-ignore
                    const { query, index } = req.params;
                    //@ts-ignore
                    const possibleIndexes = req === null || req === void 0 ? void 0 : req.body.possibleIndexes;
                    if (Array.isArray(possibleIndexes) &&
                        possibleIndexes.every((currIdx) => currIdx)) {
                        const res = yield Promise.all(possibleIndexes.map((currIdx) => __awaiter(this, void 0, void 0, function* () {
                            return yield (0, helpers_1.doCognitiveQuery)(query, currIdx);
                        })));
                        if (res.every((i) => i.length === 0))
                            reply.status(404).send({ ok: false });
                        return JSON.stringify({
                            data: res
                                .sort((a, b) => b.score - a.score)
                                .map(({ content }) => content),
                        });
                    }
                    else {
                        const idx = process.env.INDEX;
                        const endpoint = process.env.SEARCH_ENDPOINT;
                        const api_key = process.env.API_KEY;
                        const optimizedQuery = (0, helpers_1.optimizeQuery)(query);
                        console.log("GUARDA QUI PROGRAMMATORE: ", optimizedQuery);
                        const credentials = new search_documents_1.AzureKeyCredential(api_key);
                        const client = new search_documents_1.SearchClient(endpoint, index || idx, credentials);
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
                                //@ts-ignore
                                for (const curr_highlight of (_k = result.highlights) === null || _k === void 0 ? void 0 : _k.content) {
                                    res.push(curr_highlight);
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
                            return JSON.stringify({ data: res });
                        //if not redo the process without stemming (sometimes this can be the issue)
                        else {
                            const r = (0, helpers_1.optimizeQuery)(query, false);
                            console.log(r);
                            results = yield client.search((0, helpers_1.optimizeQuery)(query, false), {
                                highlightFields: "content",
                                top: 1,
                            });
                            try {
                                for (var _r = true, _s = __asyncValues(results.results), _t; _t = yield _s.next(), _d = _t.done, !_d; _r = true) {
                                    _f = _t.value;
                                    _r = false;
                                    const result = _f;
                                    //@ts-ignore
                                    for (const curr_highlight of (_l = result.highlights) === null || _l === void 0 ? void 0 : _l.content) {
                                        res.push(curr_highlight);
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
                                        //@ts-ignore
                                        for (const curr_highlight of (_m = result.highlights) === null || _m === void 0 ? void 0 : _m.content) {
                                            res.push(curr_highlight);
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
                                    reply.status(404).send({ ok: false });
                                return JSON.stringify({ data: res });
                            }
                            console.log(res);
                            return JSON.stringify({ data: res });
                        }
                    }
                }
                catch (err) {
                    return new Error(`Err: ${err}`);
                }
            });
        });
        app.get("/sql/:id", (req, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                //@ts-ignore
                const { id } = req.params;
                const config = {
                    user: "Nicola",
                    password: process.env.PASS,
                    //prettier-ignore
                    server: "stesi-sql-server.database.windows.net",
                    database: "SilwaAiDocsExplorer",
                    options: {
                        encrypt: true,
                    },
                };
                yield sql.connect(config);
                const result = yield sql.query(`SELECT IndexId FROM CognitiveIndexConfiguration WHERE UserId=\'${id}\'`);
                return JSON.stringify({ data: result.recordset });
            }
            catch (err) {
                reply.status(404).send({ ok: false });
            }
        }));
        app.listen({ port: 4000 });
    });
}
start()
    .then(() => console.log("Silwa api running"))
    .catch((err) => console.error(err));
