import { Logo } from "./Logo";

const productLinks = [
  { href: "#install", label: "Install" },
  { href: "#benefits", label: "Benefits" },
  { href: "#stats", label: "Stack" },
  { href: "#benefits", label: "Sessions" },
  { href: "#stats", label: "Build / Plan" },
];

const projectLinks = [
  { href: "#install", label: "CLI Package" },
  { href: "#stats", label: "Hosted Server" },
  { href: "#benefits", label: "Local Tools" },
  { href: "#benefits", label: "Context Files" },
];

const socialLinks = [
  { href: "https://github.com/matterconi/monocode", label: "GitHub" },
  { href: "https://x.com", label: "Follow Us on X" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-dots" aria-hidden="true">
        <div className="footer-dots__line" />
      </div>

      <div className="site-footer__inner">
        <div className="site-footer__top">
          <h2>
            Context-aware coding,
            <span> from your terminal.</span>
          </h2>

          <nav className="site-footer__nav" aria-label="Footer navigation">
            {productLinks.map((item) => (
              <a key={item.label} href={item.href}>{item.label}</a>
            ))}
          </nav>

          <nav className="site-footer__nav" aria-label="Project links">
            {projectLinks.map((item) => (
              <a key={item.label} href={item.href}>{item.label}</a>
            ))}
          </nav>

          <nav className="site-footer__nav" aria-label="Social links">
            {socialLinks.map((item) => (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="site-footer__brand-row">
          <a className="site-footer__brand" href="#" aria-label="Monocode home">
            <span className="site-footer__mark" aria-hidden="true">
              <Logo />
            </span>
            <span className="site-footer__wordmark">Monocode</span>
          </a>
        </div>

        <div className="site-footer__legal">
          <p>© 2026 Monocode. All rights reserved.</p>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Use</a>
        </div>
      </div>
    </footer>
  );
}
