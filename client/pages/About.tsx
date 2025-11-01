export default function About() {
  return (
    <div className="cc-about-page">
        <div className="cc-about-main">
          <div className="cc-about-header">
            <h1 className="cc-about-title">About ChronoCast</h1>
            <p className="cc-about-subtitle">Built for the NASA Space Apps Challenge</p>
          </div>
          <div className="cc-about-sections">
            <section>
              <h2 className="cc-about-section-title">Mission</h2>
              <p className="cc-about-section-desc">
                ChronoCast combines NASA's data with probability modeling to visualize and forecast Earth and space
                weather events through maps, charts, and timelines.
              </p>
            </section>
            <section>
              <h2 className="cc-about-section-title">Data Sources</h2>
              <ul className="cc-about-section-list">
                <li>NASA EOSDIS</li>
                <li>SWPC (Space Weather Prediction Center)</li>
                <li>APOD (Astronomy Picture of the Day)</li>
                <li>NeoWs (Near Earth Objects)</li>
                <li>EPIC Earth Imagery</li>
              </ul>
            </section>
            <section>
              <h2 className="cc-about-section-title">Technology</h2>
              <ul className="cc-about-section-list">
                <li>React + TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Recharts</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
  );
}
