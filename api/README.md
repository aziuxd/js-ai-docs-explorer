## How to run the two apis

To start askChatGPT websocket server:

```
npm run dev-gpt
```

To Silwa fastify endpoint:

```
npm run dev-silwa
```

## Setting up the project

In order to be able to run the apis and use them you should add to a `.env` file the following:

- `INDEX` (index of cognitive search resource)
- `API_KEY` (azure api key related to cognitive search resource)
- `SEARCH_ENDPOINT` (endpoint of cognitive search u can find directly on azure portal)
- `OPENAI_KEY` (your api key of openai account)
