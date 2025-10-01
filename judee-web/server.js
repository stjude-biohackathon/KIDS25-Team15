import express from "express";
import fetch from "node-fetch";
import cors from "cors";
// import multer from "multer";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
// const upload = multer({ dest: 'uploads/' });

// prompt
// date, time
// 

const CONSTANTS = {
  CONTEXT_API: "http://localhost:8000/get_context/",
  // TRANSCRIBE_API: "http://localhost:8000/get_transcribe/",
  OLLAMA_API: "http://localhost:11434",
}

app.post("/api/chat", async (req, res) => {
  const { prompt, userRole } = req.body;

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

  // if (
  //   contextJson &&
  //   Array.isArray(contextJson.documents) &&
  //   Array.isArray(contextJson.distances)
  // ) {
  //   filteredDocs = contextJson.documents;
  //   // const dists = contextJson.distances[0];
  //   // for (let i = 0; i < docs.length; i++) {
  //   //   if (dists[i] <= 1.5) {
  //   //     filteredDocs.push(docs[i]);
  //   //   }
  //   // }
  // }

  const contextText = contextJson.documents.join("\n\n---\n\n");

  const promptWithContext = `Context: ${contextText}\n\nQuestion: ${prompt}\nAnswer:`;

  const response = await fetch(CONSTANTS.OLLAMA_API + "/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "qwen3:1.7b", // or whichever model you pulled with ollama
      // system: 'Answer in less than 100 words and don\'t use anything besides the context to answer. \
      // If the answer is not in the context, say "I don\'t know".',
      system: 'You are Jude-E, a helpful assistant for families, child patients, and caregivers at St. Jude Children’s Research Hospital. You provide clear, supportive information about childhood diseases, cancer, hospital directions, food, and services.'
       + (userRole === 'kid' ? ' IMPORTANT INFORMATION: You are responding to a CHILD, ensure your language is age-appropriate, clear, and comforting. The child might be a patient, express empathy and understanding. The user role is always "Child"' : '')
      + 'Guidelines: Base answers on retrieved St. Jude or disease info documents. Use simple, compassionate language. Avoid medical jargon unless in the source. Do not give personal medical advice, diagnoses, or treatment. Instead, encourage families to consult their doctor. Answer in English only, max 300 words. Structure: short paragraphs or bullet points. Mention source naturally (e.g., “According to St. Jude’s page on brain tumors…”).'
      + 'Tone: Supportive, empathetic. If speaking to a child, make it extra clear, gentle, and encouraging. If no relevant info is found, say so and offer related resources instead.'
      + 'Role: You inform, not advise. Your goal is to make families feel supported and guided to trusted sources. ',
      prompt: promptWithContext,
      think: false,
      stream: false,
      temperature: 0.1,
      top_p: 0.75,
      top_k: 40,
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

// app.post('/api/transcribe', async (req, res) => {
//   try {
//     // if (!req.file) {
//     //   return res.status(400).json({ error: 'No file uploaded' });
//     // }

//     // Read the file as binary data
//     // const fileBuffer = fs.readFileSync(req.file.path);
//     console.log("Received file:", req.file, req.form);

//     const transcriptResponse = await fetch(CONSTANTS.TRANSCRIBE_API, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         file: req.form,
//       }),
//     });

//     if (!transcriptResponse.ok) {
//       throw new Error(`Transcription API error: ${transcriptResponse.status}`);
//     }

//     const transcriptJson = await transcriptResponse.json();
//     const transcriptText = transcriptJson.transcript || '';

//     res.json({ transcript: transcriptText });
//   } catch (error) {
//     console.error('Transcription error:', error);
//     res.status(500).json({ error: 'Transcription failed', details: error.message });
//   } finally {
//     // Clean up uploaded file
//     if (req.file && req.file.path) {
//       fs.unlink(req.file.path, (err) => {
//         if (err) console.error('Error deleting temp file:', err);
//       });
//     }
//   }
// });

app.listen(3001, () => {
  console.log("Ollama API running at http://localhost:3001");
});
