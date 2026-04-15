import { useState, useRef, useEffect, type CSSProperties } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

function App() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [emotion, setEmotion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSubmit = async () => {
    if (!text) return;

    setLoading(true);
    setError("");
    setAudioUrl(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/speak`,
        null,
        { params: { text } }
      );

      const filename = response.data.audio_file;
      setEmotion(response.data.emotion);

      const audioResponse = await axios.get(
        `${API_BASE_URL}/get-audio`,
        {
          params: {
            filename,
            format: "wav",
          },
          responseType: "blob",
        }
      );

      const contentType = audioResponse.headers["content-type"] || "audio/wav";
      const url = URL.createObjectURL(
        new Blob([audioResponse.data], { type: contentType })
      );
      setAudioUrl(url);

    } catch (err) {
      console.error(err);
      setError("Audio could not be played. Please try again.");
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
        setError("Playback failed in the browser.");
      });
    }
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
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

      {error && <p style={styles.error}>{error}</p>}

      {audioUrl && (
        <audio
          key={audioUrl}
          ref={audioRef}
          controls
          autoPlay
          src={audioUrl}
          onError={() => setError("The generated audio format was not playable.")}
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
  error: {
    color: "#b42318",
    marginTop: "12px",
  },
};

export default App;
