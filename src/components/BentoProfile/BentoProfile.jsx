import "./BentoProfile.css";

const PROJECTS = [
  {
    name: "Attires - Customer Portal",
    description: "Multi-vendor customer storefront with Razorpay checkout & MCP server",
    image: "/customer-front.png",
    liveUrl: "https://attires-frontend-customers.vercel.app/",
    topicPrompt: "Tell me about the Attire customer storefront and multi-vendor platform.",
  },
  {
    name: "Attires - Operations Platform",
    description: "Operations & admin portal with Google OAuth & order dispatch",
    image: "/ops.png",
    liveUrl: "https://attires-operational-plafrom.vercel.app/login",
    topicPrompt: "Tell me about the Attire operations and worker management system.",
  },
  {
    name: "Airbnb (Wanderlust) - Backend",
    description: "MVC architecture with MongoDB, Passport.js, Mapbox & Cloudinary",
    image: "/airbnb.png",
    liveUrl: "https://airbnb-backend-v1gx.onrender.com/listings",
    topicPrompt: "Tell me about the Airbnb full-stack clone project.",
  },
  {
    name: "AI Portfolio",
    description: "RAG system powered by Qdrant vector database & Groq LLMs",
    image: "/ai-portfolio.png",
    liveUrl: "https://ai-protfolio-eta.vercel.app/",
    topicPrompt: "Tell me about your GenAI RAG pipeline project.",
  },
];

export default function BentoProfile({ onSelectTopic }) {
  return (
    <div className="bento-profile-col">
      {/* 1. Hero Card */}
      <div className="bento-card bento-hero">
        <div className="bento-hero-info">
          <span className="bento-label">PORTFOLIO</span>
          <h1>Keshav Nagar</h1>
          <p className="bento-hero-sub">Full-stack &amp; AI developer</p>
        </div>
        <div className="bento-photo-box" title="Keshav Nagar">
          <img
            src="/image.png"
            alt="Keshav Nagar"
            className="bento-photo-img"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>

      {/* 2. Split Row: Education & CGPA */}
      <div className="bento-row split-2">
        <div className="bento-card">
          <span className="bento-label">EDUCATION</span>
          <h2 className="education-title">B.Tech CS</h2>
          <p className="education-sub">RTU Kota</p>
          <span className="pill-badge">Currently in 3rd year</span>
        </div>

        <div className="bento-card">
          <span className="bento-label">CGPA</span>
          <div className="cgpa-number">8.45</div>
          <p className="cgpa-years">2024 to 2028</p>
        </div>
      </div>

      {/* 3. Projects Card */}
      <div className="bento-card bento-projects-card">
        <div className="bento-card-header">
          <span className="bento-label">PROJECTS</span>
          <span className="bento-label-hint">Tap image to open live site ↗</span>
        </div>

        <div className="projects-grid">
          {PROJECTS.map((project) => (
            <div key={project.name} className="project-grid-card">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-thumb-link"
                aria-label={`Open ${project.name} live site`}
              >
                <img
                  src={project.image}
                  alt={`${project.name} live preview`}
                  className="project-thumb-img"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="project-thumb-overlay">
                  <span className="project-thumb-caption">Live Site ↗</span>
                </div>
              </a>

              <div className="project-info">
                <div
                  className="project-title"
                  onClick={() =>
                    onSelectTopic && onSelectTopic(project.topicPrompt)
                  }
                  title="Ask AI about this project"
                >
                  {project.name}
                </div>
                <p className="project-desc">{project.description}</p>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-live-btn"
                  aria-label={`Open ${project.name} live site`}
                >
                  Visit Live ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Split Row: Stack & Contact */}
      <div className="bento-row split-2">
        <div className="bento-card">
          <span className="bento-label">STACK</span>
          <p className="stack-body">
            React · Node.js · FastAPI · MongoDB<br />
            · Python · C++
          </p>
        </div>

        <div className="bento-card">
          <span className="bento-label">CONTACT</span>
          <div className="contact-items-list">
            <a href="mailto:Kn254085@gmail.com" className="contact-item-link">
              Kn254085@gmail.com
            </a>
            <a
              href="https://github.com/keshav2540"
              target="_blank"
              rel="noreferrer"
              className="contact-item-link"
            >
              github.com/keshav2540
            </a>
            <a
              href="https://linkedin.com/in/keshav-nagar"
              target="_blank"
              rel="noreferrer"
              className="contact-item-link"
            >
              linkedin.com/in/keshav-nagar
            </a>
            <span className="contact-item-text">Kota, Rajasthan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
