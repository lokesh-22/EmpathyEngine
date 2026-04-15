import { useState, useRef, useEffect, type CSSProperties } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

function App() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [emotion, setEmotion] = useState("");
  const [loading, setLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSubmit = async () => {
    if (!text) return;

    setLoading(true);
    setAudioUrl(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/speak`,
        null,
        { params: { text } }
      );

      const filename = response.data.audio_file;
      setEmotion(response.data.emotion);
      setAudioUrl(`${API_BASE_URL}/get-audio?filename=${encodeURIComponent(filename)}`);

    } catch (err) {
      console.error(err);
      alert("Error generating audio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });
    }
  }, [audioUrl]);

  return (
    <div style={styles.container}>
      <h1>Empathy Engine 🎤</h1>

      <textarea
        placeholder="Enter your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={styles.textarea}
      />

      <button onClick={handleSubmit} style={styles.button}>
        {loading ? "Generating..." : "Speak"}
      </button>

      {emotion && (
        <p>
          Detected Emotion: <b>{emotion}</b>
        </p>
      )}

      {audioUrl && (
        <audio
          key={audioUrl}
          ref={audioRef}
          controls
          autoPlay
          src={audioUrl}
          style={{ marginTop: "20px", width: "100%" }}
        />
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    textAlign: "center",
    fontFamily: "Arial",
  },
  textarea: {
    width: "100%",
    height: "120px",
    padding: "10px",
    marginBottom: "10px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default App;
