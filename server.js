const express = require("express");
const cors = require("cors");
const app = express();
// const axios = require("axios");
const OpenAi = require('openai')
const PORT = 5000;

app.use(express.json());
app.use(cors());
const openai =new OpenAi({
   apiKey:"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"
});

app.post('/chat',async(req,res)=>{
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: req.body.message}],
    model: "gpt-3.5-turbo",
  });
  console.log(completion.choices[0]);
  res.send(completion.choices[0]);
})

app.listen(PORT, () => {
  console.log("listening on port", PORT);
});