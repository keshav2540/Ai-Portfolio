import "./BentoProfile.css";

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
        <span className="bento-label">PROJECTS</span>
        <div className="bento-projects-content">
          <div className="projects-list">
            <div
              className="project-item"
              onClick={() =>
                onSelectTopic &&
                onSelectTopic(
                  "Tell me about the Attire multi-vendor e-commerce platform."
                )
              }
            >
              Attire e-commerce platform (MCP server)
            </div>
            <div
              className="project-item"
              onClick={() =>
                onSelectTopic &&
                onSelectTopic("Tell me about your GenAI RAG pipeline project.")
              }
            >
              GenAI RAG pipeline + MCP agent server
            </div>
            <div
              className="project-item"
              onClick={() =>
                onSelectTopic &&
                onSelectTopic("Tell me about the Airbnb full-stack clone project.")
              }
            >
              Airbnb full-stack clone
            </div>
          </div>

          <div className="projects-thumbnails">
            <div
              className="thumb-box"
              onClick={() =>
                onSelectTopic &&
                onSelectTopic("Tell me about the Attire customer frontend platform.")
              }
              title="Attire Customer Storefront"
            >
              <img
                src="/customer-front.png"
                alt="Attire Storefront"
                className="thumb-img"
              />
              <div className="thumb-overlay">
                <span className="thumb-caption">Attire Store</span>
              </div>
            </div>
            <div
              className="thumb-box"
              onClick={() =>
                onSelectTopic &&
                onSelectTopic("Tell me about the Attire operations and worker management system.")
              }
              title="Attire Operations & Admin"
            >
              <img
                src="/ops.png"
                alt="Attire Operations"
                className="thumb-img"
              />
              <div className="thumb-overlay">
                <span className="thumb-caption">Attire Ops</span>
              </div>
            </div>
          </div>
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
