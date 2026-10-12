import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useLocation } from "react-router-dom";
import "./App.css";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    id: "xo-juice-and-studio",
    num: "01",
    category: "Health & Wellness",
    title: "XO JUICE AND STUDIO",
    year: "2026", 
    location: "3201 N Shepherd Dr. #109 Houston, TX 77018",
    area: "1,500 sf.",
    tags: ["Interior Design", "Custom Fixtures", "Space Planning"],
    img: "/src/assets/projects/xo/xo-1.jpg", 
    gallery: [
      "/src/assets/projects/xo/xo-1.jpg", 
      "/src/assets/projects/xo/xo-2.jpg", 
      "/src/assets/projects/xo/xo-3.jpg", 
      "/src/assets/projects/xo/xo-4.jpg", 
      "/src/assets/projects/xo/xo-5.jpg"  
    ],
    alt: "XO Juice Bar and Pilates Studio high-end interior rendering",
    desc: "A vibrant 1,500 sq. ft. health and wellness hub combining a premium juice bar with a dedicated pilates reformer studio. The design features a signature natural tree and custom light fixtures that embody the brand identity, establishing a fluid layout where circulation gracefully defines user interaction."
  },
  {
    id: "omg-burger",
    num: "02",
    category: "Restaurants & Bars",
    title: "OMG BURGER",
    year: "2026",
    location: "5333 Westheimer Rd, Houston, TX 77056",
    area: "3,500 sf.",
    tags: ["Renovation", "F&B Design", "Modernization"],
    img: "/src/assets/projects/omg-burger/omg-burger-1.jpg",
    gallery: [
      "/src/assets/projects/omg-burger/omg-burger-1.jpg",
      "/src/assets/projects/omg-burger/omg-burger-2.jpg",
      "/src/assets/projects/omg-burger/omg-burger-3.jpg",
      "/src/assets/projects/omg-burger/omg-burger-4.jpg",
      "/src/assets/projects/omg-burger/omg-burger-5.jpg"
    ],
    alt: "OMG Burger restaurant interior on Westheimer Rd",
    desc: "A sweeping 3,500 sq. ft. renovation project on Westheimer Road in the Galleria area, repurposing an office building's ground floor into a restaurant and bar. The modernization features a striking, centrally placed rectangular communal table paired with an intuitive counter-service flow and a high-capacity commercial kitchen."
  },
  {
    id: "greek-orthodox-cathedral",
    num: "03",
    category: "Institutional",
    title: "GREEK ORTHODOX CATHEDRAL",
    year: "2026",
    location: "3511 Yoakum Blvd, Houston, TX 77006",
    area: "Pending Verification",
    tags: ["Architecture", "Cultural", "Houston"],
    img: "/src/assets/photos-coming-soon.png",
    gallery: [
      "/src/assets/photos-coming-soon.png"
    ],
    alt: "Greek Orthodox Cathedral on Yoakum Blvd",
    desc: "Located on Yoakum Blvd in Houston, this landmark project focuses on preserving rich cultural heritage while enhancing structural functionality and spatial community integration. (Full text details pending verification)."
  },
  {
    id: "cyclone-anayas",
    num: "04",
    category: "Restaurants & Bars",
    title: "CYCLONE ANAYAS",
    year: "2026",
    location: "3736 Westheimer Rd, Houston, TX 77027",
    area: "5,000 sf.",
    tags: ["High-End Design", "Tex-Mex", "River Oaks"],
    img: "/src/assets/projects/cyclone-anayas/cyclone-anayas-1.jpg",
    gallery: [
      "/src/assets/projects/cyclone-anayas/cyclone-anayas-1.jpg",
      "/src/assets/projects/cyclone-anayas/cyclone-anayas-2.jpg",
      "/src/assets/projects/cyclone-anayas/cyclone-anayas-3.jpg",
      "/src/assets/projects/cyclone-anayas/cyclone-anayas-4.jpg"
    ],
    alt: "Cyclone Anayas Restaurant interior",
    desc: "A sophisticated, new 5,000 sq. ft. Tex-Mex restaurant and bar situated in the exclusive River Oaks area. Built on the design ethos that 'every detail matters,' the space leans on custom luxury finishes to deliver an elevated, premium hospitality experience."
  },
  {
    id: "haii-keii",
    num: "05",
    category: "Restaurants & Bars",
    title: "HAII KEII",
    year: "2026",
    location: "3300 Kirby Dr Suite 9-A, Houston, TX 77098",
    area: "3,800 sf.",
    tags: ["Hospitality", "Sushi Restaurant", "Millwork"],
    img: "/src/assets/projects/haii-keii/haii-keii-1.jpg",
    gallery: [
      "/src/assets/projects/haii-keii/haii-keii-1.jpg",
      "/src/assets/projects/haii-keii/haii-keii-2.jpg",
      "/src/assets/projects/haii-keii/haii-keii-3.jpg",
      "/src/assets/projects/haii-keii/haii-keii-4.jpg",
      "/src/assets/projects/haii-keii/haii-keii-5.jpg"
    ],
    alt: "Haii Keii Sushi Restaurant interior on Kirby Dr",
    desc: "A stunning 3,800 sq. ft. high-end sushi restaurant located on Kirby Drive. The architectural vision brings a complete reimagining of modern elements, relying heavily on seamless spatial curvatures, warm ambient light modeling, and sophisticated materiality."
  },
  {
    id: "flying-saucer-draught",
    num: "06",
    category: "Restaurants & Bars",
    title: "FLYING SAUCER DRAUGHT",
    year: "2026",
    location: "DFW International Airport",
    area: "6,000 sf.",
    tags: ["Airport Retail", "Commercial", "DFW"],
    img: "/src/assets/photos-coming-soon.png",
    gallery: [
      "/src/assets/photos-coming-soon.png"
    ],
    alt: "Flying Saucer Draught DFW Airport interior",
    desc: "An expansive 6,000 sq. ft. commercial restaurant and bar layout designed specifically for the fast-paced environment of the Dallas-Fort Worth International Airport (DFW). Optimizes operational efficiency without compromising on aesthetics."
  },
  {
    id: "bauhaus-houston",
    num: "07",
    category: "Nightlife",
    title: "BAUHAUS HOUSTON",
    year: "2023",
    location: "1803 Pease St, Houston, TX 77003",
    area: "4,000 sf.",
    tags: ["Club Design", "Lighting", "Acoustics"],
    img: "/src/assets/projects/bauhaus/bauhaus-1.jpg",
    gallery: [
      "/src/assets/projects/bauhaus/bauhaus-1.jpg",
      "/src/assets/projects/bauhaus/bauhaus-2.jpg",
      "/src/assets/projects/bauhaus/bauhaus-3.jpg",
      "/src/assets/projects/bauhaus/bauhaus-4.jpg"
    ],
    alt: "Bauhaus Houston Nightclub interior on Pease St",
    desc: "A bold exploration of mood and shadow located at 1803 Pease St. For this 4,000 sq. ft. venue, our design strategy prioritized cutting-edge lighting design integrations, acoustic engineering, and an intuitive layout optimized for crowd flow."
  },
  {
    id: "doubletree-by-hilton",
    num: "08",
    category: "Hospitality",
    title: "DOUBLETREE BY HILTON",
    year: "2026",
    location: "12801 Northwest Fwy, Houston, TX 77040",
    area: "7,800 sf.",
    tags: ["Hotel Design", "Commercial Lounge", "Lobby"],
    img: "/src/assets/photos-coming-soon.png",
    gallery: [
      "/src/assets/photos-coming-soon.png"
    ],
    alt: "Doubletree by Hilton interior spaces",
    desc: "A comprehensive 7,800 sq. ft. hospitality design package executing a full spatial transformation. Focuses heavily on traffic routing, premium FF&E selections, and timeless aesthetic details that match standard brand benchmarks."
  },
  {
    id: "airport-retail-spaces",
    num: "09",
    category: "Retail",
    title: "AIRPORT RETAIL SPACES",
    year: "2026",
    location: "MSY - Louis Armstrong New Orleans International Airport",
    area: "Varies",
    tags: ["Commercial", "Retail Design", "Aviation"],
    img: "/src/assets/photos-coming-soon.png",
    gallery: [
      "/src/assets/photos-coming-soon.png"
    ],
    alt: "Louis Armstrong New Orleans International Airport retail spaces",
    desc: "A dynamic suite of retail builds located throughout the Louis Armstrong New Orleans International Airport (MSY). Spaces vary in footprint but remain strictly unified through smart programmatic design, high durability finishes, and specialized point-of-sale layout structures."
  }
];

