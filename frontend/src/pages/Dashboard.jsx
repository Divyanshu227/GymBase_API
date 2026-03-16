import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  Activity, LogOut, Database, Zap, Clock, Shield, Key, Copy, CheckCircle2,
  Eye, EyeOff, X, Send, ChevronRight, RefreshCw, Terminal
} from 'lucide-react';
import API_BASE from '../api';



const ENDPOINTS = [
  { method: 'GET', path: '/api/exercises',              desc: 'List all exercises'           },
  { method: 'GET', path: '/api/exercises/id/:id',       desc: 'Get exercise by ID'           },
  { method: 'GET', path: '/api/exercises/name/:name',   desc: 'Search exercise by name'      },
  { method: 'GET', path: '/api/exercises/muscle/:muscle', desc: 'Filter by muscle group'     },
];

const PlaygroundModal = ({ endpoint, apiKey, onClose }) => {
  const [param, setParam] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const needsParam = endpoint.path.includes(':');
  const paramName  = needsParam ? endpoint.path.split(':')[1] : null;

  const buildUrl = () => {
    if (needsParam && param) {
      return `${API_BASE}${endpoint.path.replace(`:${paramName}`, encodeURIComponent(param))}`;
    }
    return `${API_BASE}${endpoint.path}`;
  };

  const handleSend = async () => {
    setLoading(true);
    setError('');
    setResponse(null);
    try {
      const res = await axios.get(buildUrl(), {
        headers: { 'x-api-key': apiKey },
      });
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(msg);
      setResponse(JSON.stringify(err.response?.data || { error: msg }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="playground-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="playground-modal">
        <div className="playground-header">
          <div>
            <div className="playground-title">
              <Terminal size={16} style={{ display: 'inline', marginRight: '8px', color: 'var(--accent-green)' }} />
              API Playground
            </div>
          </div>
          <button className="btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="playground-body">
          <div className="playground-url-row">
            <span className="playground-url-method">{endpoint.method}</span>
            <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>|</span>
            <span className="playground-url-path">{API_BASE}{endpoint.path}</span>
          </div>

          {needsParam && (
            <div>
              <div className="playground-label">{paramName}</div>
              <input
                className="playground-input"
                placeholder={`Enter ${paramName}…`}
                value={param}
                onChange={(e) => setParam(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>
          )}

          <div className="playground-label">API Key (auto-filled)</div>
          <input
            className="playground-input"
            value={apiKey || ''}
            readOnly
            style={{ opacity: 0.6 }}
          />

          {response !== null && (
            <div>
              <div className="playground-label" style={{ color: error ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                {error ? '⚠ Error Response' : '✓ Response'}
              </div>
              <div className="playground-response" style={{ color: error ? '#fca5a5' : 'var(--accent-green)' }}>
                {response}
              </div>
            </div>
          )}
        </div>

        <div className="playground-footer">
          <button className="btn btn-outline" style={{ width: 'auto', padding: '8px 20px' }} onClick={onClose}>
            Close
          </button>
          <button
            className="btn"
            style={{ width: 'auto', padding: '8px 20px' }}
            onClick={handleSend}
            disabled={loading || (needsParam && !param)}
          >
            {loading
              ? <><RefreshCw size={15} className="spinner" /> Sending…</>
              : <><Send size={15} /> Send Request</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [data,         setData]        = useState(null);
  const [loading,      setLoading]     = useState(true);
  const [fetchError,   setFetchError]  = useState('');
  const [copied,       setCopied]      = useState(false);
  const [showKey,      setShowKey]     = useState(false);
  const [activeTab,    setActiveTab]   = useState('overview');
  const [playground,   setPlayground]  = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsage = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      try {
        const res = await axios.get(`${API_BASE}/api/usage`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          const msg = err.response?.data?.error
            || err.response?.data?.message
            || err.message
            || 'Unknown error';
          setFetchError(`${err.response?.status || 'Network'}: ${msg}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, [navigate]);

  const handleLogout  = () => { localStorage.removeItem('token'); navigate('/login'); };
  const handleCopy    = () => {
    if (data?.api_key) {
      navigator.clipboard.writeText(data.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Activity size={44} color="var(--accent-blue)" className="spinner" />
        <span className="loading-text">Loading your console…</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="loading-screen" style={{ flexDirection: 'column', gap: '12px' }}>
        <span style={{ color: 'var(--accent-red)', fontSize: '18px', fontWeight: 600 }}>
          Failed to load dashboard
        </span>
        {fetchError && (
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'monospace', background: 'var(--bg-card)', padding: '10px 16px', borderRadius: '8px', maxWidth: '480px', wordBreak: 'break-all' }}>
            {fetchError}
          </span>
        )}
        <button className="btn btn-outline" style={{ width: 'auto', marginTop: '8px' }} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const dailyPercent   = Math.min((data.daily.used   / data.daily.limit)   * 100, 100);
  const monthlyPercent = Math.min((data.monthly.used / data.monthly.limit) * 100, 100);

  const navItems = [
    { id: 'overview',   icon: <Database size={18} />,  label: 'Overview'   },
    { id: 'endpoints',  icon: <Zap size={18} />,       label: 'Endpoints'  },
    { id: 'apikeys',    icon: <Shield size={18} />,    label: 'API Keys'   },
  ];
  const renderContent = () => {
    if (activeTab === 'overview') return <OverviewSection data={data} dailyPercent={dailyPercent} monthlyPercent={monthlyPercent} handleCopy={handleCopy} showKey={showKey} setShowKey={setShowKey} copied={copied} />;
    if (activeTab === 'endpoints') return <EndpointsSection apiKey={data.api_key} onTry={setPlayground} />;
    if (activeTab === 'apikeys') return <ApiKeysSection data={data} handleCopyKey={handleCopyKey} copied={copied} />;
  };

  return (
    <>
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Activity size={20} color="var(--accent-blue)" />
            </div>
            GymBase
          </div>

          <div className="sidebar-section-label">Navigation</div>
          <ul className="nav-menu">
            {navItems.map(item => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link${activeTab === item.id ? ' active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="nav-link-icon">{item.icon}</span>
                  {item.label}
                  {activeTab === item.id && (
                    <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--accent-blue)' }} />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="sidebar-footer">
            <button onClick={handleLogout} className="nav-link" style={{ width: '100%' }}>
              <span className="nav-link-icon"><LogOut size={18} /></span>
              Sign Out
            </button>
          </div>
        </aside>

        <main className="main-content">
          <div className="dashboard-header">
            <div>
              <div className="dashboard-title">
                {activeTab === 'overview'  && 'Developer Console'}
                {activeTab === 'endpoints' && 'API Endpoints'}
                {activeTab === 'apikeys'   && 'API Keys'}
              </div>
              <div className="dashboard-subtitle">
                {activeTab === 'overview'  && 'Monitor your API usage and activity.'}
                {activeTab === 'endpoints' && 'Explore and test all available endpoints.'}
                {activeTab === 'apikeys'   && 'Manage your API credentials.'}
              </div>
            </div>
            <div className="header-right">
              <div className="user-profile">
                <span className="user-status">
                  <span className="user-status-dot" />
                  Active
                </span>
                <div className="avatar">DEV</div>
              </div>
            </div>
          </div>

          {renderContent()}
        </main>
      </div>

      {playground && (
        <PlaygroundModal
          endpoint={playground}
          apiKey={data.api_key}
          onClose={() => setPlayground(null)}
        />
      )}
    </>
  );
};

const OverviewSection = ({ data, dailyPercent, monthlyPercent, handleCopy, showKey, setShowKey, copied }) => (
  <>
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-icon blue"><Key size={18} /></div>
        <div>
          <div className="section-card-title">Your API Key</div>
          <div className="section-card-desc">Use this key to authenticate API requests via x-api-key header.</div>
        </div>
      </div>

      <div className="api-key-display">
        <div className={`api-key-field${showKey ? ' revealed' : ''}`}>
          {showKey ? data.api_key : '••••••••••••••••••••••••••••••••••••••'}
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setShowKey(!showKey)}>
          {showKey ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Reveal</>}
        </button>
        <button className="btn btn-sm" onClick={handleCopy} style={{ width: 'auto' }}>
          {copied ? <><CheckCircle2 size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
        </button>
      </div>
      <p className="api-key-hint">
        Include this key as the <code>x-api-key</code> header. Treat it like a password — never expose it publicly.
      </p>
    </div>

    <div className="stats-grid">
      <div className="stat-card blue">
        <div className="stat-title">
          <Clock size={14} color="var(--accent-blue)" />
          Daily Usage
        </div>
        <div className="stat-value">{data.daily.used}<span> / {data.daily.limit}</span></div>
        <div className="progress-bar">
          <div className={`progress-fill${dailyPercent > 80 ? ' warning' : ''}`} style={{ width: `${dailyPercent}%` }} />
        </div>
        <div className="stat-subtitle">{dailyPercent.toFixed(1)}% of daily allowance used</div>
      </div>

      <div className="stat-card green">
        <div className="stat-title">
          <Database size={14} color="var(--accent-green)" />
          Monthly Usage
        </div>
        <div className="stat-value">{data.monthly.used}<span> / {data.monthly.limit}</span></div>
        <div className="progress-bar">
          <div className={`progress-fill${monthlyPercent > 80 ? ' warning' : ''}`} style={{ width: `${monthlyPercent}%` }} />
        </div>
        <div className="stat-subtitle">{monthlyPercent.toFixed(1)}% of monthly allowance used</div>
      </div>

      <div className="stat-card yellow">
        <div className="stat-title">
          <Zap size={14} color="var(--accent-yellow)" />
          API Status
        </div>
        <div className="stat-value" style={{ color: 'var(--accent-green)', fontSize: '28px' }}>Healthy</div>
        <div className="stat-badge healthy">
          <span className="key-status-dot" />
          All systems operational
        </div>
      </div>
    </div>

    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <div className="chart-title">API Requests</div>
            <div className="chart-subtitle">Last 7 days</div>
          </div>
        </div>
        <div style={{ height: '260px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.history} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--accent-blue)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'white', borderRadius: '8px' }} itemStyle={{ color: 'var(--accent-blue)' }} />
              <Area type="monotone" dataKey="calls" stroke="var(--accent-blue)" strokeWidth={2} fill="url(#blueGrad)" dot={false} activeDot={{ r: 5, fill: 'var(--accent-blue)' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <div className="chart-title">Usage Trend</div>
            <div className="chart-subtitle">Cumulative view</div>
          </div>
        </div>
        <div style={{ height: '260px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'white', borderRadius: '8px' }} itemStyle={{ color: 'var(--accent-green)' }} />
              <Bar dataKey="calls" fill="var(--accent-green)" radius={[4, 4, 0, 0]} barSize={30} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </>
);

const EndpointsSection = ({ apiKey, onTry }) => (
  <div>
    <div className="section-card" style={{ marginBottom: '20px' }}>
      <div className="section-card-header">
        <div className="section-card-icon green"><Zap size={18} /></div>
        <div>
          <div className="section-card-title">Available Endpoints</div>
          <div className="section-card-desc">Authenticate requests with your <code>x-api-key</code> header. Click "Try It" to test live.</div>
        </div>
      </div>

      <div className="endpoint-list">
        {ENDPOINTS.map((ep, i) => (
          <div key={i} className="endpoint-item" onClick={() => onTry(ep)}>
            <span className={`endpoint-method method-get`}>{ep.method}</span>
            <span className="endpoint-path">{ep.path}</span>
            <span className="endpoint-desc">{ep.desc}</span>
            <button className="endpoint-try-btn" onClick={(e) => { e.stopPropagation(); onTry(ep); }}>
              Try It →
            </button>
          </div>
        ))}
      </div>
    </div>

    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-icon blue"><Terminal size={18} /></div>
        <div>
          <div className="section-card-title">Quick Integration</div>
          <div className="section-card-desc">Example cURL request using your API key.</div>
        </div>
      </div>

      <div className="playground-response" style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
        <span style={{ color: 'var(--accent-green)' }}># List all exercises</span>{'\n'}
        curl -X GET https://your-domain/api/exercises \{'\n'}
        {'  '}<span style={{ color: 'var(--accent-blue)' }}>-H</span>{' "x-api-key: '}<span style={{ color: 'var(--accent-yellow)' }}>{apiKey ? `${apiKey.substring(0, 12)}...` : 'YOUR_API_KEY'}</span>{"\""}
        {'\n\n'}
        <span style={{ color: 'var(--accent-green)' }}># Get exercise by muscle group</span>{'\n'}
        curl -X GET https://your-domain/api/exercises/muscle/chest \{'\n'}
        {'  '}<span style={{ color: 'var(--accent-blue)' }}>-H</span>{' "x-api-key: '}<span style={{ color: 'var(--accent-yellow)' }}>{apiKey ? `${apiKey.substring(0, 12)}...` : 'YOUR_API_KEY'}</span>{"\""}
      </div>
    </div>
  </div>
);

const ApiKeysSection = ({ data, handleCopyKey, copied }) => {
  const [showFull, setShowFull] = useState(false);
  const maskedKey = data.api_key
    ? `${data.api_key.substring(0, 8)}${'•'.repeat(24)}${data.api_key.slice(-6)}`
    : '';

  return (
    <div>
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-icon green"><Shield size={18} /></div>
          <div>
            <div className="section-card-title">Your API Keys</div>
            <div className="section-card-desc">Manage and monitor your API credentials below.</div>
          </div>
        </div>

        <table className="key-manager-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Status</th>
              <th>Daily Quota</th>
              <th>Monthly Quota</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="key-value-cell">
                {showFull ? data.api_key : maskedKey}
              </td>
              <td>
                <span className="key-status-badge key-status-active">
                  <span className="key-status-dot" />
                  Active
                </span>
              </td>
              <td>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{data.daily.used}</span>
                <span style={{ color: 'var(--text-muted)' }}> / {data.daily.limit}</span>
              </td>
              <td>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{data.monthly.used}</span>
                <span style={{ color: 'var(--text-muted)' }}> / {data.monthly.limit}</span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="btn-ghost btn-sm" onClick={() => setShowFull(!showFull)}>
                    {showFull ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Reveal</>}
                  </button>
                  <button className="btn btn-sm" style={{ width: 'auto' }} onClick={() => handleCopyKey(data.api_key)}>
                    {copied ? <><CheckCircle2 size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-icon blue"><Key size={18} /></div>
          <div>
            <div className="section-card-title">Security Tips</div>
            <div className="section-card-desc">Best practices for keeping your key safe.</div>
          </div>
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            'Never share your API key publicly or commit it to source control.',
            'Use environment variables (.env) to store your key in applications.',
            'Rotate your key if you suspect it has been compromised.',
            'Your key is rate-limited: 50 calls/day and 500 calls/month.',
          ].map((tip, i) => (
            <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-green)', fontWeight: 700, marginTop: '1px' }}>✓</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
