import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useLocation } from "react-router-dom";
import "./styles/index.css";
import {
  ALL_PROJECTS,
  CATEGORIES,
  PROCUREMENT_COPY,
  PROJECTS,
  SERVICES,
  filterByCategory,
  findCategoryBySlug,
  findProject,
  formatNum,
  hasPhotos,
  nextProject,
  splitByPhotos,
} from "./data/projects";
import { swipeStep, wrapIndex } from "./lib/carousel";

// Route changes jump to the top; the global smooth scroll is for in-page anchors only.
const scrollToTop = () => window.scrollTo({ top: 0, behavior: "instant" });

// ─── REUSABLE OBSERVATION COMPONENT ──────────────────────────────────────────

function ScrollReveal({ children, animationClass = "reveal-fade-up" }) {
  const elementRef = useRef(null);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    const node = elementRef.current;
    if (!node || hasRevealed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRevealed(true);
          observer.disconnect();
        }
      },
      { root: null, threshold: 0.15, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasRevealed]);

  return (
    <div ref={elementRef} className={`bd-reveal ${animationClass} ${hasRevealed ? "visible" : ""}`}>
      {children}
    </div>
  );
}

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="bd-logo-link">
      <img src="/images/logo.png" alt="Barry Design Studio" className="bd-logo-img" />
    </div>
  );
}

// Categories without photos show text only in the preview panel.
const MEGAMENU_ITEMS = [
  { name: "All Projects", path: "/#work", img: "/images/projects/haii-keii/haii-keii-1.jpg", sub: "Complete Studio Index" },
  { name: "Health & Wellness", path: "/category/health-wellness", img: "/images/projects/xo/xo-1.jpg", sub: "Studio & Spa Planning" },
  { name: "Restaurants & Bars", path: "/category/restaurants-bars", img: "/images/projects/cyclone-anayas/cyclone-anayas-1.jpg", sub: "Hospitality & Dining" },
  { name: "Nightlife", path: "/category/nightlife", img: "/images/projects/bauhaus/bauhaus-1.jpg", sub: "Clubs & Lounge Acoustics" },
  { name: "Hospitality", path: "/category/hospitality", img: null, sub: "Hotels & Commercial Lounges" },
  { name: "Retail", path: "/category/retail", img: null, sub: "Airport & Storefront Brand Builds" },
  { name: "Institutional", path: "/category/institutional", img: null, sub: "Cultural Landmark Structures" },
];

