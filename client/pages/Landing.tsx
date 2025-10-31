import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { Telescope, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <AppLayout>
      <section className="cc-landing-hero">
        <div className="cc-landing-bg-effects">
          <div className="cc-landing-bg-blur-1" />
          <div className="cc-landing-bg-blur-2" />
        </div>
        
        <div className="cc-landing-grid">
          <div>
            <p className="cc-landing-badge">
              <Sparkles className="h-4 w-4" /> NASA Space Apps 2025
            </p>
            <h1 className="cc-landing-title">
              ChronoCast – Forecast Earth & Space Events Across Time
            </h1>
            <p className="cc-landing-description">
              An interactive, educational, and visually striking platform that blends NASA data with probability
              modeling. Explore climate and space weather through maps, charts, and timelines.
            </p>
            <div className="cc-landing-buttons">
              <Link to="/dashboard" className="cc-landing-btn-primary">
                Explore Dashboard
              </Link>
              <Link to="/about" className="cc-landing-btn-secondary">
                Learn more
              </Link>
            </div>
          </div>
          
          <div className="cc-landing-visual">
            <div className="cc-landing-visual-container">
              <div className="cc-landing-visual-pattern" />
              <div className="cc-landing-visual-icon">
                <Telescope className="h-24 w-24 text-blue-600/70" />
              </div>
              <div className="cc-landing-visual-badge">
                Real-time events • Probability models • NASA media
              </div>
            </div>
          </div>
        </div>
        
        <div className="cc-landing-stats">
          {[
            { t: "Risk Index", v: "75%", c: "cc-landing-stat-emerald" },
            { t: "Active Events", v: "12", c: "cc-landing-stat-blue" },
            { t: "Space Highlight", v: "M-Class Flare", c: "cc-landing-stat-fuchsia" },
            { t: "Last Updated", v: "2m ago", c: "cc-landing-stat-amber" }
          ].map((k) => (
            <div key={k.t} className="cc-landing-stat-card">
              <p className="cc-landing-stat-label">{k.t}</p>
              <p className={`cc-landing-stat-value ${k.c}`}>{k.v}</p>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
