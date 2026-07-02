import { useState, useEffect } from 'react'
import { fetchJSON, positioningMessaging } from '../../api'
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

export default function PositioningMessagingDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [differentiationMatrix, setDifferentiationMatrix] = useState<any>(null)
  const [themes, setThemes] = useState<any>(null)
  const [messagingGuide, setMessagingGuide] = useState<any>(null)
  const [guardrails, setGuardrails] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      positioningMessaging.kpis(),
      positioningMessaging.differentiationMatrix(),
      positioningMessaging.themes(),
      positioningMessaging.messagingGuide(),
      positioningMessaging.guardrails(),
    ]).then(([k, dm, t, mg, g]) => {
      setKpis(k)
      setDifferentiationMatrix(dm)
      setThemes(t)
      setMessagingGuide(mg)
      setGuardrails(g)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading Positioning & Messaging Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>Positioning & Messaging Dashboard</h1>
        <p>Category positioning and messaging architecture — differentiation, narrative spine, themes, and guardrails</p>
        <div className="meta-bar">
          <span><strong>Differentiation:</strong> {differentiationMatrix?.length || 0} entries</span>
          <span><strong>Themes:</strong> {themes?.length || 0} active</span>
          <span><strong>Message Blocks:</strong> {messagingGuide?.length || 0}</span>
          <span><strong>Guardrails:</strong> {guardrails?.length || 0}</span>
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
        {differentiationMatrix && differentiationMatrix.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Competitor Differentiation ({differentiationMatrix.length})</h3></div>
            <div className="card-body no-pad">
              {differentiationMatrix.map((d: any) => (
                <div key={d.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                  <span className="kpi-name" style={{ fontSize: '0.82rem', fontWeight: 600 }}>{d.competitorName}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text2)', minWidth: 80 }}>{d.category || ''}</span>
                  <span className="kpi-target" style={{ fontSize: '0.72rem', flex: 1 }}>{d.blocksAdvantage}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {themes && themes.length > 0 && (
          <div className="chart-container">
            <div className="chart-title">Positioning Themes ({themes.length})</div>
            {themes.map((t: any) => (
              <div key={t.id} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.name}</span>
                  <span className={`badge ${t.active ? 'badge-green' : 'badge-blue'}`}>{t.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: 2 }}>"{t.approvedPhrase}"</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {messagingGuide && messagingGuide.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Messaging Guide ({messagingGuide.length} blocks)</h3></div>
          <div className="card-body no-pad">
            {messagingGuide.map((block: any) => (
              <div key={block.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{block.blockType?.replace(/-/g, ' ')}</span>
                <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 80 }}>{block.audience || '-'}</span>
                <span className={`badge ${block.status === 'approved' ? 'badge-green' : block.status === 'reviewed' ? 'badge-blue' : block.status === 'superseded' ? 'badge-red' : 'badge-amber'}`}>{block.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {guardrails && guardrails.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Positioning Guardrails ({guardrails.length})</h3></div>
          <div className="card-body no-pad">
            {guardrails.map((g: any) => (
              <div key={g.id} className="kpi-row">
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{g.rule}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text2)', minWidth: 100 }}>{g.guardrailType?.replace(/-/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}