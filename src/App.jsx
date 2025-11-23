import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();
    setMessages([...messages, { role: "user", text: input }, { role: "bot", text: data.reply }]);
    setInput("");
  };

  return (
    <div>
      <h1>Groq Chatbot</h1>
      <div>
        {messages.map((m, i) => (
          <p key={i}><b>{m.role}:</b> {m.text}</p>
        ))}
      </div>

      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
