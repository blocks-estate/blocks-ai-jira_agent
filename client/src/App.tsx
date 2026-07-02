import { useState, useEffect } from 'react'
import { api, KpiMetric, FunnelStage, WeeklyReviewSection, ActionItem } from './api'

type View = 'overview' | 'developer' | 'investor' | 'pr' | 'seo' | 'trust-compliance' | 'funnels' | 'share-of-voice' | 'docs' | 'subscriptions' | 'weekly-review' | 'dictionary' | 'instrumentation'

function App() {
  const [view, setView] = useState<View>('overview')
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">📊 GTM Analytics</div>
        <div className="sidebar-nav">
          <div className="sidebar-label">Dashboards</div>
          <NavBtn view="overview" current={view} setView={setView} icon="📈" label="Overview" />
          <NavBtn view="developer" current={view} setView={setView} icon="👨‍💻" label="Developer KPIs" />
          <NavBtn view="investor" current={view} setView={setView} icon="💰" label="Investor KPIs" />
          <NavBtn view="pr" current={view} setView={setView} icon="📡" label="PR KPIs" />
          <NavBtn view="seo" current={view} setView={setView} icon="🔍" label="SEO / Content" />
          <NavBtn view="trust-compliance" current={view} setView={setView} icon="🛡️" label="Trust & Compliance" />
          <div className="sidebar-label">Tracking</div>
          <NavBtn view="funnels" current={view} setView={setView} icon="🔄" label="Conversion Funnels" />
          <NavBtn view="share-of-voice" current={view} setView={setView} icon="📣" label="Share of Voice" />
          <NavBtn view="docs" current={view} setView={setView} icon="📄" label="Document Tracking" />
          <NavBtn view="subscriptions" current={view} setView={setView} icon="💳" label="Subscriptions" />
          <div className="sidebar-label">Operations</div>
          <NavBtn view="weekly-review" current={view} setView={setView} icon="📋" label="Weekly Review" />
          <NavBtn view="dictionary" current={view} setView={setView} icon="📖" label="KPI Dictionary" />
          <NavBtn view="instrumentation" current={view} setView={setView} icon="⚙️" label="Instrumentation" />
        </div>
      </aside>

      <main className="main">
        {view === 'overview' && <Overview />}
        {view === 'developer' && <DeveloperDashboard />}
        {view === 'investor' && <InvestorDashboard />}
        {view === 'pr' && <PrDashboard />}
        {view === 'seo' && <SeoDashboard />}
        {view === 'trust-compliance' && <TrustComplianceDashboard />}
        {view === 'funnels' && <FunnelsView />}
        {view === 'share-of-voice' && <ShareOfVoice />}
        {view === 'docs' && <DocumentTracking />}
        {view === 'subscriptions' && <SubscriptionTracking />}
        {view === 'weekly-review' && <WeeklyReview />}
        {view === 'dictionary' && <KpiDictionary />}
        {view === 'instrumentation' && <Instrumentation />}
      </main>
    </div>
  )
}

