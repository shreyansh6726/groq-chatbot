import { Groq } from "groq-sdk";

export default async function handler(req, res) {
  const body = await new Promise(resolve => {
    let data = "";
    req.on("data", chunk => (data += chunk));
    req.on("end", () => resolve(JSON.parse(data)));
  });

  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await client.chat.completions.create({
    model: "gemma2-9b-it",
    messages: [{ role: "user", content: body.message }]
  });

  res.status(200).json({
    reply: completion.choices[0].message.content
  });
}