const SERVICES = [
  {
    num: "01",
    title: "CONCEPT & STRATEGY",
    desc: "Space programming, mood development, material direction — the full creative brief before a single line is drawn.",
  },
  {
    num: "02",
    title: "DESIGN & DOCUMENTATION",
    desc: "Construction documents, FF&E specifications, finish schedules, and permit-ready drawing sets.",
  },
  {
    num: "03",
    title: "PROCUREMENT",
    desc: "Vendor sourcing, trade pricing, and project management through delivery and installation.",
  },
  {
    num: "04",
    title: "BRAND ALIGNMENT",
    desc: "Ensuring every spatial decision reinforces your brand identity — from signage to materiality to lighting mood.",
  },
];

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ─── REUSABLE OBSERVATION COMPONENT ──────────────────────────────────────────

function ScrollReveal({ children, animationClass = "reveal-fade-up" }) {
  const elementRef = useRef(null);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    if (!elementRef.current || hasRevealed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -20px 0px"
      }
    );

    observer.observe(elementRef.current);

    return () => {
      if (elementRef.current) {
        observer.disconnect();
      }
    };
  }, [hasRevealed]);

  return (
    <div 
      ref={elementRef} 
      className={`${animationClass} ${hasRevealed ? "visible" : ""}`}
      style={{ width: "100%" }}
    >
      {children}
    </div>
  );
}

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="bd-logo-link">
      <img 
        src="/src/assets/logo.png" 
        alt="Barry Design Studio" 
        className="bd-logo-img"
      />
    </div>
  );
}

