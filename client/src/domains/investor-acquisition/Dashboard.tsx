import { useState, useEffect } from 'react'
import { fetchJSON, investorAcquisition } from '../../api'
import type { KpiMetric } from '../../api'

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
      <div className="stat-value">{typeof metric.current === 'number' ? metric.current.toLocaleString() : metric.current}</div>
      <div className="stat-target">Target: {metric.targetRange}</div>
      <div className="progress"><div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: fillColor }} /></div>
    </div>
  )
}

function FunnelChart({ stages }: { stages: any[] }) {
  if (!stages || stages.length === 0) return null
  return (
    <div className="chart-container">
      <div className="chart-title">Investor Acquisition Funnel</div>
      {stages.map((s: any, i: number) => {
        const pctFirst = (s.count / stages[0].count * 100)
        const pctPrev = i > 0 && stages[i - 1].count > 0 ? (s.count / stages[i - 1].count * 100) : 100
        return (
          <div key={s.id || i} style={{ marginBottom: 4 }}>
            <div className="funnel-bar">
              <span className="funnel-label">{s.name}</span>
              <div className="funnel-track">
                <div className="funnel-fill" style={{ width: `${pctFirst}%`, background: i < 3 ? 'var(--primary)' : i < 5 ? 'var(--amber)' : 'var(--green)' }}>
                  <span className="funnel-count">{s.count.toLocaleString()}</span>
                </div>
              </div>
              <span className="funnel-percent">{pctFirst.toFixed(1)}%</span>
            </div>
            {i > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text2)', paddingLeft: 172, marginBottom: 2 }}>Step conversion: {pctPrev.toFixed(1)}%</div>}
          </div>
        )
      })}
    </div>
  )
}

export default function InvestorAcquisitionDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [funnel, setFunnel] = useState<any>(null)
  const [waitlist, setWaitlist] = useState<any>(null)
  const [segments, setSegments] = useState<any>(null)
  const [positioningTests, setPositioningTests] = useState<any>(null)
  const [complianceMatrix, setComplianceMatrix] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      investorAcquisition.kpis(),
      investorAcquisition.funnel(),
      investorAcquisition.waitlist(),
      investorAcquisition.segments(),
      investorAcquisition.positioningTests(),
      investorAcquisition.complianceMatrix(),
    ]).then(([k, f, w, s, pt, cm]) => {
      setKpis(k)
      setFunnel(f)
      setWaitlist(w)
      setSegments(s)
      setPositioningTests(pt)
      setComplianceMatrix(cm)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading Investor Acquisition Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>Investor Acquisition Dashboard</h1>
        <p>Investor demand generation pipeline — waitlist, segmentation, positioning tests, and compliance review</p>
        <div className="meta-bar">
          <span><strong>Waitlist:</strong> {waitlist?.totalItems || 0} signups</span>
          <span><strong>Segments:</strong> {segments?.length || 0} defined</span>
          <span><strong>Tests:</strong> {positioningTests?.length || 0} positioning tests</span>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${period === '90days' ? 'active' : ''}`} onClick={() => setPeriod('90days')}>90-Day View</button>
        <button className={`tab ${period === '12months' ? 'active' : ''}`} onClick={() => setPeriod('12months')}>12-Month View</button>
      </div>

      {kpiMetrics.length > 0 && (
        <div className="grid-4">{kpiMetrics.map((m: KpiMetric) => <KpiCard key={m.id} metric={m} />)}</div>
      )}

      <div className="dash-grid">
        {funnel?.stages && <FunnelChart stages={funnel.stages} />}

        {segments && segments.length > 0 && (
          <div className="chart-container">
            <div className="chart-title">Audience Segments ({segments.length})</div>
            {segments.map((s: any) => (
              <div key={s.id} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 6 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: 2 }}>Size: {s.estimatedSize?.toLocaleString() || 'N/A'} · {s.messagingAngle}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {positioningTests && positioningTests.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Positioning Tests ({positioningTests.length})</h3></div>
          <div className="card-body no-pad">
            {positioningTests.map((t: any) => (
              <div key={t.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                <span className="kpi-name">{t.name}</span>
                <span className={`badge ${t.status === 'active' ? 'badge-green' : t.status === 'completed' || t.status === 'analysing' ? 'badge-blue' : t.status === 'paused' ? 'badge-amber' : 'badge-red'}`}>{t.status}</span>
                <span className="kpi-target" style={{ fontSize: '0.75rem' }}>Segments: {t.targetSegments?.join(', ')}</span>
                <span className={`badge ${t.complianceStatus === 'approved' ? 'badge-green' : t.complianceStatus === 'pending-review' ? 'badge-amber' : 'badge-red'}`} style={{ marginLeft: 8 }}>{t.complianceStatus}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {waitlist?.items && waitlist.items.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Recent Waitlist Signups</h3></div>
          <div className="card-body no-pad">
            {waitlist.items.slice(0, 10).map((w: any) => (
              <div key={w.id} className="kpi-row">
                <span className="kpi-name" style={{ fontSize: '0.78rem' }}>{w.email}</span>
                <span className="kpi-val" style={{ fontSize: '0.78rem', fontWeight: 400, minWidth: 100 }}>{w.segment || '-'}</span>
                <span className="kpi-target">{w.sourceChannel}</span>
                <span className={`badge ${w.kycStatus === 'completed' ? 'badge-green' : w.kycStatus === 'active' ? 'badge-blue' : 'badge-amber'}`}>{w.kycStatus}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {complianceMatrix && complianceMatrix.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Compliance Matrix ({complianceMatrix.length} entries)</h3></div>
          <div className="card-body no-pad">
            {complianceMatrix.map((c: any) => (
              <div key={c.id} className="kpi-row">
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{c.claim}</span>
                <span className={`badge ${c.riskLevel === 'low' ? 'badge-green' : c.riskLevel === 'medium' ? 'badge-amber' : c.riskLevel === 'high' ? 'badge-red' : 'badge-blue'}`}>{c.riskLevel}</span>
                <span className="kpi-target">{c.approvalStatus}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
