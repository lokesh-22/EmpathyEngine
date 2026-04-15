import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "http://localhost:8000";

const MODEL_OPTIONS = {
  local: {
    label: "Local expressive",
    endpoint: "/speak",
    playbackFormat: "wav",
  },
  google: {
    label: "Google Neural",
    endpoint: "/speak/google",
    playbackFormat: "mp3",
  },
} as const;

type ModelKey = keyof typeof MODEL_OPTIONS;

function App() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [emotion, setEmotion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelKey>("local");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setAudioUrl(null);

    try {
      const currentModel = MODEL_OPTIONS[selectedModel];
      const response = await axios.post(
        `${API_BASE_URL}${currentModel.endpoint}`,
        null,
        {
        params: { text },
        },
      );

      const filename = response.data.audio_file;
      setEmotion(response.data.emotion);

      const audioResponse = await axios.get(`${API_BASE_URL}/get-audio`, {
        params: {
          filename,
          format: response.data.playback_format || currentModel.playbackFormat,
        },
        responseType: "blob",
      });

      const contentType = audioResponse.headers["content-type"] || "audio/wav";
      const url = URL.createObjectURL(
        new Blob([audioResponse.data], { type: contentType }),
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
      audioRef.current.play().catch((playbackError) => {
        console.error("Audio playback failed:", playbackError);
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
    <main className="app-shell">
      <section className="composer-panel">
        <div className="composer-head">
          <div className="composer-title-block">
            <p className="panel-kicker">Compose</p>
            <h1>Empathy Engine</h1>
            <p className="composer-subtitle">
              A centered speech studio for emotionally aware voice generation.
            </p>
          </div>
          <div className="composer-meta">
            <div className="meta-pill">
              <span>Status</span>
              <strong>{loading ? "Generating" : "Ready"}</strong>
            </div>
            <div className="meta-pill">
              <span>Emotion</span>
              <strong>{emotion || "Pending"}</strong>
            </div>
          </div>
        </div>

        <label className="composer-field">
          <span className="field-label">Your message</span>
          <textarea
            placeholder="Type something like: I’m so happy you’re here today."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="composer-textarea"
          />
          <div className="model-picker">
            <label className="model-picker-label" htmlFor="voice-model">
              Voice model
            </label>
            <select
              id="voice-model"
              className="model-picker-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as ModelKey)}
            >
              {Object.entries(MODEL_OPTIONS).map(([value, option]) => (
                <option key={value} value={value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </label>

        <div className="composer-actions">
          <button
            onClick={handleSubmit}
            className="primary-button"
            disabled={loading || !text.trim()}
          >
            {loading ? "Generating voice..." : "Generate speech"}
          </button>

          <p className="helper-text">
            The generated response will appear below with browser playback.
          </p>
        </div>

        {error && <p className="error-banner">{error}</p>}

        <div className="results-grid">
          <article className="result-card">
            <p className="card-label">Detected emotion</p>
            <div className="emotion-display">
              <span className="emotion-dot" />
              <span>{emotion || "No analysis yet"}</span>
            </div>
          </article>

          <article className="result-card player-card">
            <p className="card-label">Audio output</p>
            {audioUrl ? (
              <audio
                key={audioUrl}
                ref={audioRef}
                controls
                autoPlay
                src={audioUrl}
                className="audio-player"
                onError={() =>
                  setError("The generated audio format was not playable.")
                }
              />
            ) : (
              <p className="empty-state">
                Generate speech to unlock the audio player.
              </p>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}

export default App;