function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegamenuVisible, setIsMegamenuVisible] = useState(false);
  const [activePreview, setActivePreview] = useState(0); 
  const timeoutRef = useRef(null);

  const megamenuItems = [
    { name: "All Projects", path: "/#work", img: "/src/assets/projects/omg-burger/omg-burger-1.jpg", sub: "Complete Studio Index" },
    { name: "Health & Wellness", path: "/category/health-wellness", img: "/src/assets/projects/xo/xo-1.jpg", sub: "Studio & Spa Planning" },
    { name: "Restaurants & Bars", path: "/category/restaurants-bars", img: "/src/assets/projects/omg-burger/omg-burger-1.jpg", sub: "Hospitality & Dining" },
    { name: "Nightlife", path: "/category/nightlife", img: "/src/assets/projects/bauhaus/bauhaus-1.jpg", sub: "Clubs & Lounge Acoustics" },
    { name: "Hospitality", path: "/category/hospitality", img: "/src/assets/photos-coming-soon.png", sub: "Hotels & Commercial Lounges" },
    { name: "Retail", path: "/category/retail", img: "/src/assets/photos-coming-soon.png", sub: "Airport & Storefront Brand Builds" },
    { name: "Institutional", path: "/category/institutional", img: "/src/assets/photos-coming-soon.png", sub: "Cultural Landmark Structures" }
  ];

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

  return (
    <>
      <nav className="bd-nav" aria-label="Main navigation">
        <Link to="/" onClick={closeMenu} aria-label="Barry Design Studio Home" style={{ textDecoration: 'none' }}>
          <Logo />
        </Link>
        
        <ul className="bd-nav-links">
          <li 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Link to="/#work">Work</Link>
            
            <div className={`bd-megamenu-canvas ${isMegamenuVisible ? "active" : ""}`}>
              <div className="bd-megamenu-list-block">
                <div className="bd-megamenu-label">Project Typologies</div>
                <div className="bd-megamenu-links-grid">
                  {megamenuItems.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      className="bd-megamenu-link"
                      onMouseEnter={() => setActivePreview(idx)}
                      onClick={() => setIsMegamenuVisible(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bd-megamenu-display-canvas">
                {megamenuItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`bd-megamenu-preview-img ${activePreview === idx ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${item.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    aria-hidden="true"
                  />
                ))}
                <div className="bd-megamenu-display-text">
                  <div className="bd-megamenu-display-h3">{megamenuItems[activePreview].name.toUpperCase()}</div>
                  <div className="bd-megamenu-display-sub">{megamenuItems[activePreview].sub}</div>
                </div>
              </div>
            </div>
          </li>
          
          <li><Link to="/about">About</Link></li>
          <li><Link to="/#services">Services</Link></li>
          <li><a href="#contact" onClick={scrollToContact} style={{ cursor: "pointer" }}>Contact</a></li>
        </ul>
        
        <div className="bd-nav-actions">
          <a href="#contact" className="bd-nav-cta" onClick={scrollToContact}>
            Get in Touch
          </a>
          
          <button 
            className={`bd-hamburger ${isMenuOpen ? "open" : ""}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            aria-label="Toggle Menu"
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div className={`bd-mobile-menu ${isMenuOpen ? "active" : ""}`}>
        <ul style={{ listStyle: 'none', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <li><Link to="/#work" onClick={closeMenu} style={{ fontFamily: 'var(--display)', fontSize: '3.5rem', color: 'var(--bone)', textDecoration: 'none', letterSpacing: '0.05em' }}>Work</Link></li>
          <li><Link to="/about" onClick={closeMenu} style={{ fontFamily: 'var(--display)', fontSize: '3.5rem', color: 'var(--bone)', textDecoration: 'none', letterSpacing: '0.05em' }}>About</Link></li>
          <li><Link to="/#services" onClick={closeMenu} style={{ fontFamily: 'var(--display)', fontSize: '3.5rem', color: 'var(--bone)', textDecoration: 'none', letterSpacing: '0.05em' }}>Services</Link></li>
          <li><a href="#contact" onClick={scrollToContact} style={{ fontFamily: 'var(--display)', fontSize: '3.5rem', color: 'var(--bone)', textDecoration: 'none', letterSpacing: '0.05em' }}>Contact</a></li>
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
      
      <ScrollReveal>
        <p className="bd-hero-eyebrow">Houston, TX · Architectural Design Studio</p>
      </ScrollReveal>

      <h1 className="bd-hero-h1">
        <span>WE CREATE</span>
        <span>INNOVATIVE</span>
        <span>SPACES</span>
      </h1>

      <ScrollReveal>
        <p className="bd-hero-sub" style={{ animation: "none" }}>
          By combining spatial precision with artistic sensibility, we help
          clients align, structure and elevate their built environments.
        </p>
      </ScrollReveal>

      <ScrollReveal>
        <div className="bd-hero-btns" style={{ animation: "none" }}>
          <Link to="/#work" className="bd-btn-fill">
            View Projects
          </Link>
          <Link to="/about" className="bd-btn-ghost">
            Our Process
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}

function ProjectRow({ proj }) {
  return (
    <ScrollReveal>
      <Link className="bd-proj" to={`/project/${proj.id}`} aria-label={`View project: ${proj.title}`}>
        <div className="bd-proj-panel-content">
          
          <div className="bd-proj-info-block">
            <div className="bd-proj-num">{proj.num}</div>
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

function Work() {
  const categories = [
    "All Projects",
    "Health & Wellness",
    "Restaurants & Bars",
    "Nightlife",
    "Hospitality",
    "Retail",
    "Institutional"
  ];

  const [activeCat, setActiveCat] = useState("All Projects");

  const filteredProjects = activeCat === "All Projects"
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === activeCat);

  return (
    <section className="bd-work" id="work" aria-labelledby="work-heading">
      <div className="bd-work-section-padding">
        <ScrollReveal>
          <div className="bd-section-label" id="work-heading" role="heading" aria-level="2">
            Selected Work
          </div>
        </ScrollReveal>
        
        <ScrollReveal>
          <ul className="bd-filter-bar" role="tablist" aria-label="Project category filters" style={{ marginBottom: '2rem' }}>
            {categories.map((cat) => (
              <li key={cat} role="presentation">
                {cat === "All Projects" ? (
                  <button
                    role="tab"
                    aria-selected={activeCat === cat}
                    className={`bd-filter-btn ${activeCat === cat ? "active" : ""}`}
                    onClick={() => setActiveCat(cat)}
                  >
                    {cat}
                  </button>
                ) : (
                  <Link 
                    to={`/category/${slugify(cat)}`}
                    className="bd-filter-btn"
                    style={{ textDecoration: 'none', display: 'inline-block' }}
                  >
                    {cat}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal>
          <div className="bd-mobile-filter-container">
            <select 
              className="bd-mobile-select" 
              value={activeCat} 
              onChange={(e) => {
                const val = e.target.value;
                if (val === "All Projects") {
                  setActiveCat(val);
                } else {
                  window.location.href = `/category/${slugify(val)}`;
                }
              }}
              aria-label="Filter selected work by project category"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </ScrollReveal>
      </div>
      
      <div className="bd-projects" key={activeCat}>
        {filteredProjects.map((p) => (
          <ProjectRow key={p.id} proj={p} />
        ))}
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

function Footer() {
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("Sending...");
    
    setTimeout(() => {
      setStatus("Message sent successfully. We will be in touch soon!");
      e.target.reset();
      setTimeout(() => setStatus(""), 5000);
    }, 1500);
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
            
            <button type="submit" className="bd-submit" disabled={status === "Sending..."}>
              {status === "Sending..." ? "Sending..." : "Send Message"}
            </button>
            
            {status && status !== "Sending..." && (
              <div className="bd-form-msg">{status}</div>
            )}
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
          <nav className="bd-social" aria-label="Social links">
            <a className="bd-social-link" href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a className="bd-social-link" href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a className="bd-social-link" href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </nav>
        </div>
      </div>

      {/* Modernized vertical sub-arrangement element block container */}
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

function ProjectCategory() {
  const { slug } = useParams();
  const { pathname } = useLocation();

  const categories = [
    "Health & Wellness",
    "Restaurants & Bars",
    "Nightlife",
    "Hospitality",
    "Retail",
    "Institutional"
  ];

  const currentCategory = categories.find(cat => slugify(cat) === slug);
  const filteredProjects = PROJECTS.filter(p => slugify(p.category) === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!currentCategory) {
    return (
      <div className="bd-category-view-fallback">
        <header className="bd-detail-header">
          <Link to="/" className="bd-detail-back">← Back to Home</Link>
          <h1 className="bd-detail-title">Category Not Found</h1>
        </header>
      </div>
    );
  }

  return (
    <article className="bd-category-view-canvas">
      <header className="bd-detail-header">
        <Link to="/" className="bd-detail-back">← Back to Home</Link>
        <div className="bd-category-view-eyebrow">Project Typology</div>
        <h1 className="bd-detail-title">{currentCategory.toUpperCase()}</h1>
      </header>

      <div className="bd-category-view-list">
        {filteredProjects.length > 0 ? (
          <div className="bd-projects">
            {filteredProjects.map((p) => (
              <ProjectRow key={p.id} proj={p} />
            ))}
          </div>
        ) : (
          <div className="bd-category-empty-state">
            <p>No selected works are currently registered under this category format.</p>
          </div>
        )}
      </div>
    </article>
  );
}

function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <main>
      <Hero />
      <Work />
      <Statement />
      <Services />
    </main>
  );
}

function About() {
  const { pathname } = useLocation();
  const [activeAccordion, setActiveAccordion] = useState(0); 

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const steps = [
    {
      title: "Dream it",
      desc: "Welcome to Barry Design Studio, where innovation meets excellence in building and design. Founded by Yousef El Barry, our studio is dedicated to crafting exceptional spaces that inspire and endure.",
      img: "/src/assets/projects/xo/xo-1.jpg"
    },
    {
      title: "Build it",
      desc: "Whether it's commercial or public spaces, we approach each endeavor with a fresh perspective, harnessing the latest technologies and sustainable practices to create environments that enrich lives and communities.",
      img: "/src/assets/projects/omg-burger/omg-burger-1.jpg"
    },
    {
      title: "Grow it",
      desc: "Join us on a journey of creativity, collaboration, and craftsmanship as we transform your ideas into reality. Welcome to Barry Design Studio – where every detail matters, and every space tells a story.",
      img: "/src/assets/projects/cyclone-anayas/cyclone-anayas-1.jpg"
    }
  ];

  return (
    <article style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      <header className="bd-detail-header">
        <Link to="/" className="bd-detail-back">← Back to Home</Link>
        <h1 className="bd-detail-title">ABOUT US</h1>
      </header>

      <div style={{ padding: '0 2.5rem' }}>
        <img 
          src="https://images.squarespace-cdn.com/content/v1/61e5bbaaaa60576c7f3d0d8f/b4239211-40c8-4f41-a98c-9d3168cecb2e/IMG_1747.jpg" 
          alt="Barry Design Studio Workspace" 
          className="bd-detail-hero-img" 
          style={{ height: '50vh' }}
        />
      </div>

      <div className="bd-about-content" style={{ maxWidth: '100%', padding: '4rem 0 0' }}>

        <div className="bd-about-process-wrap">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className={`bd-about-accordion-item ${activeAccordion === idx ? 'active' : ''}`}
              onMouseEnter={() => setActiveAccordion(idx)}
              onClick={() => setActiveAccordion(idx)}
            >
              <div className="bd-accordion-panel-bg" style={{ backgroundImage: `url(${step.img})` }} aria-hidden="true" />
              <div className="bd-accordion-panel-overlay" aria-hidden="true" />

              <div className="bd-accordion-content-wrap">
                <div className="bd-about-accordion-title">{step.title}</div>
                <div className="bd-about-accordion-desc">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bd-about-grid" style={{ maxWidth: '1100px', margin: '6rem auto 0', padding: '0 2.5rem' }}>
          <div>
            <img 
              src="/src/assets/yousef-elbarry-portrait.png" 
              alt="Yousef Elbarry" 
              className="bd-about-img" 
            />
          </div>
          <div className="bd-about-text-block">
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Founder</h2>
            <h2 style={{ color: 'var(--hi)' }}>Yousef Elbarry</h2>
            
            <div className="bd-founder-quote">
              “At the age of 4, I built my first Lego bridge to allow my toy cars to cross over a “river” on the carpet in my room. A Couple of years after that, I built my first house with cigarette packs glued together. At the time all the empty lots around my neighborhood were being built. I was captivated by the huge slabs of concrete and brick walls, workers and the noise of their machines. At the age of 10 I decided to be a Designer.”
            </div>
            
            <p>Although born in the state of Tennessee, Cairo, Egypt is my hometown where I was raised and educated. There, I studied in the School of Engineering, Department of Architecture and Environmental Design at AAST University.</p>
            <p>I earned my bachelor's degree, which was accredited and partnered with The Royal Institute of British Architects, guaranteeing a high standard of education and recognition. This comprehensive program exposed me to various disciplines within the field of building science, including civil engineering, structural design, MEP systems, project management, and beyond.</p>
          </div>
        </div>

      </div>
    </article>
  );
}

function ProjectDetail() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const proj = PROJECTS.find((p) => p.id === id);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentIdx(0);
  }, [pathname]);

  if (!proj) {
    return (
      <div style={{ padding: '10rem 2.5rem', textAlign: 'center', minHeight: '80vh' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontSize: '3rem' }}>Project Not Found</h2>
      </div>
    );
  }

  const nextSlide = () => setCurrentIdx((prev) => (prev + 1) % proj.gallery.length);
  const prevSlide = () => setCurrentIdx((prev) => (prev === 0 ? proj.gallery.length - 1 : prev - 1));

  return (
    <article style={{ background: 'var(--ink)', minHeight: '100vh' }}>
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

      <div style={{ padding: '2.5rem' }}>
        <div className="bd-carousel">
          {proj.gallery && proj.gallery.map((imgUrl, idx) => (
            <img 
              key={idx} 
              src={imgUrl} 
              alt={`${proj.title} Gallery Image ${idx + 1}`} 
              className={`bd-carousel-img ${idx === currentIdx ? 'active' : ''}`} 
            />
          ))}
          
          {proj.gallery && proj.gallery.length > 1 && (
            <>
              <button className="bd-carousel-btn prev" onClick={prevSlide} aria-label="Previous image">←</button>
              <button className="bd-carousel-btn next" onClick={nextSlide} aria-label="Next image">→</button>
            </>
          )}
          
          <div className="bd-carousel-dots">
            {proj.gallery && proj.gallery.map((_, idx) => (
              <button 
                key={idx} 
                className={`bd-carousel-dot ${idx === currentIdx ? 'active' : ''}`} 
                onClick={() => setCurrentIdx(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bd-detail-body">
        <p>{proj.desc}</p>
        <p>
          Beyond the initial spatial planning and concept generation, Barry Design Studio managed the complete procurement and installation process, ensuring every fixture, finish, and piece of furniture aligned perfectly with the design intent.
        </p>
      </div>
    </article>
  );
}

export default function BarryDesignStudio() {
  return (
    <BrowserRouter>
      <a href="#work" className="sr-only" style={{ position: "absolute", left: -9999 }}>
        Skip to main content
      </a>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/category/:slug" element={<ProjectCategory />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}