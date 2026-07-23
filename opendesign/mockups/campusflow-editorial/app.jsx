const { useEffect, useMemo, useState } = React;

const ASSET_ROOT = "../../../backend/src/main/resources/static/assets";
const photos = {
  temple: `${ASSET_ROOT}/campus-extra-red-temple.jpg`,
  kiyomizu: `${ASSET_ROOT}/campus-extra-kiyomizu.jpg`,
  pond: `${ASSET_ROOT}/campus-extra-pond.jpg`,
  dusk: `${ASSET_ROOT}/campus-photo-01.jpg`,
  blossoms: `${ASSET_ROOT}/campus-photo-02.jpg`,
  gull: `${ASSET_ROOT}/campus-photo-03.jpg`,
  palms: `${ASSET_ROOT}/campus-photo-04.jpg`,
  cat: `${ASSET_ROOT}/campus-photo-05.jpg`,
  leaf: `${ASSET_ROOT}/campus-photo-06.jpg`,
  magnolia: `${ASSET_ROOT}/campus-photo-07.jpg`,
  night: `${ASSET_ROOT}/campus-photo-08.jpg`,
  stairs: `${ASSET_ROOT}/campus-photo-09.jpg`,
};

const pageMeta = {
  today: { number: "01", label: "Today", jp: "今日" },
  profile: { number: "02", label: "Profile", jp: "人物" },
  account: { number: "03", label: "Account", jp: "接続" },
};

function TodayPage({ notify }) {
  const [query, setQuery] = useState({ country: "Japan", city: "Kyoto" });
  const [result, setResult] = useState({ city: "Kyoto", country: "Japan", temp: 29, weather: "Soft clouds", wind: 8 });
  const [loading, setLoading] = useState(false);

  const search = (event) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      const isTokyo = query.city.trim().toLowerCase().includes("tokyo");
      setResult({
        city: query.city.trim() || "Kyoto",
        country: query.country.trim() || "Japan",
        temp: isTokyo ? 31 : 29,
        weather: isTokyo ? "Bright intervals" : "Soft clouds",
        wind: isTokyo ? 11 : 8,
      });
      setLoading(false);
      notify(`Weather spread updated for ${query.city || "Kyoto"}.`);
    }, 620);
  };

  return (
    <section className="editorial-page today-page" aria-labelledby="today-title">
      <div className="today-copy page-stagger">
        <p className="chapter-mark">VOL. 07 / THU / 16:20</p>
        <h1 id="today-title">A quiet Thursday<br />in <em>{result.city}.</em></h1>
        <p className="lead">A small view of the day—weather first, details second, everything else can wait.</p>
        <form className="location-search" onSubmit={search}>
          <label>
            <span>COUNTRY</span>
            <input value={query.country} onChange={(event) => setQuery({ ...query, country: event.target.value })} />
          </label>
          <label>
            <span>CITY</span>
            <input value={query.city} onChange={(event) => setQuery({ ...query, city: event.target.value })} />
          </label>
          <button className="ink-button" type="submit" disabled={loading}>
            {loading ? "Finding…" : "Search"}
          </button>
        </form>
        <button className="text-action" type="button" onClick={() => notify(`${result.city} saved as your default place.`)}>
          + save this place to profile
        </button>
      </div>

      <div className="today-weather page-stagger">
        <span className="vertical-caption">CURRENT CONDITIONS / 現在の天気</span>
        <div className="temperature">{result.temp}<sup>°</sup></div>
        <div className="weather-copy">
          <strong>{result.weather}</strong>
          <span>Wind {result.wind} km/h · feels like {result.temp + 1}°</span>
        </div>
        <div className="sun-track" aria-hidden="true"><i></i></div>
        <p className="weather-note">“The light stays soft until evening.”</p>
      </div>

      <div className="today-collage collage-set" aria-label="Kyoto photo collage">
        <figure className="paper-photo primary-photo">
          <img src={photos.temple} alt="Red temple architecture" />
          <figcaption>red lines / Kyoto, 2026</figcaption>
        </figure>
        <figure className="paper-photo support-photo support-one">
          <img src={photos.magnolia} alt="Magnolia branches against a pale building" />
          <figcaption>after the rain</figcaption>
        </figure>
        <figure className="paper-photo support-photo support-two">
          <img src={photos.gull} alt="A gull by the harbor" />
          <figcaption>wind from the water</figcaption>
        </figure>
        <span className="registration-mark">＋</span>
      </div>

      <aside className="today-facts page-stagger" aria-label="Today at a glance">
        <div><span>PLACE</span><strong>{result.city}, {result.country}</strong></div>
        <div><span>PACK</span><strong>Light layer · water</strong></div>
        <div><span>LIGHT</span><strong>18:57 sunset</strong></div>
        <div><span>PACE</span><strong>Leave ten minutes early</strong></div>
      </aside>
    </section>
  );
}