function NavBtn({ view: id, current, setView, icon, label }: { view: View; current: View; setView: (v: View) => void; icon: string; label: string }) {
  return (
    <button className={`sidebar-link ${current === id ? 'active' : ''}`} onClick={() => setView(id)}>
      <span className="icon">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

/* ─── Helpers ─── */
function StatusBadge({ status }: { status: string }) {
  const cls = status === 'on-track' ? 'badge-green' : status === 'at-risk' ? 'badge-amber' : status === 'off-track' ? 'badge-red' : 'badge-blue'
  return <span className={`badge ${cls}`}>{status === 'on-track' ? 'On Track' : status === 'at-risk' ? 'At Risk' : status === 'off-track' ? 'Off Track' : status}</span>
}

function KpiCard({ metric }: { metric: KpiMetric }) {
  const pct = metric.target > 0 ? (metric.current / metric.target) * 100 : 0
  const fillColor = metric.status === 'on-track' ? 'var(--green)' : metric.status === 'at-risk' ? 'var(--amber)' : 'var(--red)'
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span className="stat-label">{metric.name}</span>
        <StatusBadge status={metric.status} />
      </div>
      <div className="stat-value">{typeof metric.current === 'number' ? metric.current.toLocaleString() : metric.current}{metric.unit !== 'accounts' && metric.unit !== 'developers' && metric.unit !== 'signups' && metric.unit !== 'assets' && metric.unit !== 'offerings' && metric.unit !== 'backlinks' && metric.unit !== 'mentions' && metric.unit !== 'interviews' && metric.unit !== 'invitations' && metric.unit !== 'inquiries' && metric.unit !== 'leads' && metric.unit !== 'keywords' && metric.unit !== 'downloads' && metric.unit !== 'registrations' && metric.unit !== 'starts' && metric.unit !== 'complaints' && metric.unit !== 'overdue' && metric.unit !== 'checks completed' && metric.unit !== 'subscriptions' && metric.unit !== 'visitors' && metric.unit !== 'hours' && metric.unit !== 'views' ? metric.unit : ''}</div>
      <div className="stat-target">{metric.unit === '%' ? '' : 'Target: '}{metric.targetRange}</div>
      <div className="progress"><div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: fillColor }} /></div>
    </div>
  )
}

function TrendChart({ metric }: { metric: KpiMetric }) {
  const max = Math.max(...metric.trend, metric.target)
  const w = 300, h = 80
  const points = metric.trend.map((v, i) => {
    const x = (i / (metric.trend.length - 1)) * w
    const y = h - (v / max) * h
    return `${x},${y}`
  }).join(' ')

  const targetY = h - (metric.target / max) * h

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <line x1={0} y1={targetY} x2={w} y2={targetY} stroke="var(--amber)" strokeWidth={1} strokeDasharray="4 3" />
      <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth={2} />
      {metric.trend.map((v, i) => {
        const cx = (i / (metric.trend.length - 1)) * w
        const cy = h - (v / max) * h
        return <circle key={i} cx={cx} cy={cy} r={3} fill="var(--primary)" />
      })}
    </svg>
  )
}

