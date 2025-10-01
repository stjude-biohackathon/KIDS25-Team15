import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// prompt
// date, time
// 

const CONSTANTS = {
  CONTEXT_API: "http://localhost:8000/get_context",
  OLLAMA_API: "http://localhost:11434",
}

app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  /* get context first and the send that along with the prompt to ollama */
  const contextResponse = await fetch(CONSTANTS.CONTEXT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: prompt,
      stream: true,
    }),
  });

  const contextJson = await contextResponse.json();
  const filteredDocs = [];

  if (
    contextJson &&
    Array.isArray(contextJson.documents) &&
    Array.isArray(contextJson.distances)
  ) {
    const docs = contextJson.documents[0];
    const dists = contextJson.distances[0];
    for (let i = 0; i < docs.length; i++) {
      if (dists[i] <= 1.5) {
        filteredDocs.push(docs[i]);
      }
    }
  }

  const contextText = filteredDocs.join("\n");

  console.log("Context Text:", contextText);

  const promptWithContext = `Context: ${contextText}\n\nQuestion: ${prompt}\nAnswer:`;

  const response = await fetch(CONSTANTS.OLLAMA_API + "/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma3:1b", // or whichever model you pulled with ollama
      // system: 'Answer in less than 100 words and don\'t use anything besides the context to answer. \
      // If the answer is not in the context, say "I don\'t know".',
      system: 'Answer in less than 100 words ',
      prompt: promptWithContext,
    }),
  });

  // Ollama streams line by line, so we'll buffer
  const data = await response.text();
  res.send(data);
});

app.post('/get_context', async (req, res) => {
  const { date, time } = req.body;

  // Here you would implement the logic to get the context based on the date and time
  const context = `Context for ${date} at ${time}`;

  res.send(context);
});

app.listen(3001, () => {
  console.log("Ollama API running at http://localhost:3001");
});