function ProfilePage({ notify }) {
  const stored = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("cf-profile-prototype")) || {}; }
    catch { return {}; }
  }, []);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: stored.name || "Sora Minami",
    title: stored.title || "Web service student / visual observer",
    email: stored.email || "sora.minami@example.jp",
    summary: stored.summary || "I collect ordinary moments and turn them into small digital systems—useful enough to work, quiet enough to live with.",
  });

  const save = (event) => {
    event.preventDefault();
    setSaving(true);
    window.setTimeout(() => {
      localStorage.setItem("cf-profile-prototype", JSON.stringify(profile));
      setSaving(false);
      setEditing(false);
      notify("Profile saved in this prototype.");
    }, 720);
  };

  return (
    <section className="editorial-page profile-page" aria-labelledby="profile-title">
      <div className="profile-index page-stagger">
        <span>PROFILE / PUBLIC FILE</span>
        <i aria-hidden="true"></i>
        <small>UPDATED 23 JUL 2026</small>
      </div>

      <div className="profile-portrait collage-set">
        <figure className="paper-photo portrait-main">
          <img src={photos.dusk} alt="Historic building glowing at dusk" />
          <figcaption>the window lights came on at 18:41</figcaption>
        </figure>
        <figure className="paper-photo portrait-small">
          <img src={photos.cat} alt="Black cat sitting in garden plants" />
          <figcaption>campus regular / unnamed</figcaption>
        </figure>
        <div className="profile-quote page-stagger">
          <span>MARGIN NOTE</span>
          <p>“Leave enough room for a person to appear.”</p>
        </div>
      </div>

      <article className="profile-story page-stagger">
        <p className="chapter-mark">PUBLIC PROFILE / 公開用</p>
        <h1 id="profile-title">{profile.name}</h1>
        <p className="profile-role">{profile.title}</p>
        <div className="profile-rule"></div>
        <p className="profile-summary">{profile.summary}</p>
        <div className="profile-columns">
          <div>
            <span className="section-label">STUDY</span>
            <strong>KCGI · Web Services</strong>
            <p>2025—2027<br />Kyoto, Japan</p>
          </div>
          <div>
            <span className="section-label">PRACTICE</span>
            <strong>Java · REST · UI</strong>
            <p>Spring Boot<br />OAuth · MySQL</p>
          </div>
          <div>
            <span className="section-label">CONTACT</span>
            <strong>{profile.email}</strong>
            <p>Open for class critique<br />and quiet collaborations.</p>
          </div>
        </div>
        <div className="profile-actions">
          <button className="vermilion-button" type="button" onClick={() => setEditing(true)}>Edit profile</button>
          <button className="text-action dark" type="button" onClick={() => window.print()}>Print this page ↗</button>
        </div>
      </article>

      {editing && (
        <div className="edit-sheet" role="dialog" aria-modal="true" aria-label="Edit profile" aria-busy={saving}>
          <form onSubmit={save}>
            <div className="sheet-heading">
              <div><span>EDIT MODE</span><h2>Rewrite the margin.</h2></div>
              <button type="button" aria-label="Close edit sheet" onClick={() => setEditing(false)}>×</button>
            </div>
            <label>Name<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label>
            <label>Role<input value={profile.title} onChange={(event) => setProfile({ ...profile, title: event.target.value })} /></label>
            <label>Email<input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></label>
            <label>Short note<textarea rows="4" value={profile.summary} onChange={(event) => setProfile({ ...profile, summary: event.target.value })}></textarea></label>
            <div className="sheet-actions">
              <button className="ink-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
              <button className="text-action" type="button" disabled={saving} onClick={() => setEditing(false)}>Cancel</button>
            </div>
            {saving && <p className="request-status" role="status"><i></i> Keeping this sheet open while the API responds.</p>}
          </form>
        </div>
      )}
    </section>
  );
}

