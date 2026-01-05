import { useEffect, useMemo, useRef, useState } from "react";
import { quickPicks, madeForYou, recentPlays, library } from "./data/mockData";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const coverPalette = [
  "linear-gradient(135deg, #1ed760 0%, #0f7a3a 100%)",
  "linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)",
  "linear-gradient(135deg, #232526 0%, #414345 100%)",
  "linear-gradient(135deg, #3a1c71 0%, #d76d77 100%)",
  "linear-gradient(135deg, #0f2027 0%, #2c5364 100%)",
  "linear-gradient(135deg, #1d4350 0%, #a43931 100%)",
  "linear-gradient(135deg, #000000 0%, #434343 100%)",
  "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
];

const navItems = [
  {
    id: "home",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 11.4 12 4l9 7.4V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-8.6Z" />
      </svg>
    ),
  },
  {
    id: "search",
    label: "Search",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" strokeWidth="2" fill="none" />
        <path d="M16.2 16.2 21 21" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    id: "library",
    label: "Your Library",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5h4v14H5zM11 5h8v2h-8zM11 9h8v2h-8zM11 13h6v2h-6z" />
      </svg>
    ),
  },
];

const controlIcons = {
  shuffle: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h3l9 10h4" strokeWidth="2" fill="none" />
      <path d="M16 7h4v4" strokeWidth="2" fill="none" />
      <path d="M20 17v-4h-4" strokeWidth="2" fill="none" />
    </svg>
  ),
  prev: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 5v14M18 6l-8 6 8 6V6Z" />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 5v14M6 6l8 6-8 6V6Z" />
    </svg>
  ),
  repeat: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 4h3v3" strokeWidth="2" fill="none" />
      <path d="M20 7a8 8 0 0 0-14-2" strokeWidth="2" fill="none" />
      <path d="M7 20H4v-3" strokeWidth="2" fill="none" />
      <path d="M4 17a8 8 0 0 0 14 2" strokeWidth="2" fill="none" />
    </svg>
  ),
};

const toTitleCase = (value) =>
  value
    ? value
        .split(" ")
        .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
        .join(" ")
    : "";

