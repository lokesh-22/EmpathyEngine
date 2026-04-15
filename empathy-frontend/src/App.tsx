import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";
import heroImage from "./assets/hero.png";

const API_BASE_URL = "http://localhost:8000";

function App() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [emotion, setEmotion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setAudioUrl(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/speak`, null, {
        params: { text },
      });

      const filename = response.data.audio_file;
      setEmotion(response.data.emotion);

      const audioResponse = await axios.get(`${API_BASE_URL}/get-audio`, {
        params: {
          filename,
          format: "wav",
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
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Emotion-aware speech studio</p>
          <h1>Turn plain text into voice that actually feels human.</h1>
          <p className="hero-text">
            Empathy Engine detects tone, shapes delivery, and returns spoken
            audio with emotional pacing and energy.
          </p>

          <div className="hero-tags">
            <span>Emotion detection</span>
            <span>Adaptive pacing</span>
            <span>Playable audio</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <img src={heroImage} alt="" className="hero-image" />
          <div className="signal-card signal-card-top">
            <span className="signal-label">Live tone</span>
            <strong>{emotion || "Waiting"}</strong>
          </div>
          <div className="signal-card signal-card-bottom">
            <span className="signal-label">Playback</span>
            <strong>{audioUrl ? "Ready" : "Idle"}</strong>
          </div>
        </div>
      </section>

      <section className="composer-panel">
        <div className="composer-head">
          <div>
            <p className="panel-kicker">Compose</p>
            <h2>Craft a message and hear its emotional delivery.</h2>
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
