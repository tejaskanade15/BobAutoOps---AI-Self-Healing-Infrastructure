import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [systemStatus, setSystemStatus] = useState('HEALTHY');
  const [bobcoinUsage, setBobcoinUsage] = useState(0);
  const [totalIncidents, setTotalIncidents] = useState(0);
  const [avgResolutionTime, setAvgResolutionTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memoryUsage, setMemoryUsage] = useState(62);
  const [requestRate, setRequestRate] = useState(1247);
  const [errorRate, setErrorRate] = useState(0);
  const [networkIn, setNetworkIn] = useState(45);
  const [networkOut, setNetworkOut] = useState(32);
  const [bobAnalyses, setBobAnalyses] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [sparklineData, setSparklineData] = useState(Array(10).fill(50));
  const prevIncidentsRef = useRef([]);
  const terminalRef = useRef(null);

  const fetchIncidents = async () => {
    try {
      const response = await fetch('http://localhost:4000/incidents');
      const data = await response.json();
      const incidentsArray = Array.isArray(data) ? data : [];
      
      if (incidentsArray.length > prevIncidentsRef.current.length) {
        setBobAnalyses(prev => prev + 1);
      }
      
      prevIncidentsRef.current = incidentsArray;
      setIncidents(incidentsArray);
      setTotalIncidents(incidentsArray.length);
      
      // Create filtered list
      const filteredIncidents = incidentsArray.filter(incident => {
        if (filter === 'ALL') return true;
        if (filter === 'CRITICAL') {
          return incident.status === 'open' ||
                 incident.status === 'firing' ||
                 incident.severity === 'critical';
        }
        if (filter === 'RESOLVED') {
          return incident.status === 'acknowledged' ||
                 incident.status === 'resolved';
        }
        return true;
      });
      
      const hasActiveIncident = incidentsArray.some(
        incident => incident.status !== 'resolved' && incident.status !== 'acknowledged'
      );
      setSystemStatus(hasActiveIncident ? 'INCIDENT' : 'HEALTHY');
      
      const totalBobcoins = incidentsArray.reduce((sum, incident) => sum + (incident.bobcoinsUsed || 0), 0);
      setBobcoinUsage(totalBobcoins);
      
      const fixedIncidents = incidentsArray.filter(i => i.status === 'fixed');
      if (fixedIncidents.length > 0) {
        const avgTime = fixedIncidents.reduce((sum, i) => {
          const start = new Date(i.timestamp);
          const end = new Date(i.fixedAt || i.timestamp);
          return sum + (end - start) / 1000;
        }, 0) / fixedIncidents.length;
        setAvgResolutionTime(avgTime);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const metricsInterval = setInterval(() => {
      setCpuUsage(prev => Math.max(20, Math.min(90, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.max(30, Math.min(85, prev + (Math.random() - 0.5) * 8)));
      setRequestRate(prev => Math.max(800, Math.min(2000, prev + Math.floor((Math.random() - 0.5) * 100))));
      setErrorRate(systemStatus === 'INCIDENT' ? Math.random() * 2 : 0);
      setNetworkIn(prev => Math.max(10, Math.min(100, prev + (Math.random() - 0.5) * 15)));
      setNetworkOut(prev => Math.max(10, Math.min(100, prev + (Math.random() - 0.5) * 15)));
      setSparklineData(prev => [...prev.slice(1), Math.floor(Math.random() * 100)]);
    }, 2000);
    return () => clearInterval(metricsInterval);
  }, [systemStatus]);

  useEffect(() => {
    const logMessages = [
      '> Initializing Bob AI engine...',
      '> Connected to Prometheus scraper',
      '> Analyzing repository context...',
      '> Monitoring /users endpoint health',
      '> Running pattern analysis on codebase',
      '> No anomalies detected in 847 metrics',
      '> Alertmanager webhook listening on :4000',
      '> Bob context window: 75% available',
      '> Next scan in 15 seconds...'
    ];

    const addLog = () => {
      const message = logMessages[Math.floor(Math.random() * logMessages.length)];
      setTerminalLogs(prev => [...prev.slice(-20), message]);
    };

    addLog();
    const logInterval = setInterval(addLog, 2000);
    return () => clearInterval(logInterval);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const downloadPostmortem = (incidentId) => {
    window.open(`http://localhost:4000/postmortem/${incidentId}`, '_blank');
  };

  const handleAck = async (incidentId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/incidents/${incidentId}/acknowledge`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      if (response.ok) {
        // Refresh incidents list immediately
        await fetchIncidents();
      }
    } catch(err) {
      console.error('ACK failed:', err);
    }
  };

  const getIncidentProgress = (status) => {
    const steps = ['DETECT', 'ANALYZE', 'FIX', 'DONE'];
    let activeIndex = 0;
    if (status === 'analyzing') activeIndex = 1;
    if (status === 'acknowledged') activeIndex = 3; // All steps complete for acknowledged
    if (status === 'fixed') activeIndex = 3;
    return steps.map((step, i) => ({ label: step, active: i <= activeIndex }));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050810', color: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', margin: 0, padding: 0 }}>
      
      <div style={{ height: '60px', background: 'rgba(0,0,0,0.9)', borderBottom: '1px solid rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '40px', height: '40px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>B</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>BOB</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#6366f1' }}>AutoOps</span>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(99,102,241,0.3)' }}></div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Operations {'>'} Live Dashboard</div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', fontSize: '10px', fontWeight: 'bold', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }}></span>
            BOB AI ACTIVE
          </div>
          <div style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', fontSize: '10px', fontWeight: 'bold', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }}></span>
            PROMETHEUS
          </div>
          <div style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', fontSize: '10px', fontWeight: 'bold', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }}></span>
            ALERTMANAGER
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', color: '#ef4444' }}>PRODUCTION</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>ops-engineer</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace', color: '#06b6d4', textShadow: '0 0 10px #06b6d4' }}>
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'blink 1s infinite' }}></span>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ef4444' }}>LIVE</span>
          </div>
        </div>
      </div>

      <div style={{ height: '80px', background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 30px' }}>
        {[
          { label: 'SYSTEM HEALTH', value: '98%', trend: '↑', color: '#10b981' },
          { label: 'INCIDENTS TODAY', value: totalIncidents, trend: '', color: '#6366f1' },
          { label: 'MTTR', value: `${avgResolutionTime.toFixed(1)}s`, trend: '', color: '#8b5cf6' },
          { label: 'BOB ANALYSES', value: bobAnalyses, trend: '', color: '#06b6d4' },
          { label: 'UPTIME', value: '99.9%', trend: '', color: '#10b981' }
        ].map((metric, i) => (
          <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
            {i > 0 && <div style={{ position: 'absolute', left: '-20px', top: '10px', width: '1px', height: '40px', background: 'rgba(99,102,241,0.2)' }}></div>}
            <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '1px', marginBottom: '8px' }}>{metric.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: metric.color }}>
              {metric.value} <span style={{ fontSize: '14px', color: '#10b981' }}>{metric.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '30% 40% 30%', gap: '20px', padding: '20px' }}>
        
        <div style={{ background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative' }}>
          <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '2px', marginBottom: '20px' }}>● LIVE SERVICE MAP</div>
          
          <svg width="100%" height="300" viewBox="0 0 300 300">
            <g>
              <circle cx="150" cy="150" r="25" fill="#3b82f6" opacity="0.2" />
              <circle cx="150" cy="150" r="20" fill="#3b82f6" style={{ animation: 'nodePulse 2s infinite' }} />
              <text x="150" y="190" textAnchor="middle" fill="#f1f5f9" fontSize="11">monitored-app</text>
            </g>
            <g>
              <circle cx="220" cy="80" r="20" fill="#f59e0b" opacity="0.2" />
              <circle cx="220" cy="80" r="15" fill="#f59e0b" style={{ animation: 'nodePulse 2s infinite' }} />
              <text x="220" y="110" textAnchor="middle" fill="#f1f5f9" fontSize="11">prometheus</text>
            </g>
            <g>
              <circle cx="220" cy="220" r="20" fill="#eab308" opacity="0.2" />
              <circle cx="220" cy="220" r="15" fill="#eab308" style={{ animation: 'nodePulse 2s infinite' }} />
              <text x="220" y="250" textAnchor="middle" fill="#f1f5f9" fontSize="11">alertmanager</text>
            </g>
            <g>
              <circle cx="80" cy="80" r="20" fill="#8b5cf6" opacity="0.2" />
              <circle cx="80" cy="80" r="15" fill="#8b5cf6" style={{ animation: 'nodePulse 2s infinite' }} />
              <text x="80" y="110" textAnchor="middle" fill="#f1f5f9" fontSize="11">bob-autoops</text>
            </g>
            
            <line x1="150" y1="150" x2="220" y2="80" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" style={{ animation: 'dashFlow 1s linear infinite' }} />
            <line x1="150" y1="150" x2="220" y2="220" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" style={{ animation: 'dashFlow 1s linear infinite' }} />
            <line x1="150" y1="150" x2="80" y2="80" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" style={{ animation: 'dashFlow 1s linear infinite' }} />
            
            <text x="185" y="110" fill="#94a3b8" fontSize="9">42 req/s</text>
            <text x="185" y="190" fill="#94a3b8" fontSize="9">18 req/s</text>
            <text x="110" y="110" fill="#94a3b8" fontSize="9">5 req/s</text>
          </svg>
          
          <div style={{ position: 'absolute', bottom: '15px', right: '15px', fontSize: '9px', color: '#475569', letterSpacing: '1px' }}>TOPOLOGY</div>
        </div>

        <div style={{ background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative' }}>
          <div style={{ position: 'relative', width: '100%', height: '400px', background: 'radial-gradient(circle, #0a0e1a 0%, #050810 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[280, 200, 120].map((size, i) => (
              <div key={i} style={{ position: 'absolute', width: `${size}px`, height: `${size}px`, border: '1px solid rgba(99,102,241,0.2)', borderRadius: '50%' }}></div>
            ))}
            
            <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'conic-gradient(from 0deg, transparent 0deg, rgba(99,102,241,0.4) 30deg, transparent 31deg)', animation: 'radarSweep 4s linear infinite' }}></div>
            
            <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(99,102,241,0.3)' }}></div>
            <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'rgba(99,102,241,0.3)' }}></div>
            
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: systemStatus === 'HEALTHY' ? '#10b981' : '#ef4444', textShadow: `0 0 20px ${systemStatus === 'HEALTHY' ? '#10b981' : '#ef4444'}`, animation: systemStatus === 'INCIDENT' ? 'shake 0.5s infinite' : 'none' }}>
                {systemStatus === 'HEALTHY' ? '◎ NOMINAL' : '⚠ ALERT'}
              </div>
            </div>
            
            <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#475569' }}>N</div>
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: '#475569' }}>E</div>
            <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#475569' }}>S</div>
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: '#475569' }}>W</div>
            
            <div style={{ position: 'absolute', top: '5px', right: '50px', fontSize: '9px', color: '#475569' }}>0°</div>
            <div style={{ position: 'absolute', right: '5px', bottom: '50px', fontSize: '9px', color: '#475569' }}>90°</div>
            <div style={{ position: 'absolute', bottom: '5px', left: '50px', fontSize: '9px', color: '#475569' }}>180°</div>
            <div style={{ position: 'absolute', left: '5px', top: '50px', fontSize: '9px', color: '#475569' }}>270°</div>
          </div>
        </div>

        <div style={{ background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 20px' }}>
            <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="90" cy="90" r="75" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="8" />
              <circle cx="90" cy="90" r="75" fill="none" stroke="#6366f1" strokeWidth="8" strokeDasharray={`${(bobcoinUsage / 40) * 471} 471`} strokeLinecap="round" />
              
              <circle cx="90" cy="90" r="60" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="6" />
              <circle cx="90" cy="90" r="60" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeDasharray={`${0.75 * 377} 377`} strokeLinecap="round" />
            </svg>
            
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '5px' }}>🤖</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f1f5f9' }}>BOB AI</div>
              <div style={{ padding: '3px 8px', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold', color: '#10b981', marginTop: '5px' }}>ACTIVE</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '5px' }}>Models</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>✓</div>
            </div>
            <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '5px' }}>MCP</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>ON</div>
            </div>
            <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '5px' }}>Plan</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f1f5f9' }}>Ent</div>
            </div>
            <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '5px' }}>Version</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f1f5f9' }}>v1.0.2</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '65% 35%', gap: '20px', padding: '0 20px 20px' }}>
        
        <div style={{ background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', minHeight: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f1f5f9', letterSpacing: '1px' }}>⚡ INCIDENT COMMAND CENTER</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'CRITICAL', 'RESOLVED'].map(filterOption => (
              <div
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '15px',
                  background: filter === filterOption ? '#6366f1' : 'transparent',
                  border: filter === filterOption ? 'none' : '1px solid #374151',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: filter === filterOption ? 'white' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {filterOption}
              </div>
            ))}
          </div>
        </div>
        
        {(() => {
          const filteredIncidents = incidents.filter(incident => {
            if (filter === 'ALL') return true;
            if (filter === 'CRITICAL') {
              return incident.status === 'open' ||
                     incident.status === 'firing' ||
                     incident.severity === 'critical';
            }
            if (filter === 'RESOLVED') {
              return incident.status === 'acknowledged' ||
                     incident.status === 'resolved';
            }
            return true;
          });
          
          return filteredIncidents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 20px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: `${50 + i * 40}px`, height: `${50 + i * 40}px`, border: '2px solid rgba(99,102,241,0.3)', borderRadius: '50%', animation: `expandRing 2s ease-out infinite ${i * 0.5}s` }}></div>
                ))}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginBottom: '10px', textShadow: '0 0 10px #10b981' }}>SENTINEL MODE ACTIVE</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Monitoring 847 metrics across 3 services</div>
              <div style={{ marginTop: '20px', fontSize: '10px', color: '#475569', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'inline-block', animation: 'scrollText 20s linear infinite' }}>
                  http_requests_total • cpu_usage_percent • memory_usage_bytes • error_rate • response_time_ms • active_connections • disk_io_ops • network_throughput • cache_hit_ratio • queue_depth
                </div>
              </div>
            </div>
          ) : (
            filteredIncidents.map(incident => (
              <div key={incident.id} style={{
                background: incident.status === 'acknowledged' ? 'rgba(251,146,60,0.05)' : 'rgba(239,68,68,0.05)',
                border: incident.status === 'acknowledged' ? '2px solid #fb923c' : '1px solid rgba(239,68,68,0.5)',
                borderLeft: incident.status === 'acknowledged' ? '4px solid #fb923c' : '4px solid #ef4444',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: incident.status === 'acknowledged' ? '#fb923c' : '#ef4444'
                    }}>
                      ● {incident.status === 'acknowledged' ? 'ACKNOWLEDGED' : 'CRITICAL'}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#f1f5f9' }}>{incident.alertName}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {new Date(incident.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', padding: '10px 0', borderTop: '1px solid rgba(239,68,68,0.2)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
                  {getIncidentProgress(incident.status).map((step, i) => (
                    <React.Fragment key={i}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: step.active ? '#f1f5f9' : '#64748b' }}>{step.label}</div>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: step.active ? '#6366f1' : 'rgba(99,102,241,0.2)', border: step.active ? '2px solid #8b5cf6' : 'none' }}></div>
                      </div>
                      {i < 3 && <div style={{ flex: 1, height: '2px', background: step.active ? '#6366f1' : 'rgba(99,102,241,0.2)' }}></div>}
                    </React.Fragment>
                  ))}
                </div>
                
                {incident.rootCause && (
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '5px' }}>📍 Root Cause:</div>
                    <div style={{ fontSize: '12px', color: '#f1f5f9', lineHeight: '1.5' }}>{incident.rootCause}</div>
                    {incident.filePath && (
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px', fontFamily: 'monospace' }}>
                        📁 File: {incident.filePath}
                      </div>
                    )}
                  </div>
                )}
                
                {incident.acknowledgedAt && (
                  <div style={{ marginBottom: '15px', fontSize: '11px', color: '#fb923c', fontFamily: 'monospace' }}>
                    ✓ Acknowledged at: {new Date(incident.acknowledgedAt).toLocaleString('en-US', { hour12: false })}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  {incident.prUrl && (
                    <a href={incident.prUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: '#ffffff', textDecoration: 'none', cursor: 'pointer' }}>
                      🔗 VIEW PR #{incident.prUrl.split('/').pop()}
                    </a>
                  )}
                  <button onClick={() => downloadPostmortem(incident.id)} style={{ padding: '8px 16px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.5)', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: '#f1f5f9', cursor: 'pointer' }}>
                    📄 POSTMORTEM
                  </button>
                  {incident.status === 'acknowledged' ? (
                    <div style={{ padding: '8px 16px', background: 'rgba(251,146,60,0.2)', border: '1px solid rgba(251,146,60,0.5)', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: '#fb923c', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      ✓ Acknowledged
                    </div>
                  ) : (
                    <button onClick={() => handleAck(incident.id)} style={{ padding: '8px 16px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.5)', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: '#10b981', cursor: 'pointer' }}>
                      ✓ ACK
                    </button>
                  )}
                </div>
              </div>
            ))
          );
          })()}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px' }}>CPU USAGE</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#6366f1', fontFamily: 'monospace' }}>{cpuUsage.toFixed(1)}%</div>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'rgba(99,102,241,0.2)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${cpuUsage}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'shimmer 2s linear infinite' }}></div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px' }}>MEMORY</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#8b5cf6', fontFamily: 'monospace' }}>{memoryUsage.toFixed(1)}%</div>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'rgba(139,92,246,0.2)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${memoryUsage}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }}></div>
            </div>
          </div>

          <div style={{ background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px', marginBottom: '10px' }}>NETWORK I/O</div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginBottom: '5px' }}>
                <span>IN</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>{networkIn.toFixed(1)} MB/s</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(16,185,129,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${networkIn}%`, height: '100%', background: '#10b981' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginBottom: '5px' }}>
                <span>OUT</span>
                <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{networkOut.toFixed(1)} MB/s</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(59,130,246,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${networkOut}%`, height: '100%', background: '#3b82f6' }}></div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px', marginBottom: '10px' }}>ERROR RATE</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: errorRate > 0 ? '#ef4444' : '#10b981', fontFamily: 'monospace', animation: errorRate > 0 ? 'shake 0.5s infinite' : 'none' }}>
              {errorRate.toFixed(2)}%
            </div>
          </div>

          <div style={{ background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px', marginBottom: '10px' }}>REQUEST RATE</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#06b6d4', fontFamily: 'monospace', marginBottom: '10px' }}>
              {requestRate}<span style={{ fontSize: '14px' }}>/s</span>
            </div>
            <div style={{ display: 'flex', gap: '2px', height: '30px', alignItems: 'flex-end' }}>
              {sparklineData.map((val, i) => (
                <div key={i} style={{ flex: 1, height: `${val}%`, background: 'linear-gradient(to top, #06b6d4, #6366f1)', borderRadius: '2px 2px 0 0', transition: 'height 0.3s ease' }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ margin: '0 20px 20px', background: '#000000', border: '1px solid #00ff41', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,255,65,0.3)', overflow: 'hidden' }}>
        <div style={{ background: '#1a1a1a', padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #00ff41' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
          <div style={{ marginLeft: '15px', fontSize: '12px', color: '#00ff41', fontFamily: 'monospace', fontWeight: 'bold' }}>BOB@autoops:~$</div>
        </div>
        
        <div ref={terminalRef} style={{ padding: '15px', height: '180px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '13px', color: '#00ff41' }}>
          {terminalLogs.map((log, i) => (
            <div key={i} style={{ marginBottom: '4px', animation: 'fadeIn 0.3s ease' }}>{log}</div>
          ))}
          <div>
            <span style={{ animation: 'blink 1s infinite' }}>_</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes nodePulse {
          0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.7); }
          70% { box-shadow: 0 0 0 15px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
        @keyframes dashFlow {
          to { stroke-dashoffset: -10; }
        }
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes expandRing {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        @keyframes scrollText {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(99,102,241,0.1); }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.5); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.7); }
      `}</style>
    </div>
  );
}

export default App;

// Made with Bob
