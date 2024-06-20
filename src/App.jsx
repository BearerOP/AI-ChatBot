import { useState } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const API_KEY = 'AIzaSyATqmJGmCwbmKS45z9_kpkHr3J9X7X6EAA';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

  const fetchData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setMessages(prevMessages => [
      ...prevMessages,
      { type: "user", text: question },
      { type: "loading", text: "Analysing..." }
    ]);

    try {
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: question }] }]
      });

      const answer = response.data.candidates[0].content.parts[0].text;

      setMessages(prevMessages => [
        ...prevMessages.filter(msg => msg.type !== "loading"),
        { type: "response", text: formatText(answer) }
      ]);

      setQuestion("");
    } catch (error) {
      setError(error);
      console.error("Error:", error);

      setMessages(prevMessages => [
        ...prevMessages.filter(msg => msg.type !== "loading"),
        { type: "response", text: "Sorry, something went wrong. Please try again later." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatText = (text) => {
    if (typeof text !== "string") {
      return "";
    }
    return text.replace(/([.?!])\s*(?=[A-Z])/g, "$1\n\n");
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      fetchData(e);
    }
  };

  const filteredMessages = messages.filter(
    (message) => message.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <h1>AI ChatBot</h1>
        </div>
        <div className="chat-messages">
          {filteredMessages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          ))}
        </div>
        <form onSubmit={fetchData} className="chat-input">
          <textarea
            required
            className="textarea"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
          ></textarea>
          <button
            type="submit"
            className={`button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
