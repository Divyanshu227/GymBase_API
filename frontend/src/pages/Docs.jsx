import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Cpu,
  Globe,
  Lock,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import API_BASE from '../api';

const Docs = () => {
  const navigate = useNavigate();
  const [expandedEndpoint, setExpandedEndpoint] = useState('all');
  const [activeLang, setActiveLang] = useState('js');

  const baseUrl = API_BASE;

  const endpoints = useMemo(
    () => [
      {
        id: 'all',
        method: 'GET',
        path: '/api/exercises',
        desc: 'Returns every exercise record. This endpoint is not paginated.',
        auth: 'Requires `x-api-key` or `Authorization: Bearer <token>`.',
        params: 'None',
        notes: [
          'Each record includes `id`, `name`, `description`, `steps`, `image`, `ytLink`, and `musclesAffected`.',
          'The backend rewrites `image` into an absolute URL using the current server host.'
        ],
        snippets: {
          js: `const res = await fetch('${baseUrl}/api/exercises', {\n  headers: {\n    'x-api-key': 'YOUR_API_KEY'\n  }\n});\n\nconst data = await res.json();`,
          curl: `curl -X GET "${baseUrl}/api/exercises" \\\n  -H "x-api-key: YOUR_API_KEY"`,
          python: `import requests\n\nres = requests.get(\n    "${baseUrl}/api/exercises",\n    headers={"x-api-key": "YOUR_API_KEY"}\n)\n\ndata = res.json()`
        },
        sampleResponse: [
          {
            id: '1',
            name: '3/4 Sit-Up',
            description: 'A beginner level strength exercise targeting the abdominals.',
            steps: [
              'Lie down on the floor and secure your feet.',
              'Raise your torso toward your knees.',
              'Lower to about three quarters of the way down and repeat.'
            ],
            image: `${baseUrl}/images/1.jpg`,
            ytLink: 'https://www.youtube.com/results?search_query=how+to+do+3/4+Sit-Up',
            musclesAffected: ['abdominals']
          }
        ]
      },
      {
        id: 'by-id',
        method: 'GET',
        path: '/api/exercises/id/:id',
        desc: 'Returns a single exercise when the exact numeric `id` exists.',
        auth: 'Requires `x-api-key` or `Authorization: Bearer <token>`.',
        params: 'Path param: `id` (example: `1`)',
        notes: ['Returns `404` with `{ "error": "Exercise not found" }` when the id is missing.'],
        snippets: {
          js: `const res = await fetch('${baseUrl}/api/exercises/id/1', {\n  headers: {\n    'x-api-key': 'YOUR_API_KEY'\n  }\n});\n\nconst data = await res.json();`,
          curl: `curl -X GET "${baseUrl}/api/exercises/id/1" \\\n  -H "x-api-key: YOUR_API_KEY"`,
          python: `import requests\n\nres = requests.get(\n    "${baseUrl}/api/exercises/id/1",\n    headers={"x-api-key": "YOUR_API_KEY"}\n)\n\ndata = res.json()`
        },
        sampleResponse: {
          id: '1',
          name: '3/4 Sit-Up',
          description: 'A beginner level strength exercise targeting the abdominals.',
          steps: [
            'Lie down on the floor and secure your feet.',
            'Raise your torso toward your knees.',
            'Lower to about three quarters of the way down and repeat.'
          ],
          image: `${baseUrl}/images/1.jpg`,
          ytLink: 'https://www.youtube.com/results?search_query=how+to+do+3/4+Sit-Up',
          musclesAffected: ['abdominals']
        }
      },
      {
        id: 'muscle',
        method: 'GET',
        path: '/api/exercises/muscle/:muscle',
        desc: 'Filters exercises by a muscle name contained in `musclesAffected`.',
        auth: 'Requires `x-api-key` or `Authorization: Bearer <token>`.',
        params: 'Path param: `muscle` (example: `abdominals`)',
        notes: [
          'This uses an exact `.includes()` match on the stored muscle string.',
          'Use values that exist in the dataset such as `abdominals`, `hamstrings`, or `chest`.'
        ],
        snippets: {
          js: `const res = await fetch('${baseUrl}/api/exercises/muscle/abdominals', {\n  headers: {\n    'x-api-key': 'YOUR_API_KEY'\n  }\n});\n\nconst data = await res.json();`,
          curl: `curl -X GET "${baseUrl}/api/exercises/muscle/abdominals" \\\n  -H "x-api-key: YOUR_API_KEY"`,
          python: `import requests\n\nres = requests.get(\n    "${baseUrl}/api/exercises/muscle/abdominals",\n    headers={"x-api-key": "YOUR_API_KEY"}\n)\n\ndata = res.json()`
        },
        sampleResponse: [
          {
            id: '1',
            name: '3/4 Sit-Up',
            description: 'A beginner level strength exercise targeting the abdominals.',
            image: `${baseUrl}/images/1.jpg`,
            musclesAffected: ['abdominals']
          }
        ]
      },
      {
        id: 'search',
        method: 'GET',
        path: '/api/exercises/name/:name',
        desc: 'Returns one exercise by case-insensitive exact name match.',
        auth: 'Requires `x-api-key` or `Authorization: Bearer <token>`.',
        params: 'Path param: `name` (example: `3/4 Sit-Up`)',
        notes: ['This is not fuzzy search. The backend compares the full exercise name after lowercasing it.'],
        snippets: {
          js: `const res = await fetch('${baseUrl}/api/exercises/name/${encodeURIComponent('3/4 Sit-Up')}', {\n  headers: {\n    'x-api-key': 'YOUR_API_KEY'\n  }\n});\n\nconst data = await res.json();`,
          curl: `curl -X GET "${baseUrl}/api/exercises/name/3%2F4%20Sit-Up" \\\n  -H "x-api-key: YOUR_API_KEY"`,
          python: `import requests\nfrom urllib.parse import quote\n\nname = quote("3/4 Sit-Up")\nres = requests.get(\n    "${baseUrl}/api/exercises/name/" + name,\n    headers={"x-api-key": "YOUR_API_KEY"}\n)\n\ndata = res.json()`
        },
        sampleResponse: {
          id: '1',
          name: '3/4 Sit-Up',
          description: 'A beginner level strength exercise targeting the abdominals.',
          image: `${baseUrl}/images/1.jpg`,
          musclesAffected: ['abdominals']
        }
      },
      {
        id: 'usage',
        method: 'GET',
        path: '/api/usage',
        desc: 'Returns the authenticated user usage counters, plan, key, and 7-day history.',
        auth: 'Requires `Authorization: Bearer <token>`. `x-api-key` does not work on this route.',
        params: 'None',
        notes: [
          'Use this after login from the dashboard or your own authenticated client.',
          'If the token is missing or invalid, the endpoint returns `401`.'
        ],
        snippets: {
          js: `const res = await fetch('${baseUrl}/api/usage', {\n  headers: {\n    Authorization: 'Bearer YOUR_JWT_TOKEN'\n  }\n});\n\nconst data = await res.json();`,
          curl: `curl -X GET "${baseUrl}/api/usage" \\\n  -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
          python: `import requests\n\nres = requests.get(\n    "${baseUrl}/api/usage",\n    headers={"Authorization": "Bearer YOUR_JWT_TOKEN"}\n)\n\ndata = res.json()`
        },
        sampleResponse: {
          daily: { used: 14, limit: 50 },
          monthly: { used: 93, limit: 500 },
          plan: 'free',
          history: [
            { date: '2026-03-11', day: 'Wed', calls: 8 },
            { date: '2026-03-12', day: 'Thu', calls: 16 },
            { date: '2026-03-13', day: 'Fri', calls: 11 }
          ],
          api_key: 'gb_********************************'
        }
      }
    ],
    [baseUrl]
  );

  const statusCodes = [
    { code: '200', label: 'OK', desc: 'Request succeeded.' },
    { code: '401', label: 'Unauthorized', desc: 'Missing or invalid API key / token.' },
    { code: '403', label: 'Forbidden', desc: 'Email verification is required before API usage.' },
    { code: '404', label: 'Not Found', desc: 'The requested exercise or user record does not exist.' },
    { code: '429', label: 'Too Many Requests', desc: 'Daily or monthly plan quota was exceeded.' },
    { code: '500', label: 'Server Error', desc: 'Unexpected backend error while processing the request.' }
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const toggleExpand = (id) => {
    setExpandedEndpoint(expandedEndpoint === id ? null : id);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  };

  return (
    <div className="docs-portal-layout code-platform-theme">
      <div className="docs-container-inner docs-shell">
        <header className="docs-header docs-header-v4">
          <button onClick={handleBack} className="btn btn-ghost btn-sm back-btn-docs">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="docs-title-group">
            <div className="docs-badge-tech">REST API REFERENCE</div>
            <h1 className="technical-title">
              GymBase <span className="highlight-text">Documentation</span>
            </h1>
            <p className="hero-subtitle-technical">
              Accurate request examples, response payloads, and auth rules based on the current Express backend.
            </p>
          </div>

          <div className="docs-summary-grid">
            <div className="docs-summary-card">
              <div className="docs-card-header">
                <Globe size={18} color="var(--accent-blue)" />
                Base URL
              </div>
              <p>Use the current API origin shown below for local or deployed environments.</p>
              <code>{baseUrl}</code>
            </div>

            <div className="docs-summary-card">
              <div className="docs-card-header">
                <Lock size={18} color="var(--accent-green)" />
                Authentication
              </div>
              <p>Exercise routes accept API keys or bearer tokens. Usage route requires a bearer token.</p>
              <code>x-api-key</code>
              <code>Authorization: Bearer &lt;jwt&gt;</code>
            </div>

            <div className="docs-summary-card">
              <div className="docs-card-header">
                <Terminal size={18} color="var(--accent-yellow)" />
                Response Shape
              </div>
              <p>Exercise records return absolute image URLs and the original dataset fields from `exercises.json`.</p>
              <code>image, ytLink, musclesAffected</code>
            </div>
          </div>
        </header>

        <div className="snippet-lang-nav docs-lang-nav">
          <button className={`lang-btn ${activeLang === 'js' ? 'active' : ''}`} onClick={() => setActiveLang('js')}>
            JavaScript
          </button>
          <button className={`lang-btn ${activeLang === 'curl' ? 'active' : ''}`} onClick={() => setActiveLang('curl')}>
            cURL
          </button>
          <button className={`lang-btn ${activeLang === 'python' ? 'active' : ''}`} onClick={() => setActiveLang('python')}>
            Python
          </button>
        </div>

        <section className="endpoints-container">
          <h2 className="section-label-technical">
            <Cpu size={16} /> Endpoint Reference
          </h2>

          {endpoints.map((ep) => (
            <div key={ep.id} className={`endpoint-block ${expandedEndpoint === ep.id ? 'expanded' : ''}`}>
              <button type="button" className="endpoint-header-row" onClick={() => toggleExpand(ep.id)}>
                <div className="method-path-group">
                  <span className={`method-pill ${ep.method.toLowerCase()}`}>{ep.method}</span>
                  <span className="path-text">{ep.path}</span>
                </div>
                <div className="ep-meta">
                  <span className="ep-desc-short">{ep.desc}</span>
                  {expandedEndpoint === ep.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {expandedEndpoint === ep.id && (
                <div className="endpoint-details-expanded">
                  <div className="docs-grid-two-col">
                    <div className="docs-col-left">
                      <div className="ep-section">
                        <h4>Description</h4>
                        <p>{ep.desc}</p>
                      </div>

                      <div className="ep-section">
                        <h4>Authentication</h4>
                        <div className="param-box">
                          <code>{ep.auth}</code>
                        </div>
                      </div>

                      <div className="ep-section">
                        <h4>Parameters</h4>
                        <div className="param-box">
                          <code>{ep.params}</code>
                        </div>
                      </div>

                      <div className="ep-section">
                        <h4>Implementation Notes</h4>
                        <ul className="docs-note-list">
                          {ep.notes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="ep-section">
                        <div className="label-row">
                          <h4>Example Response</h4>
                          <button
                            className="copy-btn-mini"
                            onClick={() => handleCopy(JSON.stringify(ep.sampleResponse, null, 2))}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <pre className="json-block">
                          <code>{JSON.stringify(ep.sampleResponse, null, 2)}</code>
                        </pre>
                      </div>
                    </div>

                    <div className="docs-col-right">
                      <div className="ep-section">
                        <div className="label-row">
                          <h4>Request Example</h4>
                          <button className="copy-btn-mini" onClick={() => handleCopy(ep.snippets[activeLang])}>
                            <Copy size={12} />
                          </button>
                        </div>
                        <div className="code-snippet-box">
                          <header className="snippet-header">
                            <span>{activeLang}.{activeLang === 'python' ? 'py' : activeLang === 'js' ? 'js' : 'sh'}</span>
                          </header>
                          <pre className="snippet-content">
                            <code>{ep.snippets[activeLang]}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="docs-card status-codes-card">
          <div className="docs-card-header">
            <ShieldCheck size={18} color="var(--accent-yellow)" />
            Status Codes
          </div>
          <div className="status-grid-technical-v3">
            {statusCodes.map((status) => (
              <div key={status.code} className="status-item-v3">
                <span className={`code-big ${status.code === '200' ? 'success' : 'error'}`}>{status.code}</span>
                <div className="status-info">
                  <strong>{status.label}</strong>
                  <p>{status.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="docs-footer-technical">
          <div className="footer-line"></div>
          <p>© 2026 GymBase API. Documentation aligned with the current backend routes.</p>
        </footer>
      </div>
    </div>
  );
};

export default Docs;