function KpiList({ metrics }: { metrics: KpiMetric[] }) {
  return (
    <div className="card">
      <div className="card-body no-pad">
        {metrics.map(m => (
          <div key={m.id} className="kpi-row" title={`Source: ${m.sourceSystem} | Owner: ${m.owner} | Refresh: ${m.refreshCadence}`}>
            <StatusBadge status={m.status} />
            <span className="kpi-name">{m.name}</span>
            <span className="kpi-val">{typeof m.current === 'number' ? m.current.toLocaleString() : m.current}</span>
            <span className="kpi-target">{m.targetRange}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Overview ─── */
function Overview() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { api.overview().then(setData) }, [])

  if (!data) return <div className="loading">Loading dashboard...</div>

  const allStatuses = [
    ...data.dev90Status, ...data.dev12Status,
    ...data.inv90Status, ...data.inv12Status,
    ...data.prStatus, ...data.seoStatus, ...data.tcStatus
  ]
  const onTrack = allStatuses.filter((s: any) => s.status === 'on-track').length
  const atRisk = allStatuses.filter((s: any) => s.status === 'at-risk').length
  const offTrack = allStatuses.filter((s: any) => s.status === 'off-track').length

  return (
    <div>
      <div className="page-header">
        <h1>GTM Analytics & Reporting Dashboard</h1>
        <p>Full KPI suite across Developer, Investor, PR, SEO/Content, and Trust/Compliance — powered by lightweight analytics architecture</p>
        <div className="meta-bar">
          <span><strong>Version:</strong> {data.meta.version}</span>
          <span><strong>Last Updated:</strong> {data.meta.lastUpdated}</span>
          <span><strong>Competitors:</strong> {data.meta.competitors.join(', ')}</span>
          <span><strong>Weekly Review:</strong> {data.weeklyReview.status.length} sections · {data.weeklyReview.openActions} open actions</span>
        </div>
      </div>

      <div className="grid-4">
        <div className="stat-card">
          <span className="stat-label">Total KPIs Tracked</span>
          <div className="stat-value">{allStatuses.length}</div>
          <div className="stat-target">Across 7 dashboard categories</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">On Track</span>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{onTrack}</div>
          <div className="stat-target">{Math.round(onTrack / allStatuses.length * 100)}% of all KPIs</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">At Risk</span>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{atRisk}</div>
          <div className="stat-target">{Math.round(atRisk / allStatuses.length * 100)}% need attention</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Off Track</span>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{offTrack}</div>
          <div className="stat-target">Requires escalation</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="chart-container">
          <div className="chart-title">Investor Conversion Funnel</div>
          {data.funnelTotals.investorStages.map((s: FunnelStage, i: number) => {
            const pctFirst = (s.count / data.funnelTotals.investorStages[0].count * 100)
            return (
              <div key={s.id} className="funnel-bar">
                <span className="funnel-label">{s.name}</span>
                <div className="funnel-track">
                  <div className="funnel-fill" style={{ width: `${pctFirst}%`, background: i < 4 ? 'var(--primary)' : i < 7 ? 'var(--amber)' : 'var(--green)' }}>
                    <span className="funnel-count">{s.count.toLocaleString()}</span>
                  </div>
                </div>
                <span className="funnel-percent">{pctFirst.toFixed(1)}%</span>
              </div>
            )
          })}
        </div>

        <div className="chart-container">
          <div className="chart-title">Developer Pipeline Funnel</div>
          {data.funnelTotals.developerStages.map((s: FunnelStage, i: number) => {
            const pctFirst = (s.count / data.funnelTotals.developerStages[0].count * 100)
            return (
              <div key={s.id} className="funnel-bar">
                <span className="funnel-label">{s.name}</span>
                <div className="funnel-track">
                  <div className="funnel-fill" style={{ width: `${pctFirst}%`, background: i < 3 ? 'var(--primary)' : i < 5 ? 'var(--amber)' : 'var(--green)' }}>
                    <span className="funnel-count">{s.count}</span>
                  </div>
                </div>
                <span className="funnel-percent">{pctFirst.toFixed(1)}%</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-title">Weekly Review Status</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {data.weeklyReview.status.map((s: any) => (
            <div key={s.name} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '10px 14px', minWidth: 180 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: 4 }}>{s.name}</div>
              <span className={`status-dot status-${s.status}`} />
              <span style={{ fontSize: '0.85rem' }}>{s.status === 'green' ? 'On Track' : s.status === 'amber' ? 'At Risk' : s.status === 'red' ? 'Off Track' : s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Developer Dashboard ─── */
function DeveloperDashboard() {
  const [data, setData] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  useEffect(() => { api.developerKpis().then(setData) }, [])

  if (!data) return <div className="loading">Loading developer KPIs...</div>

  const kpis = data[period] as { metrics: KpiMetric[] }
  return (
    <div>
      <div className="page-header">
        <h1>👨‍💻 Developer KPI Dashboard</h1>
        <p>{data[period].description}</p>
      </div>
      <div className="tabs">
        <button className={`tab ${period === '90days' ? 'active' : ''}`} onClick={() => setPeriod('90days')}>90-Day View</button>
        <button className={`tab ${period === '12months' ? 'active' : ''}`} onClick={() => setPeriod('12months')}>12-Month View</button>
      </div>
      <div className="grid-4">{kpis.metrics.map(m => <KpiCard key={m.id} metric={m} />)}</div>
      <KpiList metrics={kpis.metrics} />
      {kpis.metrics.map(m => (
        <div key={m.id + '-chart'} className="chart-container">
          <div className="chart-title">{m.name} Trend · Target: {m.targetRange}</div>
          <TrendChart metric={m} />
        </div>
      ))}
    </div>
  )
}

/* ─── Investor Dashboard ─── */
function InvestorDashboard() {
  const [data, setData] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  useEffect(() => { api.investorKpis().then(setData) }, [])

  if (!data) return <div className="loading">Loading investor KPIs...</div>

  const kpis = data[period] as { metrics: KpiMetric[] }
  return (
    <div>
      <div className="page-header">
        <h1>💰 Investor KPI Dashboard</h1>
        <p>{data[period].description}</p>
      </div>
      <div className="tabs">
        <button className={`tab ${period === '90days' ? 'active' : ''}`} onClick={() => setPeriod('90days')}>90-Day View</button>
        <button className={`tab ${period === '12months' ? 'active' : ''}`} onClick={() => setPeriod('12months')}>12-Month View</button>
      </div>
      <div className="grid-4">{kpis.metrics.map(m => <KpiCard key={m.id} metric={m} />)}</div>
      <KpiList metrics={kpis.metrics} />
      {kpis.metrics.map(m => (
        <div key={m.id + '-chart'} className="chart-container">
          <div className="chart-title">{m.name} Trend · Target: {m.targetRange}</div>
          <TrendChart metric={m} />
        </div>
      ))}
    </div>
  )
}

/* ─── PR Dashboard ─── */
function PrDashboard() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { api.prKpis().then(setData) }, [])

  if (!data) return <div className="loading">Loading PR KPIs...</div>

  return (
    <div>
      <div className="page-header"><h1>📡 PR KPI Dashboard</h1><p>{data.description}</p></div>
      <div className="grid-4">{data.metrics.map((m: KpiMetric) => <KpiCard key={m.id} metric={m} />)}</div>
      <KpiList metrics={data.metrics} />
      {data.metrics.map((m: KpiMetric) => (
        <div key={m.id + '-chart'} className="chart-container">
          <div className="chart-title">{m.name} Trend · Target: {m.targetRange}</div>
          <TrendChart metric={m} />
        </div>
      ))}
    </div>
  )
}

/* ─── SEO/Content Dashboard ─── */
function SeoDashboard() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { api.seoContentKpis().then(setData) }, [])

  if (!data) return <div className="loading">Loading SEO/Content KPIs...</div>

  return (
    <div>
      <div className="page-header"><h1>🔍 SEO & Content KPI Dashboard</h1><p>{data.description}</p></div>
      <div className="grid-4">{data.metrics.map((m: KpiMetric) => <KpiCard key={m.id} metric={m} />)}</div>
      <KpiList metrics={data.metrics} />
      {data.metrics.map((m: KpiMetric) => (
        <div key={m.id + '-chart'} className="chart-container">
          <div className="chart-title">{m.name} Trend · Target: {m.targetRange}</div>
          <TrendChart metric={m} />
        </div>
      ))}
    </div>
  )
}

/* ─── Trust/Compliance Dashboard ─── */
function TrustComplianceDashboard() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { api.trustComplianceKpis().then(setData) }, [])

  if (!data) return <div className="loading">Loading Trust/Compliance KPIs...</div>

  return (
    <div>
      <div className="page-header"><h1>🛡️ Trust & Compliance KPI Dashboard</h1><p>{data.description}</p></div>
      <div className="grid-4">{data.metrics.map((m: KpiMetric) => <KpiCard key={m.id} metric={m} />)}</div>
      <KpiList metrics={data.metrics} />
      {data.metrics.map((m: KpiMetric) => (
        <div key={m.id + '-chart'} className="chart-container">
          <div className="chart-title">{m.name} Trend · Target: {m.targetRange}</div>
          <TrendChart metric={m} />
        </div>
      ))}
    </div>
  )
}

/* ─── Funnels ─── */
function FunnelsView() {
  const [investor, setInvestor] = useState<any>(null)
  const [developer, setDeveloper] = useState<any>(null)
  useEffect(() => {
    api.investorFunnel().then(setInvestor)
    api.developerFunnel().then(setDeveloper)
  }, [])

  if (!investor || !developer) return <div className="loading">Loading funnels...</div>

  const invConversion = (investor.stages[investor.stages.length - 1].count / investor.stages[0].count * 100).toFixed(2)
  const devConversion = (developer.stages[developer.stages.length - 1].count / developer.stages[0].count * 100).toFixed(2)

  return (
    <div>
      <div className="page-header">
        <h1>🔄 Conversion Funnels</h1>
        <p>Track progression from awareness through activation and repeat engagement for both investors and developers</p>
      </div>

      <div className="grid-4">
        <div className="stat-card">
          <span className="stat-label">Investor Funnel Conversion</span>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{invConversion}%</div>
          <div className="stat-target">From awareness → repeat investment</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Developer Funnel Conversion</span>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{devConversion}%</div>
          <div className="stat-target">From target account → asset approved</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Investor Funnel Stages</span>
          <div className="stat-value">{investor.stages.length}</div>
          <div className="stat-target">Awareness through repeat investment</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Developer Funnel Stages</span>
          <div className="stat-value">{developer.stages.length}</div>
          <div className="stat-target">Account identification through asset approval</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="chart-container">
          <div className="chart-title">Investor Conversion Funnel</div>
          {investor.stages.map((s: FunnelStage, i: number) => {
            const pctFirst = (s.count / investor.stages[0].count * 100)
            const pctPrev = i > 0 ? (s.count / investor.stages[i - 1].count * 100) : 100
            return (
              <div key={s.id} style={{ marginBottom: 4 }}>
                <div className="funnel-bar">
                  <span className="funnel-label">{s.name}</span>
                  <div className="funnel-track">
                    <div className="funnel-fill" style={{ width: `${pctFirst}%`, background: i < 4 ? 'var(--primary)' : i < 7 ? 'var(--amber)' : 'var(--green)' }}>
                      <span className="funnel-count">{s.count.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="funnel-percent">{pctFirst.toFixed(1)}%</span>
                </div>
                {i > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text2)', paddingLeft: 172, marginBottom: 2 }}>
                  Step conversion: {pctPrev.toFixed(1)}%
                </div>}
              </div>
            )
          })}
        </div>

        <div className="chart-container">
          <div className="chart-title">Developer Pipeline Funnel</div>
          {developer.stages.map((s: FunnelStage, i: number) => {
            const pctFirst = (s.count / developer.stages[0].count * 100)
            const pctPrev = i > 0 ? (s.count / developer.stages[i - 1].count * 100) : 100
            return (
              <div key={s.id} style={{ marginBottom: 4 }}>
                <div className="funnel-bar">
                  <span className="funnel-label">{s.name}</span>
                  <div className="funnel-track">
                    <div className="funnel-fill" style={{ width: `${pctFirst}%`, background: i < 3 ? 'var(--primary)' : i < 5 ? 'var(--amber)' : 'var(--green)' }}>
                      <span className="funnel-count">{s.count}</span>
                    </div>
                  </div>
                  <span className="funnel-percent">{pctFirst.toFixed(1)}%</span>
                </div>
                {i > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text2)', paddingLeft: 172, marginBottom: 2 }}>
                  Step conversion: {pctPrev.toFixed(1)}%
                </div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Share of Voice ─── */
function ShareOfVoice() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { api.shareOfVoice().then(setData) }, [])

  if (!data) return <div className="loading">Loading share of voice...</div>

  return (
    <div>
      <div className="page-header">
        <h1>📣 Share of Voice vs Competitors</h1>
        <p>Competitive visibility tracking with channel/scenario taxonomy — monitoring Blocks vs PRYPCO, Stake, SmartCrowd, Deed across PR, search, social, content, and paid/earned channels</p>
        <div className="meta-bar">
          <span><strong>Formula:</strong> Blocks mentions / SUM(competitor mentions) by channel</span>
          <span><strong>Cadence:</strong> Monthly refresh</span>
        </div>
      </div>

      <div className="dash-grid">
        <div className="chart-container">
          <div className="chart-title">Overall Share of Voice</div>
          {data.competitors.sort((a: any, b: any) => b.overall - a.overall).map((c: any) => (
            <div key={c.name} className="sov-row">
              <span className="sov-name" style={{ color: c.color }}>{c.name}</span>
              <div className="sov-bar">
                <div className="sov-fill" style={{ width: `${c.overall * 2.5}%`, background: c.color }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>{c.overall}%</span>
                </div>
              </div>
              <span className="sov-pct">{c.overall}%</span>
            </div>
          ))}
        </div>

        <div className="chart-container">
          <div className="chart-title">Channel Taxonomy</div>
          {Object.entries(data.channelTaxonomy).map(([ch, info]: [string, any]) => (
            <div key={ch} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 10, marginBottom: 6 }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ch}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{info.description}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 4 }}>
                Sources: {info.sources.join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-title">Channel Breakdown by Competitor</div>
        <div className="channel-sov">
          {data.competitors.map((c: any) => (
            <div key={c.name} className="channel-card">
              <h4 style={{ color: c.color }}>{c.name}</h4>
              {Object.entries(c.channels).map(([ch, pct]: [string, any]) => (
                <div key={ch} className="sov-row" style={{ padding: '4px 0' }}>
                  <span className="sov-name" style={{ fontSize: '0.8rem', minWidth: 60, fontWeight: 400 }}>{ch}</span>
                  <div className="sov-bar" style={{ height: 16 }}>
                    <div className="sov-fill" style={{ width: `${pct * 2.5}%`, background: c.color }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#fff' }}>{pct}%</span>
                    </div>
                  </div>
                  <span className="sov-pct" style={{ fontSize: '0.8rem' }}>{pct}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Document Tracking ─── */
function DocumentTracking() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { api.documentTracking().then(setData) }, [])

  if (!data) return <div className="loading">Loading document tracking...</div>

  return (
    <div>
      <div className="page-header"><h1>📄 Document Download Tracking</h1><p>{data.description}</p></div>

      {data.categories.map((cat: any) => (
        <div key={cat.name} className="card">
          <div className="card-header"><h3>{cat.name} ({cat.documents.length} documents)</h3></div>
          <div className="card-body">
            <div className="doc-grid">
              {cat.documents.map((d: any) => {
                const viewGrowth = d.views - d.lastWeekViews
                const dlGrowth = d.downloads - d.lastWeekDownloads
                return (
                  <div key={d.name} className="doc-card">
                    <div className="doc-name">{d.name}</div>
                    <div className="doc-stats">
                      <span>👁 {d.views} views {viewGrowth > 0 ? `(+${viewGrowth})` : ''}</span>
                      <span>⬇️ {d.downloads} downloads {dlGrowth > 0 ? `(+${dlGrowth})` : ''}</span>
                    </div>
                    <div className="progress" style={{ marginTop: 8 }}>
                      <div className="progress-fill" style={{ width: `${Math.min((d.downloads / Math.max(d.views, 1)) * 100, 100)}%`, background: 'var(--primary)' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 4 }}>
                      {((d.downloads / Math.max(d.views, 1)) * 100).toFixed(1)}% download rate
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Subscription Tracking ─── */
function SubscriptionTracking() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { api.subscriptionTracking().then(setData) }, [])

  if (!data) return <div className="loading">Loading subscription tracking...</div>

  const maxTrend = Math.max(...data.trends.subscriptionStarts)

  return (
    <div>
      <div className="page-header"><h1>💳 Funded Subscription Tracking</h1><p>{data.description}</p></div>

      <div className="subscription-stats">
        <div className="sub-stat">
          <div className="value" style={{ color: 'var(--primary)' }}>{data.summary.totalSubscriptionsStarted}</div>
          <div className="label">Subscriptions Started</div>
        </div>
        <div className="sub-stat">
          <div className="value" style={{ color: 'var(--green)' }}>{data.summary.totalFundingCompleted}</div>
          <div className="label">Funding Completed</div>
        </div>
        <div className="sub-stat">
          <div className="value" style={{ color: 'var(--red)' }}>{data.summary.failedPayments}</div>
          <div className="label">Failed Payments</div>
        </div>
        <div className="sub-stat">
          <div className="value" style={{ color: 'var(--amber)' }}>{(data.summary.failedPaymentRate * 100).toFixed(1)}%</div>
          <div className="label">Failed Payment Rate</div>
        </div>
        <div className="sub-stat">
          <div className="value" style={{ color: 'var(--blue)' }}>{(data.summary.conversionRateOfferToSub * 100).toFixed(1)}%</div>
          <div className="label">Offering → Subscription</div>
        </div>
        <div className="sub-stat">
          <div className="value" style={{ color: 'var(--primary)' }}>{(data.summary.conversionRateSubToFunded * 100).toFixed(1)}%</div>
          <div className="label">Subscription → Funded</div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-title">Subscription & Funding Trend (Weekly)</div>
        <svg width="100%" height={150} viewBox={`0 0 ${data.trends.subscriptionStarts.length * 30} 150`} style={{ overflow: 'visible' }}>
          {data.trends.subscriptionStarts.map((v: number, i: number) => {
            const x = i * 30 + 15
            const y = 140 - (v / maxTrend) * 130
            return <circle key={`ss-${i}`} cx={x} cy={y} r={3} fill="var(--primary)" />
          })}
          <polyline points={data.trends.subscriptionStarts.map((v: number, i: number) => {
            return `${i * 30 + 15},${140 - (v / maxTrend) * 130}`
          }).join(' ')} fill="none" stroke="var(--primary)" strokeWidth={2} />

          {data.trends.fundingCompleted.map((v: number, i: number) => {
            const x = i * 30 + 15
            const y = 140 - (v / maxTrend) * 130
            return <circle key={`fc-${i}`} cx={x} cy={y} r={3} fill="var(--green)" />
          })}
          <polyline points={data.trends.fundingCompleted.map((v: number, i: number) => {
            return `${i * 30 + 15},${140 - (v / maxTrend) * 130}`
          }).join(' ')} fill="none" stroke="var(--green)" strokeWidth={2} />

          {data.trends.failedPayments.map((v: number, i: number) => {
            const x = i * 30 + 15
            const y = 140 - (v / maxTrend) * 130
            return <circle key={`fp-${i}`} cx={x} cy={y} r={3} fill="var(--red)" />
          })}
          <polyline points={data.trends.failedPayments.map((v: number, i: number) => {
            return `${i * 30 + 15},${140 - (v / maxTrend) * 130}`
          }).join(' ')} fill="none" stroke="var(--red)" strokeWidth={2} />
        </svg>
        <div style={{ display: 'flex', gap: 20, fontSize: '0.8rem', color: 'var(--text2)', marginTop: 8 }}>
          <span><span style={{ color: 'var(--primary)', fontWeight: 600 }}>●</span> Subscription Starts</span>
          <span><span style={{ color: 'var(--green)', fontWeight: 600 }}>●</span> Funding Completed</span>
          <span><span style={{ color: 'var(--red)', fontWeight: 600 }}>●</span> Failed Payments</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Weekly Review ─── */
function WeeklyReview() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { api.weeklyReview().then(setData) }, [])

  if (!data) return <div className="loading">Loading weekly review...</div>

  return (
    <div>
      <div className="page-header">
        <h1>📋 Weekly KPI Review</h1>
        <p>{data.description}</p>
        <div className="meta-bar">
          <span><strong>Week:</strong> {data.currentWeek}</span>
          <span><strong>Sections:</strong> {data.sections.length}</span>
          <span><strong>Open Actions:</strong> {data.actionItems.filter((a: ActionItem) => a.status !== 'done').length}</span>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Section Status Overview</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {data.sections.map((s: WeeklyReviewSection) => (
            <div key={s.name} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: '0.82rem' }}>
              <span className={`status-dot status-${s.status}`} />
              {s.name}
            </div>
          ))}
        </div>
      </div>

      {data.sections.map((s: WeeklyReviewSection) => (
        <div key={s.name} className="section-card">
          <h3>
            <span className={`status-dot status-${s.status}`} />
            {s.name}
          </h3>

          {s.highlights.length > 0 && (
            <div className="subsection">
              <h4>Highlights</h4>
              <ul>{s.highlights.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul>
            </div>
          )}

          {s.blockers.length > 0 && (
            <div className="subsection">
              <h4>Blockers</h4>
              <ul>{s.blockers.map((b: string, i: number) => <li key={i}>{b}</li>)}</ul>
            </div>
          )}

          {s.decisions.length > 0 && (
            <div className="subsection">
              <h4>Decisions Made</h4>
              <ul>{s.decisions.map((d: string, i: number) => <li key={i}>{d}</li>)}</ul>
            </div>
          )}
        </div>
      ))}

      <div className="card">
        <div className="card-header"><h3>Action Items ({data.actionItems.filter((a: ActionItem) => a.status !== 'done').length} open)</h3></div>
        <div className="card-body no-pad">
          {data.actionItems.map((a: ActionItem) => (
            <div key={a.id} className="action-row">
              <span className="action-id">{a.id}</span>
              <span className="action-desc">{a.description}</span>
              <span className="action-owner">{a.owner}</span>
              <span className="action-due">{a.dueDate}</span>
              <span className="action-status">
                <span className={`badge ${a.status === 'open' ? 'badge-amber' : a.status === 'in-progress' ? 'badge-blue' : a.status === 'done' ? 'badge-green' : 'badge-red'}`}>
                  {a.status}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── KPI Dictionary ─── */
function KpiDictionary() {
  const [data, setData] = useState<any>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  useEffect(() => { api.kpiDictionary().then(setData) }, [])

  if (!data) return <div className="loading">Loading KPI dictionary...</div>

  return (
    <div>
      <div className="page-header"><h1>📖 KPI Dictionary</h1><p>{data.description}</p></div>

      {data.categories.map((cat: any) => (
        <div key={cat.name} className="card">
          <div className="card-header"><h3>{cat.name} ({cat.entries.length} KPIs)</h3></div>
          <div className="card-body no-pad">
            {cat.entries.map((e: any) => (
              <div key={e.metric} className="kpi-row" style={{ cursor: 'pointer', flexWrap: 'wrap' }} onClick={() => setExpanded(expanded === e.metric ? null : e.metric)}>
                <span className="kpi-name"><strong>{e.metric}</strong></span>
                <span className="kpi-val" style={{ fontSize: '0.78rem', color: 'var(--text2)', minWidth: 'auto' }}>{e.grain}</span>
                <span className="kpi-target" style={{ fontSize: '0.78rem', minWidth: 'auto' }}>{e.cadence}</span>
                {expanded === e.metric && (
                  <div style={{ width: '100%', padding: '8px 0 4px', borderTop: '1px solid var(--border)', marginTop: 4 }}>
                    <div className="dict-card" style={{ background: 'transparent', border: 'none', padding: 0, margin: 0 }}>
                      <div className="dict-formula">{e.formula}</div>
                      <div className="dict-meta">
                        <span><strong>Owner:</strong> {e.owner}</span>
                        <span><strong>Source:</strong> {e.source}</span>
                        <span><strong>Trigger:</strong> {e.eventTrigger}</span>
                      </div>
                      {e.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginTop: 6 }}>Notes: {e.notes}</div>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Instrumentation ─── */
function Instrumentation() {
  const [data, setData] = useState<any>(null)
  const [tab, setTab] = useState<'investor' | 'developer'>('investor')
  useEffect(() => { api.funnelInstrumentation().then(setData) }, [])

  if (!data) return <div className="loading">Loading instrumentation...</div>

  const events = data[tab].events

  return (
    <div>
      <div className="page-header"><h1>⚙️ Funnel Instrumentation Spec</h1><p>{data[tab].description}</p></div>

      <div className="tabs">
        <button className={`tab ${tab === 'investor' ? 'active' : ''}`} onClick={() => setTab('investor')}>Investor Funnel Events</button>
        <button className={`tab ${tab === 'developer' ? 'active' : ''}`} onClick={() => setTab('developer')}>Developer Funnel Events</button>
      </div>

      {events.map((ev: any) => (
        <div key={ev.eventName} className="event-card">
          <div className="ev-name">{ev.eventName}</div>
          <div className="ev-trigger">Trigger: {ev.trigger}</div>
          <div className="ev-props">
            <strong>Required Properties:</strong>{' '}
            {ev.requiredProperties.map((p: string) => <code key={p}>{p}</code>).reduce((prev: any, curr: any, i: number) => i === 1 ? [prev, ', ', curr] : [...prev, ', ', curr])}
          </div>
          <div className="ev-valid">Validation: {ev.validation}</div>
        </div>
      ))}
    </div>
  )
}

export default App