const formatDuration = (value) => {
  const ms = Number(value);
  if (!Number.isFinite(ms)) {
    return "--:--";
  }
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const formatClock = (value) => {
  const secondsValue = Number(value);
  if (!Number.isFinite(secondsValue) || secondsValue <= 0) {
    return "0:00";
  }
  const minutes = Math.floor(secondsValue / 60);
  const seconds = String(Math.floor(secondsValue % 60)).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const coverForSeed = (seed) => {
  if (!seed) {
    return coverPalette[0];
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % coverPalette.length;
  return coverPalette[index];
};

const buildTrack = (item, index) => {
  const title = toTitleCase(item.name ?? item.title ?? "");
  const artist = toTitleCase(item.artist ?? item.artist_name ?? "");
  const tags = typeof item.tags === "string" ? item.tags : "";
  const mood = tags ? tags.split(",")[0].trim() : "";

  return {
    id: item.track_id ?? `${title}-${artist}-${index}`,
    title,
    artist,
    duration: item.duration ? item.duration : formatDuration(item.duration_ms),
    cover: item.cover ?? coverForSeed(`${title}${artist}`),
    preview: item.spotify_preview_url ?? "",
    mood,
  };
};

export default function App() {
  const [query, setQuery] = useState("");
  const [songName, setSongName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [mode, setMode] = useState("hybrid");
  const [diversity, setDiversity] = useState(5);
  const [count, setCount] = useState(10);
  const [recommendations, setRecommendations] = useState([]);
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState("info");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTrack, setActiveTrack] = useState(quickPicks[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const filteredPicks = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) {
      return quickPicks;
    }
    return quickPicks.filter((track) => {
      const haystack = `${track.title} ${track.artist}`.toLowerCase();
      return haystack.includes(value);
    });
  }, [query]);

  const picksTitle = query.trim() ? "Search results" : "Good afternoon";
  const picks = filteredPicks.length ? filteredPicks : quickPicks;
  const hasPreview = Boolean(activeTrack.preview);
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
  }, [activeTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (!hasPreview) {
      if (isPlaying) {
        setIsPlaying(false);
      }
      return;
    }
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, activeTrack.preview, hasPreview]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    setCurrentTime(audio.currentTime);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    setDuration(audio.duration || 0);
  };

  const handleTrackEnded = () => {
    setIsPlaying(false);
  };

  const handleSeek = (event) => {
    const audio = audioRef.current;
    const track = progressRef.current;
    if (!audio || !track || !duration) {
      return;
    }
    const rect = track.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const clamped = Math.min(Math.max(percent, 0), 1);
    audio.currentTime = clamped * duration;
  };

  const handleVolumeChange = (event) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
  };

  const handleTogglePlayback = () => {
    if (!hasPreview) {
      setStatusTone("error");
      setStatus("No preview available for this track.");
      return;
    }
    setIsPlaying((value) => !value);
  };

  const handleRecommendations = async (event) => {
    if (event) {
      event.preventDefault();
    }

    const song = songName.trim();
    const artist = artistName.trim();
    if (!song || !artist) {
      setStatusTone("error");
      setStatus("Enter a song and artist to get recommendations.");
      return;
    }

    setIsLoading(true);
    setStatusTone("info");
    setStatus("Fetching recommendations...");

    try {
      const response = await fetch(`${API_BASE}/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          song_name: song,
          artist_name: artist,
          k: count,
          mode,
          diversity,
        }),
      });

      if (!response.ok) {
        let message = "Recommendation request failed.";
        try {
          const errorPayload = await response.json();
          if (errorPayload?.detail) {
            message = errorPayload.detail;
          }
        } catch (err) {
          // Ignore parse errors and use fallback message.
        }
        throw new Error(message);
      }

      const data = await response.json();
      const mapped = data.map((item, index) => buildTrack(item, index));

      setRecommendations(mapped);
      if (mapped.length) {
        setActiveTrack(mapped[0]);
        setStatusTone("success");
        setStatus(`Showing ${mapped.length} recommendations.`);
      } else {
        setStatusTone("info");
        setStatus("No recommendations found for that track.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to reach the API.";
      setStatusTone("error");
      setStatus(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark" />
          <div>
            <div className="logo-title">Spotify Hybrid</div>
            <div className="logo-subtitle">Recommender</div>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${index === 0 ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-section">
          <div className="section-title">Your Playlists</div>
          <div className="library">
            {library.map((item) => (
              <button key={item} type="button" className="library-item">
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="pill">New releases updated daily</div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="nav-controls">
            <button type="button" className="icon-button" aria-label="Go back">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 18 9 12l6-6" strokeWidth="2" fill="none" />
              </svg>
            </button>
            <button type="button" className="icon-button" aria-label="Go forward">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 18 15 12 9 6" strokeWidth="2" fill="none" />
              </svg>
            </button>
          </div>

          <div className="search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" strokeWidth="2" fill="none" />
              <path d="M16.2 16.2 21 21" strokeWidth="2" fill="none" />
            </svg>
            <input
              type="search"
              placeholder="Search for songs or artists"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="profile">
            <button type="button" className="ghost-button">Upgrade</button>
            <div className="avatar">AM</div>
          </div>
        </header>

        <div className="mobile-nav">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`mobile-nav-item ${index === 0 ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <section className="hero reveal delay-1">
          <div className="hero-content">
            <div className="eyebrow">Your blend</div>
            <h1>Find your next favorite track</h1>
            <p>
              Blend content and collaborative signals to surface the perfect
              recommendations. Search a track, tap play, and let the vibe roll.
            </p>

            <form className="rec-form" onSubmit={handleRecommendations}>
              <div className="rec-fields">
                <div className="field">
                  <label htmlFor="song-name">Song</label>
                  <input
                    id="song-name"
                    type="text"
                    placeholder="mr. brightside"
                    value={songName}
                    onChange={(event) => setSongName(event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="artist-name">Artist</label>
                  <input
                    id="artist-name"
                    type="text"
                    placeholder="the killers"
                    value={artistName}
                    onChange={(event) => setArtistName(event.target.value)}
                  />
                </div>
              </div>

              <div className="rec-controls">
                <div className="field">
                  <label htmlFor="mode">Mode</label>
                  <select
                    id="mode"
                    value={mode}
                    onChange={(event) => setMode(event.target.value)}
                  >
                    <option value="hybrid">Hybrid</option>
                    <option value="content">Content-only</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="diversity">Diversity</label>
                  <div className="range">
                    <input
                      id="diversity"
                      type="range"
                      min="1"
                      max="9"
                      value={diversity}
                      onChange={(event) => setDiversity(Number(event.target.value))}
                      disabled={mode !== "hybrid"}
                    />
                    <span className="range-value">{diversity}</span>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="count">Results</label>
                  <select
                    id="count"
                    value={count}
                    onChange={(event) => setCount(Number(event.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>

              <div className="rec-actions">
                <button type="submit" className="cta-button" disabled={isLoading}>
                  {isLoading ? "Fetching..." : "Get recommendations"}
                </button>
                <button type="button" className="ghost-button">
                  Open queue
                </button>
              </div>

              {status ? (
                <div className={`status ${statusTone}`}>{status}</div>
              ) : null}
            </form>

            <div className="hero-metrics">
              <div>
                <div className="metric-value">98%</div>
                <div className="metric-label">Match score</div>
              </div>
              <div>
                <div className="metric-value">45k</div>
                <div className="metric-label">Tracks indexed</div>
              </div>
              <div>
                <div className="metric-value">Live</div>
                <div className="metric-label">Hybrid engine</div>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-cover" style={{ background: activeTrack.cover }} />
            <div>
              <div className="hero-track">{activeTrack.title}</div>
              <div className="hero-artist">{activeTrack.artist}</div>
            </div>
            <button
              type="button"
              className={`play-button ${!hasPreview ? "disabled" : ""}`}
              aria-label="Play"
              onClick={handleTogglePlayback}
              disabled={!hasPreview}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7-11-7Z" />
              </svg>
            </button>
          </div>
        </section>

        <section className="section reveal delay-2">
          <div className="section-header">
            <div>
              <h2>Recommendations</h2>
              <div className="muted">Powered by {mode === "hybrid" ? "hybrid" : "content"} signals</div>
            </div>
            <div className="section-meta">
              <span className="tag">{count} tracks</span>
              <span className="tag">
                {mode === "hybrid" ? `Diversity ${diversity}` : "Content-only"}
              </span>
            </div>
          </div>

          {recommendations.length ? (
            <div className="grid">
              {recommendations.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  className={`track-card ${
                    activeTrack.id === track.id ? "active" : ""
                  }`}
                  onClick={() => setActiveTrack(track)}
                >
                  <div className="track-cover" style={{ background: track.cover }} />
                  <div>
                    <div className="track-title">{track.title}</div>
                    <div className="track-subtitle">{track.artist}</div>
                  </div>
                  <div className="track-meta">{track.duration}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div>No recommendations yet</div>
              <div className="muted">Try "mr. brightside" by "the killers".</div>
            </div>
          )}
        </section>

        <section className="section reveal delay-3">
          <div className="section-header">
            <h2>{picksTitle}</h2>
            <button type="button" className="link-button">Show all</button>
          </div>
          {filteredPicks.length ? (
            <div className="grid">
              {picks.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  className={`track-card ${
                    activeTrack.id === track.id ? "active" : ""
                  }`}
                  onClick={() => setActiveTrack(track)}
                >
                  <div className="track-cover" style={{ background: track.cover }} />
                  <div>
                    <div className="track-title">{track.title}</div>
                    <div className="track-subtitle">{track.artist}</div>
                  </div>
                  <div className="track-meta">{track.duration}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div>No matches found</div>
              <div className="muted">Try another search.</div>
            </div>
          )}
        </section>

        <section className="section reveal delay-4">
          <div className="section-header">
            <h2>Made for you</h2>
            <button type="button" className="link-button">Show all</button>
          </div>
          <div className="scroll-row">
            {madeForYou.map((mix) => (
              <button key={mix.id} type="button" className="playlist-card">
                <div className="playlist-cover" style={{ background: mix.cover }} />
                <div className="playlist-title">{mix.title}</div>
                <div className="playlist-subtitle">{mix.description}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="section reveal delay-5">
          <div className="section-header">
            <h2>Recent plays</h2>
            <button type="button" className="link-button">Show all</button>
          </div>
          <div className="row">
            {recentPlays.map((track) => (
              <button
                key={track.id}
                type="button"
                className="recent-card"
                onClick={() => setActiveTrack(track)}
              >
                <div className="recent-cover" style={{ background: track.cover }} />
                <div>
                  <div className="recent-title">{track.title}</div>
                  <div className="recent-subtitle">{track.artist}</div>
                </div>
                <div className="recent-time">{track.duration}</div>
              </button>
            ))}
          </div>
        </section>
      </main>

      <audio
        ref={audioRef}
        src={activeTrack.preview || ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
        preload="metadata"
      />

      <footer className="player">
        <div className="player-track">
          <div className="player-cover" style={{ background: activeTrack.cover }} />
          <div>
            <div className="player-title">{activeTrack.title}</div>
            <div className="player-artist">{activeTrack.artist}</div>
          </div>
          <button type="button" className="like-button" aria-label="Save to library">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20s-7-4.4-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.6 12 20 12 20Z" />
            </svg>
          </button>
        </div>

        <div className="player-controls">
          <div className="controls">
            <button type="button" className="icon-button" aria-label="Shuffle">
              {controlIcons.shuffle}
            </button>
            <button type="button" className="icon-button" aria-label="Previous">
              {controlIcons.prev}
            </button>
            <button
              type="button"
              className="play-toggle"
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={handleTogglePlayback}
              disabled={!hasPreview}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7-11-7Z" />
                </svg>
              )}
            </button>
            <button type="button" className="icon-button" aria-label="Next">
              {controlIcons.next}
            </button>
            <button type="button" className="icon-button" aria-label="Repeat">
              {controlIcons.repeat}
            </button>
          </div>
          <div className="timeline">
            <span>{formatClock(currentTime)}</span>
            <div
              className="progress"
              onClick={handleSeek}
              ref={progressRef}
              role="presentation"
            >
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <span>{formatClock(duration)}</span>
          </div>
        </div>

        <div className="player-extras">
          <button type="button" className="chip">Lyrics</button>
          <button type="button" className="chip">Queue</button>
          <div className="volume">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4Z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              aria-label="Volume"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
