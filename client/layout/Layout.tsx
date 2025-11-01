import { PropsWithChildren, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, SunMedium, Github, PanelsTopLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandIcon } from "@/components/icons/BrandIcon";
import { useTheme } from "next-themes";

export function AppLayout({ children }: PropsWithChildren<{}>) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const NavLink = ({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        className={cn(
          "nav-link",
          isActive && "nav-link-active"
        )}
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </Link>
    );
  };

  return (
    <div id="app-layout" className="app-layout">
      <header id="main-header" className="main-header">
        <div id="header-container" className="header-container">
          <Link to="/" id="brand-link" className="brand-link">
            <BrandIcon />
            <span id="brand-title" className="brand-title">
              CHRONOCAST
            </span>
          </Link>

          <nav id="main-nav" className="main-nav">
            <NavLink to="/" label="Home" />
            <NavLink to="/dashboard" label="Dashboard" />
            <NavLink to="/about" label="About" />
            <a
              id="github-link"
              className="github-link"
              href="https://github.com/rasha-2k/ChronoCast"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="github-icon h-4 w-4" />
              Star
            </a>
          </nav>

          <div id="header-actions" className="header-actions">
            <button
              id="theme-toggle"
              className="theme-toggle"
              aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
              onClick={toggleTheme}
              type="button"
              disabled={!mounted}
            >
              {mounted && theme === "dark" ? (
                <SunMedium className="theme-icon h-4 w-4" />
              ) : (
                <Moon className="theme-icon h-4 w-4" />
              )}
            </button>
            <button
              id="menu-toggle"
              className="menu-toggle"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
            >
              {isMobileMenuOpen ? (
                <X className="menu-icon h-5 w-5" />
              ) : (
                <PanelsTopLeft className="menu-icon h-5 w-5" />
              )}
            </button>
          </div>
        </div>

      </header>

      <main id="main-content" className="main-content">
        {children}
      </main>

      <footer id="main-footer" className="main-footer">
        <div id="footer-container" className="footer-container">
          <p id="footer-copyright" className="footer-copyright">
            © {new Date().getFullYear()} ChronoCast • NASA Space Apps
          </p>
          <p id="footer-builtwith" className="footer-builtwith">
            Developed by{' '}
            <a 
              href="https://rashaalsaleh.com" 
              target="_blank" 
              rel="noreferrer"
              style={{ color: 'var(--primary)', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Rasha Alsaleh
            </a>
          </p>
        </div>
      </footer>

      {isMobileMenuOpen && (
        <>
          <div
            className="mobile-menu-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <Link to="/" className="mobile-brand-link" onClick={() => setIsMobileMenuOpen(false)}>
                <BrandIcon />
                <span className="mobile-brand-title">
                  CHRONOCAST
                </span>
              </Link>
              <button
                className="mobile-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Sidebar Navigation */}
            <nav className="mobile-nav">
              <NavLink to="/" label="Home" onClick={() => setIsMobileMenuOpen(false)} />
              <NavLink to="/dashboard" label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
              <NavLink to="/about" label="About" onClick={() => setIsMobileMenuOpen(false)} />
            </nav>
            
            {/* Sidebar Footer */}
            <div className="mobile-menu-footer">
              <a
                className="mobile-github-link"
                href="https://github.com/rasha-2k/ChronoCast"
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Github className="github-icon h-4 w-4" />
                Star on GitHub
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

