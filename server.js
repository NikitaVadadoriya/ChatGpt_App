const express = require("express");
const cors = require("cors");
const app = express();
// const axios = require("axios");
const OpenAi = require("openai");
const PORT = 5000;

app.use(express.json());
app.use(cors());

const openai = new OpenAi({
  apiKey: "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",
});

let chatHistory = [];

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: message }],
    model: "gpt-3.5-turbo",
  });
  console.log(completion.choices[0]);
  // res.send(completion.choices[0]);
  const assistantMessage = completion.choices[0].message.content;
  console.log(assistantMessage);
  chatHistory.push({ role: "user", content: message });
  chatHistory.push({ role: "assistant", content: assistantMessage });
  res.json({ message: assistantMessage });
});

app.get("/chat/history", (req, res) => {
  res.json(chatHistory);
});

// Edit message
app.put("/chat/edit/:index", async (req, res) => {
  const { index } = req.params;
  const { newQuestion } = req.body;

  try {
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: newQuestion },
      ],
    });
    const newAssistantMessage = openaiResponse.choices[0].message.content;
    chatHistory[parseInt(index) * 2 + 0].content= newQuestion;
    chatHistory[parseInt(index) * 2 + 1].content = newAssistantMessage;
    res.json({ message: newAssistantMessage });
  } catch (error) {
    console.error("Error editing question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Rename title
app.put('/chat/rename/:index', (req, res) => {
  const { index } = req.params;
  const { newTitle } = req.body;
  try {
    const titles = Array.from(new Set(chatHistory.map((chat) => chat.title)));
    if (!titles.includes(newTitle)) {
      const entryIndex = parseInt(index) * 2; // Assuming each entry has two parts: user and assistant
      if (chatHistory[entryIndex]) {
        chatHistory[entryIndex].title = newTitle;
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Chat history entry not found' });
      }
    } else {
      res.status(400).json({ error: 'Title already exists. Choose a different title.' });
    }
  } catch (error) {
    console.error('Error renaming history title:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete chat history
app.delete('/chat/delete/:index', (req, res) => {
  const { index } = req.params;
  try {
    chatHistory.splice(index * 2, 2);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log("listening on port", PORT);
});