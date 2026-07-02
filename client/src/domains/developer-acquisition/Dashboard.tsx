import { useState, useEffect } from 'react'
import { fetchJSON, developerAcquisition } from '../../api'
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
      <div className="chart-title">Developer Acquisition Funnel</div>
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

function PipelineSummaryCard({ summary }: { summary: any }) {
  if (!summary) return null
  return (
    <div className="card">
      <div className="card-header"><h3>Pipeline Summary</h3></div>
      <div className="card-body no-pad">
        <div style={{ display: 'flex', gap: 16, padding: 14 }}>
          <div className="sub-stat"><div className="value" style={{ color: 'var(--primary)' }}>{summary.totalOpportunities}</div><div className="label">Opportunities</div></div>
          <div className="sub-stat"><div className="value" style={{ color: 'var(--green)' }}>AED {(summary.totalEstimatedValue / 1000000).toFixed(0)}M</div><div className="label">Total Value</div></div>
          <div className="sub-stat"><div className="value" style={{ color: 'var(--amber)' }}>{summary.averageVelocityDays}d</div><div className="label">Avg Velocity</div></div>
        </div>
      </div>
    </div>
  )
}

export default function DeveloperAcquisitionDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [funnel, setFunnel] = useState<any>(null)
  const [pipelineSummary, setPipelineSummary] = useState<any>(null)
  const [opportunities, setOpportunities] = useState<any>(null)
  const [scorecards, setScorecards] = useState<any>(null)
  const [assets, setAssets] = useState<any>(null)
  const [areas, setAreas] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      developerAcquisition.kpis(),
      developerAcquisition.funnel(),
      developerAcquisition.pipelineSummary(),
      developerAcquisition.opportunities(),
      developerAcquisition.scorecards(),
      developerAcquisition.assets(),
      developerAcquisition.areas(),
    ]).then(([k, f, ps, opp, sc, asst, ar]) => {
      setKpis(k)
      setFunnel(f)
      setPipelineSummary(ps)
      setOpportunities(opp)
      setScorecards(sc)
      setAssets(asst)
      setAreas(ar)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading Developer Acquisition Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>Developer Acquisition Dashboard</h1>
        <p>Developer supply pipeline — target accounts, asset prioritization, LOI execution, and onboarding tracking</p>
        <div className="meta-bar">
          <span><strong>Pipeline:</strong> {pipelineSummary?.totalOpportunities || 0} opportunities · AED {(pipelineSummary?.totalEstimatedValue || 0) / 1000000}M estimated value</span>
          <span><strong>Avg Velocity:</strong> {pipelineSummary?.averageVelocityDays || '-'} days to LOI</span>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${period === '90days' ? 'active' : ''}`} onClick={() => setPeriod('90days')}>90-Day View</button>
        <button className={`tab ${period === '12months' ? 'active' : ''}`} onClick={() => setPeriod('12months')}>12-Month View</button>
      </div>

      {kpiMetrics.length > 0 && (
        <>
          <div className="grid-4">{kpiMetrics.map((m: KpiMetric) => <KpiCard key={m.id} metric={m} />)}</div>
          <PipelineSummaryCard summary={pipelineSummary} />
        </>
      )}

      <div className="dash-grid">
        {funnel?.stages && <FunnelChart stages={funnel.stages} />}
        {assets && assets.length > 0 && (
          <div className="chart-container">
            <div className="chart-title">Candidate Assets ({assets.length})</div>
            {assets.map((a: any) => (
              <div key={a.id} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.name}</span>
                  <span className={`badge ${a.status === 'active' ? 'badge-green' : a.status === 'pending' ? 'badge-amber' : 'badge-blue'}`}>{a.status}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: 2 }}>{a.assetType} · {a.location}{a.estimatedValue ? ` · AED ${(a.estimatedValue / 1000000).toFixed(0)}M` : ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {opportunities?.items && opportunities.items.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Developer Opportunities ({opportunities.totalItems})</h3></div>
          <div className="card-body no-pad">
            {opportunities.items.map((o: any) => (
              <div key={o.id} className="kpi-row">
                <StatusBadge status={o.stage === 'loi-signed' || o.stage === 'onboarding' ? 'on-track' : o.stage === 'target-identified' || o.stage === 'outreach-in-progress' ? 'at-risk' : 'off-track'} />
                <span className="kpi-name">{o.developerName}</span>
                <span className="kpi-val" style={{ fontSize: '0.78rem', minWidth: 100, fontWeight: 400 }}>{o.stage.replace(/-/g, ' ')}</span>
                <span className="kpi-target">{o.priorityScore ? `${o.priorityScore}/100` : '-'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {scorecards && scorecards.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Asset Scorecards ({scorecards.length})</h3></div>
          <div className="card-body no-pad">
            {scorecards.map((s: any) => (
              <div key={s.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: '0.82rem', minWidth: 120 }}>Score: {s.totalScore}/100</span>
                <span className="badge" style={{ background: s.tier === 'tier-1' ? 'var(--green-bg)' : s.tier === 'tier-2' ? 'var(--amber-bg)' : 'var(--red-bg)', color: s.tier === 'tier-1' ? 'var(--green)' : s.tier === 'tier-2' ? 'var(--amber)' : 'var(--red)' }}>{s.tier}</span>
                {s.categories?.map((c: any) => (
                  <span key={c.name} style={{ fontSize: '0.75rem', color: 'var(--text2)', marginLeft: 8 }}>{c.name}: {c.score}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {areas && areas.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Priority Areas ({areas.length})</h3></div>
          <div className="card-body">
            <div className="grid-4">
              {areas.map((a: any) => (
                <div key={a.name} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>#{a.rank} {a.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 4 }}>
                    <div>Demand: {a.investorDemand}</div>
                    <div>Supply: {a.supplyAvailability}</div>
                    <div>Familiarity: {a.marketFamiliarity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