export function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegamenuVisible, setIsMegamenuVisible] = useState(false);
  const [activePreview, setActivePreview] = useState(0);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsMegamenuVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMegamenuVisible(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const scrollToContact = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const closeMenu = () => setIsMenuOpen(false);
  const active = MEGAMENU_ITEMS[activePreview];

  return (
    <>
      <nav className="bd-nav" aria-label="Main navigation">
        <Link to="/" onClick={closeMenu} aria-label="Barry Design Studio Home">
          <Logo />
        </Link>

        <ul className="bd-nav-links">
          <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Link to="/#work">Work</Link>

            <div className={`bd-megamenu-canvas ${isMegamenuVisible ? "active" : ""}`}>
              <div className="bd-megamenu-list-block">
                <div className="bd-megamenu-label">Project Typologies</div>
                <div className="bd-megamenu-links-grid">
                  {MEGAMENU_ITEMS.map((item, idx) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="bd-megamenu-link"
                      onMouseEnter={() => setActivePreview(idx)}
                      onFocus={() => setActivePreview(idx)}
                      onClick={() => setIsMegamenuVisible(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bd-megamenu-display-canvas" data-testid="megamenu-display">
                {MEGAMENU_ITEMS.filter((item) => item.img).map((item) => (
                  <div
                    key={item.name}
                    className={`bd-megamenu-preview-img ${active.name === item.name ? "active" : ""}`}
                    style={{ backgroundImage: `url(${item.img})` }}
                    aria-hidden="true"
                  />
                ))}
                <div className="bd-megamenu-display-text">
                  <div className="bd-megamenu-display-h3">{active.name.toUpperCase()}</div>
                  <div className="bd-megamenu-display-sub">{active.sub}</div>
                </div>
              </div>
            </div>
          </li>

          <li><Link to="/about">About</Link></li>
          <li><Link to="/#services">Services</Link></li>
          <li><a href="#contact" onClick={scrollToContact}>Contact</a></li>
        </ul>

        <div className="bd-nav-actions">
          <a href="#contact" className="bd-nav-cta" onClick={scrollToContact}>
            Get in Touch
          </a>

          <button
            type="button"
            className={`bd-hamburger ${isMenuOpen ? "open" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div className={`bd-mobile-menu ${isMenuOpen ? "active" : ""}`}>
        <ul className="bd-mobile-menu-list">
          <li><Link to="/#work" onClick={closeMenu} className="bd-mobile-menu-link">Work</Link></li>
          <li><Link to="/about" onClick={closeMenu} className="bd-mobile-menu-link">About</Link></li>
          <li><Link to="/#services" onClick={closeMenu} className="bd-mobile-menu-link">Services</Link></li>
          <li><a href="#contact" onClick={scrollToContact} className="bd-mobile-menu-link">Contact</a></li>
        </ul>
      </div>
    </>
  );
}

function Hero() {
  return (
    <section className="bd-hero" aria-label="Hero">
      <div className="bd-hero-bg" aria-hidden="true" />
      <div className="bd-hero-gradient" aria-hidden="true" />
      <div className="bd-hero-noise" aria-hidden="true" />
      <div className="bd-hero-rule-v" aria-hidden="true" />

      <p className="bd-hero-scroll" aria-hidden="true">scroll</p>

      <p className="bd-hero-eyebrow">Houston, TX · Architectural Design Studio</p>

      <h1 className="bd-hero-h1">
        <span>WE CREATE</span>
        <span>INNOVATIVE</span>
        <span>SPACES</span>
      </h1>

      <p className="bd-hero-sub">
        By combining spatial precision with artistic sensibility, we help
        clients align, structure and elevate their built environments.
      </p>

      <div className="bd-hero-btns">
        <Link to="/#work" className="bd-btn-fill">
          View Projects
        </Link>
        <Link to="/about" className="bd-btn-ghost">
          Our Process
        </Link>
      </div>
    </section>
  );
}

function ProjectRow({ proj, num }) {
  return (
    <ScrollReveal>
      <Link className="bd-proj" to={`/project/${proj.id}`} aria-label={`View project: ${proj.title}`}>
        <div className="bd-proj-panel-content">
          <div className="bd-proj-info-block">
            <div className="bd-proj-num">{num}</div>
            <div className="bd-proj-title">{proj.title}</div>
            <div className="bd-proj-tags">
              {proj.tags.map((t) => (
                <span className="bd-proj-tag" key={t}>{t}</span>
              ))}
            </div>
          </div>

          <div className="bd-proj-right">
            <div className="bd-proj-panel-bg" style={{ backgroundImage: `url(${proj.img})` }} aria-hidden="true" />
            <div className="bd-proj-panel-overlay" aria-hidden="true" />

            <img className="bd-proj-img" src={proj.img} alt={proj.alt} loading="lazy" />

            <div className="bd-proj-meta-trigger">
              <span className="bd-proj-year">{proj.year}</span>
              <span className="bd-proj-arrow">
                View Project <span className="bd-proj-arrow-icon">→</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </ScrollReveal>
  );
}

function InProgressList({ projects }) {
  if (projects.length === 0) return null;

  return (
    <section className="bd-inprogress" aria-labelledby="inprogress-heading">
      <h3 className="bd-inprogress-label" id="inprogress-heading">Also in progress</h3>
      <ul className="bd-inprogress-list">
        {projects.map((p) => (
          <li key={p.id}>
            <Link className="bd-inprogress-row" to={`/project/${p.id}`}>
              <span className="bd-inprogress-title">{p.title}</span>
              <span className="bd-inprogress-meta">{p.category}</span>
              <span className="bd-inprogress-meta">{p.location}</span>
              <span className="bd-inprogress-meta">{p.area}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Photographed projects as image rows, the rest as a compact text list.
function ProjectLists({ projects }) {
  if (projects.length === 0) {
    return <p className="bd-empty-state">No projects in this category yet.</p>;
  }

  const { photographed, inProgress } = splitByPhotos(projects);

  return (
    <>
      {photographed.length > 0 && (
        <div className="bd-projects">
          {photographed.map((p, i) => (
            <ProjectRow key={p.id} proj={p} num={formatNum(i)} />
          ))}
        </div>
      )}
      <InProgressList projects={inProgress} />
    </>
  );
}

const FILTERS = [ALL_PROJECTS, ...CATEGORIES];

export function Work({ projects = PROJECTS }) {
  const [activeCat, setActiveCat] = useState(ALL_PROJECTS);
  const visible = filterByCategory(projects, activeCat);

  return (
    <section className="bd-work" id="work" aria-labelledby="work-heading">
      <div className="bd-work-section-padding">
        <ScrollReveal>
          <div className="bd-section-label" id="work-heading" role="heading" aria-level="2">
            Selected Work
          </div>
        </ScrollReveal>

        <ul className="bd-filter-bar" aria-label="Filter projects by category">
          {FILTERS.map((cat) => (
            <li key={cat}>
              <button
                type="button"
                className={`bd-filter-btn ${activeCat === cat ? "active" : ""}`}
                aria-pressed={activeCat === cat}
                onClick={() => setActiveCat(cat)}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>

        <div className="bd-mobile-filter-container">
          <select
            className="bd-mobile-select"
            value={activeCat}
            onChange={(e) => setActiveCat(e.target.value)}
            aria-label="Filter projects by category"
          >
            {FILTERS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bd-work-lists" key={activeCat}>
        <ProjectLists projects={visible} />
      </div>
    </section>
  );
}

function Statement() {
  return (
    <section className="bd-statement" aria-label="Brand statement">
      <div className="bd-stmt-bg" aria-hidden="true" />
      <div className="bd-stmt-gradient" aria-hidden="true" />
      
      <div className="bd-stmt-inner">
        <ScrollReveal>
          <p className="bd-stmt-text">
            TRANSFORMING<br />
            <em>COMMERCIAL</em><br />
            SPACES INTO<br />
            EXPERIENCES
          </p>
        </ScrollReveal>
        
        <ScrollReveal>
          <div className="bd-statement-links">
            <Link className="bd-stmt-link" to="/about">About Yousef</Link>
            <span className="bd-stmt-link-sep" aria-hidden="true">·</span>
            <Link className="bd-stmt-link" to="/about">Our Process</Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="bd-services" id="services" aria-labelledby="svc-heading">
      <ScrollReveal>
        <div className="bd-section-label" id="svc-heading" role="heading" aria-level="2">
          What We Do
        </div>
      </ScrollReveal>
      <div className="bd-svc-grid">
        {SERVICES.map((s, idx) => (
          <div className="bd-svc" key={s.num}>
            <ScrollReveal animationClass={`reveal-fade-up delay-${(idx + 1) * 100}`}>
              <div className="bd-svc-num">{s.num}</div>
              <div className="bd-svc-title">{s.title}</div>
              <p className="bd-svc-desc">{s.desc}</p>
            </ScrollReveal>
          </div>
        ))}
      </div>
    </section>
  );
}

const STUDIO_EMAIL = "hello@barrydesigns.co";

// Social profiles: add URLs here to show the icons in the footer
const SOCIAL_LINKS = {
  instagram: "",
  facebook: "",
  linkedin: "",
};

function Footer() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const name = data.get("name").trim();
    const email = data.get("email").trim();
    const message = data.get("message").trim();

    const subject = `Project enquiry from ${name}`;
    const body = `${message}\n\n${name}\n${email}`;

    window.location.href = `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <footer className="bd-contact" id="contact" aria-labelledby="contact-heading">
      <div className="bd-contact-inner">
        <div>
          <ScrollReveal>
            <h2 className="bd-contact-h2" id="contact-heading">
              <em>HELLO</em>
            </h2>
          </ScrollReveal>
          
          <form className="bd-form" onSubmit={handleSubmit}>
            <input type="text" name="name" className="bd-input" placeholder="Your Name" required />
            <input type="email" name="email" className="bd-input" placeholder="Email Address" required />
            <textarea name="message" className="bd-textarea" placeholder="Tell us about your project..." required></textarea>
            
            <button type="submit" className="bd-submit">
              Send Message
            </button>

            <p className="bd-form-msg">
              Opens your email app. Or write to us directly at{" "}
              <a href={`mailto:${STUDIO_EMAIL}`}>{STUDIO_EMAIL}</a>
            </p>
          </form>
        </div>
        
        <div>
          <div className="bd-contact-detail">
            <div className="bd-contact-label">Email</div>
            <div className="bd-contact-val">
              <a href="mailto:hello@barrydesigns.co">hello@barrydesigns.co</a>
            </div>
          </div>
          <div className="bd-contact-detail">
            <div className="bd-contact-label">Phone</div>
            <div className="bd-contact-val">
              <a href="tel:+17137146207">+1 (713) 714-6207</a>
            </div>
          </div>
          <div className="bd-contact-detail">
            <div className="bd-contact-label">Studio</div>
            <div className="bd-contact-val">
              4201 N Main St.<br />Houston, TX 77002
            </div>
          </div>
          
          {/* Replaced text links with crisp, geometric vector nodes */}
          {Object.values(SOCIAL_LINKS).some(Boolean) && (
            <nav className="bd-social" aria-label="Social links">
              {SOCIAL_LINKS.instagram && (
                <a className="bd-social-icon-link" href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {SOCIAL_LINKS.facebook && (
                <a className="bd-social-icon-link" href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
              )}
              {SOCIAL_LINKS.linkedin && (
                <a className="bd-social-icon-link" href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              )}
            </nav>
          )}
        </div>
      </div>

      <div className="bd-footer-sub-grid">
        <Link to="/" className="bd-footer-logo-wrap" aria-label="Barry Design Studio Home">
          <Logo />
        </Link>
        <p className="bd-footer-copy">
          © {new Date().getFullYear()} Barry Design Studio LLC · All Rights Reserved
          <span className="bd-credit-sep"> · </span>
          <a href="https://hearhear.agency" className="bd-agency-link" target="_blank" rel="noopener noreferrer">Designed by Hear Hear Agency</a>
        </p>
      </div>
    </footer>
  );
}

// ─── ROUTE COMPONENTS ─────────────────────────────────────────────────────────

export function ProjectCategory() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const category = findCategoryBySlug(slug);

  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  if (!category) {
    return (
      <div className="bd-page">
        <header className="bd-detail-header">
          <Link to="/" className="bd-detail-back">← Back to Home</Link>
          <h1 className="bd-detail-title">Category Not Found</h1>
        </header>
      </div>
    );
  }

  return (
    <article className="bd-page">
      <header className="bd-detail-header">
        <Link to="/" className="bd-detail-back">← Back to Home</Link>
        <div className="bd-eyebrow">Project Typology</div>
        <h1 className="bd-detail-title">{category.toUpperCase()}</h1>
      </header>

      <ProjectLists projects={filterByCategory(PROJECTS, category)} />
    </article>
  );
}

function Home() {
  const { hash, key } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      scrollToTop();
    }
  }, [hash, key]);

  return (
    <>
      <Hero />
      {/* Every link to #work (e.g. the menu's "All Projects") remounts the list, clearing the filter. */}
      <Work key={hash === "#work" ? key : "work"} />
      <Statement />
      <Services />
    </>
  );
}

export function About() {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  return (
    <article className="bd-page">
      <header className="bd-detail-header">
        <Link to="/" className="bd-detail-back">← Back to Home</Link>
        <div className="bd-eyebrow">Founder, Barry Design Studio</div>
        <h1 className="bd-detail-title">YOUSEF ELBARRY</h1>
      </header>

      <div className="bd-about-hero">
        <img src="/images/about-studio.webp" alt="Barry Design Studio workspace" className="bd-about-hero-img" />
      </div>

      <div className="bd-about-grid">
        <div className="bd-about-text-block">
          <blockquote className="bd-founder-quote">
            “At the age of 4, I built my first Lego bridge to allow my toy cars to cross over a “river” on the carpet in my room. A Couple of years after that, I built my first house with cigarette packs glued together. At the time all the empty lots around my neighborhood were being built. I was captivated by the huge slabs of concrete and brick walls, workers and the noise of their machines. At the age of 10 I decided to be a Designer.”
          </blockquote>

          <p>Although born in the state of Tennessee, Cairo, Egypt is my hometown where I was raised and educated. There, I studied in the School of Engineering, Department of Architecture and Environmental Design at AAST University.</p>
          <p>I earned my bachelor's degree, which was accredited and partnered with The Royal Institute of British Architects, guaranteeing a high standard of education and recognition. This comprehensive program exposed me to various disciplines within the field of building science, including civil engineering, structural design, MEP systems, project management, and beyond.</p>
          <p className="bd-founder-name">Yousef Elbarry</p>
        </div>

        <div>
          <img src="/images/yousef-elbarry-portrait.png" alt="Yousef Elbarry" className="bd-about-img" />
        </div>
      </div>
    </article>
  );
}

function Carousel({ images, title }) {
  const [idx, setIdx] = useState(0);
  const touchStart = useRef(null);
  const count = images.length;

  const go = (delta) => setIdx((i) => wrapIndex(i + delta, count));

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  // Single-finger gestures only; a second finger or a cancelled touch abandons the swipe.
  const handleTouchStart = (e) => {
    touchStart.current =
      e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
  };

  const handleTouchCancel = () => {
    touchStart.current = null;
  };

  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const touch = e.changedTouches[0];
    const step = swipeStep(touchStart.current, { x: touch.clientX, y: touch.clientY });
    touchStart.current = null;
    if (step !== 0) go(step);
  };

  return (
    <div className="bd-carousel-wrap">
      <div
        className="bd-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} gallery`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${title} gallery image ${i + 1} of ${count}`}
            className={`bd-carousel-img ${i === idx ? "active" : ""}`}
            aria-hidden={i !== idx}
          />
        ))}

        {count > 1 && (
          <>
            <button type="button" className="bd-carousel-btn prev" onClick={() => go(-1)} aria-label="Previous image">←</button>
            <button type="button" className="bd-carousel-btn next" onClick={() => go(1)} aria-label="Next image">→</button>

            <div className="bd-carousel-count" aria-live="polite">
              {idx + 1} / {count}
            </div>

            <div className="bd-carousel-dots">
              {images.map((src, i) => (
                <button
                  type="button"
                  key={src}
                  className={`bd-carousel-dot ${i === idx ? "active" : ""}`}
                  onClick={() => setIdx(i)}
                  aria-label={`Go to image ${i + 1}`}
                  aria-current={i === idx}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Keyed by id so the carousel resets when moving between projects.
function ProjectDetailRoute() {
  const { id } = useParams();
  return <ProjectDetail key={id} id={id} />;
}

export function ProjectDetail({ id }) {
  const proj = findProject(id);

  useEffect(() => {
    scrollToTop();
  }, [id]);

  if (!proj) {
    return (
      <div className="bd-not-found">
        <h2 className="bd-not-found-title">Project Not Found</h2>
      </div>
    );
  }

  const next = nextProject(PROJECTS, proj.id);

  return (
    <article className="bd-page">
      <header className="bd-detail-header">
        <Link to="/" className="bd-detail-back">← Back to Home</Link>
        <h1 className="bd-detail-title">{proj.title}</h1>

        <div className="bd-detail-meta">
          <div>
            <div className="bd-detail-meta-label">Year Completed</div>
            <div className="bd-detail-meta-val">{proj.year}</div>
          </div>
          <div>
            <div className="bd-detail-meta-label">Location</div>
            <div className="bd-detail-meta-val">{proj.location}</div>
          </div>
          <div>
            <div className="bd-detail-meta-label">Area</div>
            <div className="bd-detail-meta-val">{proj.area}</div>
          </div>
          <div>
            <div className="bd-detail-meta-label">Services Provided</div>
            <div className="bd-detail-meta-val">{proj.tags.join(" • ")}</div>
          </div>
        </div>
      </header>

      {hasPhotos(proj) && <Carousel images={proj.gallery} title={proj.title} />}

      <div className="bd-detail-body">
        <p>{proj.desc}</p>
        {proj.procurement && <p>{PROCUREMENT_COPY}</p>}
      </div>

      {next && (
        <nav className="bd-next" aria-label="Next project">
          <Link to={`/project/${next.id}`} className="bd-next-link">
            <span className="bd-next-label">Next project</span>
            <span className="bd-next-title">{next.title}</span>
          </Link>
        </nav>
      )}
    </article>
  );
}

export default function BarryDesignStudio() {
  return (
    <BrowserRouter>
      <a href="#main" className="bd-skip-link">
        Skip to main content
      </a>
      <Nav />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/project/:id" element={<ProjectDetailRoute />} />
          <Route path="/category/:slug" element={<ProjectCategory />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
