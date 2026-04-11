import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Zap,
  Database,
  ChevronRight,
  Code,
  Terminal,
  Activity,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Layers,
  Globe,
  Lock,
  Server,
  Workflow
} from 'lucide-react';
import API_BASE from '../api';

const Home = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('js');

  const plans = [
    { name: 'Free', price: '$0', desc: 'Initialize with baseline access', features: ['50 calls/day', 'Core exercise metadata', 'Community support'] },
    { name: 'Developer Pro', price: '$10.99', desc: 'Advanced integration for apps', features: ['500 calls/day', 'High-Res GIF animations', 'Priority support'], recommended: true },
    { name: 'Business', price: '$25.99', desc: 'Enterprise-grade throughput', features: ['Unlimited calls', 'Custom webhooks', 'Dedicated SLA'] }
  ];

  const techStack = [
    { name: 'React', icon: <Layers size={20} /> },
    { name: 'Node.js', icon: <Server size={20} /> },
    { name: 'TypeScript', icon: <Code size={20} /> },
    { name: 'Next.js', icon: <Activity size={20} /> },
    { name: 'Tailwind', icon: <Zap size={20} /> },
    { name: 'Python', icon: <Workflow size={20} /> },
  ];

  const codeSnippets = {
    js: `// Fetch exercises that target abdominals
const res = await fetch('${API_BASE}/api/exercises/muscle/abdominals', {
  headers: {
    'x-api-key': 'your_api_key'
  }
});

const data = await res.json();
console.log(\`Found \${data.length} exercises\`);`,
    curl: `curl -X GET "${API_BASE}/api/exercises" \\
  -H "x-api-key: your_api_key"`,
    python: `import requests

url = "${API_BASE}/api/exercises/id/1"
headers = {"x-api-key": "your_api_key"}

response = requests.get(url, headers=headers)
print(response.json())`
  };

  const performanceStats = [
    { label: 'Uptime', value: '99.9%', sub: 'Global Reliability' },
    { label: 'Latency', value: '<45ms', sub: 'Edge Delivery' },
    { label: 'Exercises', value: '1,300+', sub: 'Verified Data' },
    { label: 'Requests', value: '2M+', sub: 'Daily Volume' }
  ];

  const features = [
    { title: 'Edge-First Infrastructure', desc: 'Deployed globally with low-latency CDN caching for instant exercise animation delivery.', icon: <Globe size={24} /> },
    { title: 'Secure Access Control', desc: 'Enterprise-grade API key management with granular rate limiting and usage tracking.', icon: <Lock size={24} /> },
    { title: 'Clean REST Patterns', desc: 'Predictable resource-oriented URLs and response structures designed for modern frontends.', icon: <Database size={24} /> },
  ];

  return (
    <div className="homepage-root code-platform-theme">
      {/* Navigation */}
      <nav className="home-nav glass-nav">
        <div className="home-nav-container">
          <div className="sidebar-logo clickable" onClick={() => navigate('/')}>
            <div className="sidebar-logo-icon">
              <Dumbbell size={20} color="var(--accent-blue)" />
            </div>
            <span>GymBase<span className="logo-dot">_API</span></span>
          </div>

          <div className="desktop-nav">
            <a href="#performance" className="nav-link-technical">Performance</a>
            <button className="nav-link-technical" onClick={() => navigate('/docs')}>Docs</button>
            <button className="nav-link-technical" onClick={() => navigate('/pricing')}>Pricing</button>
            <div className="nav-divider"></div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn btn-primary btn-sm btn-glow" onClick={() => navigate('/register')}>Start Building</button>
          </div>

          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu glass-menu">
            <a href="#performance" onClick={() => setMobileMenuOpen(false)}>Performance</a>
            <button className="btn-link" onClick={() => { navigate('/docs'); setMobileMenuOpen(false); }}>Documentation</button>
            <button className="btn-link" onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }}>Pricing</button>
            <button className="btn btn-outline" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn" onClick={() => navigate('/register')}>Sign Up</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-section technical-hero">
        <div className="background-grid"></div>
        <div className="hero-container technical-layout">
          <div className="hero-content-technical">
            <div className="hero-badge technical-badge">
              <span className="version-tag">v2.4.0</span>
              <span className="badge-divider"></span>
              <Sparkles size={14} color="var(--accent-green)" />
              <span>Real-time Fitness Intelligence</span>
            </div>
            <h1 className="technical-title">
              The API for <span className="highlight-text">Fitness Products</span>
            </h1>
            <p className="hero-subtitle-technical">
              Integrate high-definition exercise data, muscle group animations,
              and workout logic into your application with a single API request.
            </p>
            <div className="hero-actions-technical">
              <button className="btn btn-primary btn-lg btn-glow" onClick={() => navigate('/register')}>
                Initialize Project <ChevronRight size={18} />
              </button>
              <button className="btn btn-ghost btn-lg terminal-btn" onClick={() => navigate('/docs')}>
                <Terminal size={18} /> Read CLI Docs
              </button>
            </div>

            <div className="tech-stack-row">
              <p>Trusted by developers using:</p>
              <div className="tech-icons">
                {techStack.map((tech, i) => (
                  <div key={i} className="tech-icon-wrapper" title={tech.name}>
                    {tech.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-visual-technical">
            <div className="editor-window">
              <div className="editor-header">
                <div className="editor-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="editor-tabs">
                  <button className={`tab ${activeTab === 'js' ? 'active' : ''}`} onClick={() => setActiveTab('js')}>gymbase.js</button>
                  <button className={`tab ${activeTab === 'curl' ? 'active' : ''}`} onClick={() => setActiveTab('curl')}>fetch.sh</button>
                  <button className={`tab ${activeTab === 'python' ? 'active' : ''}`} onClick={() => setActiveTab('python')}>app.py</button>
                </div>
              </div>
              <div className="editor-body">
                <div className="line-numbers">
                  {Array.from({ length: 10 }).map((_, i) => <span key={i}>{i + 1}</span>)}
                </div>
                <pre className="code-content">
                  <code>{codeSnippets[activeTab]}</code>
                </pre>
              </div>
              <div className="editor-footer">
                <div className="footer-item"><Workflow size={12} /> main</div>
                <div className="footer-item"><Activity size={12} /> 100% Type Safe</div>
              </div>
            </div>

            <div className="floating-card-metric">
              <div className="metric-header">
                <Activity size={14} color="var(--accent-green)" />
                <span>Payload Analysis</span>
              </div>
              <div className="metric-value">0.4Kb <span className="unit">JSON</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Stats */}
      <section id="performance" className="performance-section">
        <div className="stats-grid-technical">
          {performanceStats.map((stat, i) => (
            <div key={i} className="stat-card-technical">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-sub">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="features-technical">
        <div className="section-header-technical">
          <div className="section-tag-technical">Core Infrastructure</div>
          <h2>Built for reliability</h2>
        </div>
        <div className="aim-grid technical-grid">
          {features.map((feature, i) => (
            <div key={i} className="aim-card technical-card">
              <div className="aim-icon technical-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              <div className="card-explore">
                Learn more <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Real-time Status */}
      <section id="status" className="status-terminal-section">
        <div className="terminal-window">
          <div className="terminal-header">
            <span className="terminal-title">system_check.exe</span>
          </div>
          <div className="terminal-body monospace">
            <div className="terminal-line"><span className="green">[ok]</span> Initializing GymBase Global Mesh...</div>
            <div className="terminal-line"><span className="green">[ok]</span> Connecting to Central Exercise Database...</div>
            <div className="terminal-line"><span className="green">[ok]</span> Syncing 1,342 exercise images...</div>
            <div className="terminal-line"><span className="blue">[i]</span> Edge cache warming in Tokyo, London, and San Francisco...</div>
            <div className="terminal-line"><span className="green">[ok]</span> System online. Latency: 32ms</div>
            <div className="terminal-line pointer-line">_ <span className="cursor-blink">|</span></div>
          </div>
        </div>
      </section>

      {/* Pricing - Compact Version */}
      <section id="pricing" className="pricing-technical">
        <div className="section-header-technical">
          <div className="section-tag-technical">Licensing</div>
          <h2>Scale with your vision</h2>
        </div>

        <div className="home-pricing-grid compact-grid">
          {plans.map((p, i) => (
            <div key={i} className={`home-plan-card technical-pricing-card ${p.recommended ? 'recommended' : ''}`}>
              <div className="p-header">
                <h3>{p.name}</h3>
                {p.recommended && <span className="p-badge-tech">Pro Integration</span>}
              </div>
              <div className="p-price technical-price">{p.price}<span>/mo</span></div>
              <ul className="technical-features-list">
                {p.features.map((f, j) => (
                  <li key={j}><CheckCircle2 size={14} color="var(--accent-blue)" /> {f}</li>
                ))}
              </ul>
              <button
                className={`btn ${p.recommended ? 'btn-primary btn-glow' : 'btn-ghost'}`}
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (!token) navigate('/login');
                  else navigate('/pricing');
                }}
              >
                {p.name === 'Free' ? 'Initialize' : 'Upgrade Node'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="social-proof-technical">
        <div className="dev-count-card">
          <div className="avatar-group">
            <div className="mini-avatar" style={{ background: '#3b82f6' }}></div>
            <div className="mini-avatar" style={{ background: '#00e5a0' }}></div>
            <div className="mini-avatar" style={{ background: '#a78bfa' }}></div>
            <div className="mini-avatar-plus">+2k</div>
          </div>
          <p>Join over 2,000 developers building the future of fitness.</p>
        </div>
      </section>

      {/* API Call to Action */}
      <section className="cta-technical">
        <div className="cta-card-full">
          <h2>Ready to transform your application?</h2>
          <p>Read the documentation or get started for free in under 5 minutes.</p>
          <div className="cta-btns">
            <button className="btn btn-primary btn-lg btn-glow" onClick={() => navigate('/register')}>Create Developer Account</button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/docs')}>Technical Documentation</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer-technical">
        <div className="footer-main">
          <div className="footer-brand-col">
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <Dumbbell size={20} color="var(--accent-blue)" />
              </div>
              GYMBASE_API
            </div>
            <p className="brand-pitch" style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '20px', maxWidth: '240px' }}>
              The global standard for exercise intelligence. Delivering high-fidelity data to over 2,000 health platforms via GYMBASE_API.
            </p>
          </div>

          <div className="footer-links-technical">
            <div className="link-col">
              <h4>Platform</h4>
              <span>Infrastructure</span>
              <span onClick={() => navigate('/pricing')}>Pricing</span>
              <span>Security</span>
              <span>Global CDN</span>
            </div>
            <div className="link-col">
              <h4>Developer</h4>
              <span onClick={() => navigate('/docs')}>API Docs</span>
              <span>System Status</span>
              <span>Changelog</span>
              <span>Library SDKs</span>
            </div>
            <div className="link-col">
              <h4>Support</h4>
              <span>Help Center</span>
              <span>Community</span>
              <span>Report Issue</span>
              <span>Contact Sales</span>
            </div>
            <div className="link-col">
              <h4>Legal</h4>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Cookie Policy</span>
              <span>License Agreement</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-legal-row">
            <span>© 2026 GYMBASE_API Engineering. All rights reserved.</span>
            <div className="footer-dot-links" style={{ display: 'flex', gap: '20px', marginLeft: '40px' }}>
              <span>Security</span>
              <span>Terms</span>
              <span>Privacy</span>
            </div>
          </div>
          <div className="social-links">
            <div className="social-circle"><Globe size={16} /></div>
            <div className="social-circle"><Activity size={16} /></div>
            <div className="social-circle"><Code size={16} /></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