function AccountPage({ notify }) {
  const [provider, setProvider] = useState(localStorage.getItem("cf-provider") || "");
  const [connecting, setConnecting] = useState("");
  const connect = (name) => {
    setConnecting(name);
    window.setTimeout(() => {
      setProvider(name);
      setConnecting("");
      localStorage.setItem("cf-provider", name);
      notify(`Prototype connected with ${name}.`);
    }, 940);
  };
  const disconnect = () => {
    setProvider("");
    localStorage.removeItem("cf-provider");
    notify("Account disconnected.");
  };

  return (
    <section className="editorial-page account-page" aria-labelledby="account-title">
      <div className="account-heading page-stagger">
        <p className="chapter-mark inverse">PERSONAL SIGN-IN / CONNECTION / PROOF</p>
        <h1 id="account-title">{provider ? "You’re in." : "Choose a door."}</h1>
        <p>{provider ? `Connected with ${provider}. The classroom demo can now show an authenticated state.` : "Sign in once to edit your profile and demonstrate one connected API. The page stays usable while a provider responds."}</p>
      </div>

      <figure className="account-image page-stagger">
        <img src={photos.palms} alt="Palm trees silhouetted against sunset" />
        <figcaption>SAME SKY, DIFFERENT COAST / 19:03</figcaption>
      </figure>

      <div className="passport-card page-stagger">
        <div className="passport-top">
          <span>CAMPUSFLOW / LOCAL ID</span>
          <b>CF</b>
        </div>
        <div className="passport-body">
          <div className="id-photo"><img src={photos.stairs} alt="Cat on outdoor steps" /></div>
          <div className="id-data">
            <span>HOLDER</span><strong>SORA MINAMI</strong>
            <span>ROLE</span><strong>STUDENT / MAKER</strong>
            <span>STATUS</span><strong className={provider ? "connected" : ""}>{provider ? `${provider.toUpperCase()} CONNECTED` : "VISITOR"}</strong>
          </div>
        </div>
        <p className="machine-line">CFJPN&lt;&lt;MINAMI&lt;&lt;SORA&lt;&lt;2026&lt;&lt;CLASS07</p>
      </div>

      <div className="provider-panel page-stagger" aria-busy={Boolean(connecting)}>
        <p className="section-label">SIGN IN / 第三者認証</p>
        {!provider ? (
          <>
            <button className="provider-button" type="button" disabled={Boolean(connecting)} onClick={() => connect("GitHub")}>
              <span>GH</span><div><strong>{connecting === "GitHub" ? "Waiting for GitHub…" : "Continue with GitHub"}</strong><small>{connecting === "GitHub" ? "The current page remains available" : "Profile + repository evidence"}</small></div><i>{connecting === "GitHub" ? "···" : "↗"}</i>
            </button>
            <button className="provider-button" type="button" disabled={Boolean(connecting)} onClick={() => connect("Google")}>
              <span>G</span><div><strong>{connecting === "Google" ? "Waiting for Google…" : "Continue with Google"}</strong><small>{connecting === "Google" ? "The current page remains available" : "Profile + calendar evidence"}</small></div><i>{connecting === "Google" ? "···" : "↗"}</i>
            </button>
            {connecting && <p className="request-status inverse-status" role="status"><i></i> Opening a secure provider connection. No content was cleared.</p>}
          </>
        ) : (
          <div className="service-proof">
            <div className="status-row"><i></i><span>AUTHENTICATED</span><strong>{provider}</strong></div>
            <h2>{provider === "GitHub" ? "3 public repositories" : "2 upcoming events"}</h2>
            <p>{provider === "GitHub" ? "campusflow · java-practice · web-service-notes" : "Final presentation · API review session"}</p>
            <button className="text-action inverse-action" type="button" onClick={disconnect}>Disconnect account</button>
          </div>
        )}
        <p className="privacy-note">Prototype only · no credentials are collected here.</p>
      </div>

      <blockquote className="account-quote page-stagger">A login page can still feel like a page.</blockquote>
    </section>
  );
}

function App() {
  const getPage = () => window.location.hash.replace("#", "") || "today";
  const [page, setPage] = useState(pageMeta[getPage()] ? getPage() : "today");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const syncHash = () => setPage(pageMeta[getPage()] ? getPage() : "today");
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const navigate = (next) => {
    if (next === page) return;
    window.location.hash = next;
    setPage(next);
  };

  return (
    <div className={`prototype-shell theme-${page}`}>
      <header className="site-header">
        <button className="wordmark" type="button" onClick={() => navigate("today")}>
          <span>CAMPUS</span><b>FLOW</b><small>CLASSROOM EDITION</small>
        </button>
        <nav aria-label="Main pages">
          {Object.entries(pageMeta).map(([key, item]) => (
            <button key={key} className={page === key ? "active" : ""} type="button" onClick={() => navigate(key)}>
              <span>{item.number}</span><b>{item.label}</b><small>{item.jp}</small>
            </button>
          ))}
        </nav>
        <div className="issue-label"><span>ISSUE</span><b>07—26</b></div>
      </header>

      <main className="page-stage">
        <div className="page-transition" key={page}>
          {page === "today" && <TodayPage notify={setToast} />}
          {page === "profile" && <ProfilePage notify={setToast} />}
          {page === "account" && <AccountPage notify={setToast} />}
        </div>
      </main>

      <footer className="folio">
        <span>{pageMeta[page].number} / 03</span>
        <i></i>
        <p>CampusFlow — a web service study in three pages.</p>
        <b>{pageMeta[page].label.toUpperCase()}</b>
      </footer>
      <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
