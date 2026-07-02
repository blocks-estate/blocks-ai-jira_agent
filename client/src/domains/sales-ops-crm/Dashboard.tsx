import { useState, useEffect } from 'react'
import { fetchJSON, salesOpsCrm } from '../../api'
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

export default function SalesOpsCrmDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [loiTracking, setLoiTracking] = useState<any>(null)
  const [pipeline, setPipeline] = useState<any>(null)
  const [reporting, setReporting] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      salesOpsCrm.kpis(),
      salesOpsCrm.loiTracking(),
      salesOpsCrm.pipeline(),
      salesOpsCrm.reporting(),
    ]).then(([k, lt, p, r]) => {
      setKpis(k)
      setLoiTracking(lt)
      setPipeline(p)
      setReporting(r)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading Sales Ops & CRM Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>Sales Ops & CRM Dashboard</h1>
        <p>LOI pipeline management — drafting, signing, expiry tracking, pipeline visibility, and reporting</p>
        <div className="meta-bar">
          <span><strong>Pipeline:</strong> {pipeline?.totalRecords || 0} records · AED {(pipeline?.totalEstimatedValue || 0) / 1000000}M</span>
          <span><strong>Avg Days to Sign:</strong> {pipeline?.avgDaysToSign || '-'}</span>
          <span><strong>Signed:</strong> {reporting?.signedCount || 0} · <strong>Pending:</strong> {reporting?.pendingCount || 0}</span>
        </div>
      </div>

      {pipeline && (
        <div className="grid-4">
          <div className="stat-card">
            <span className="stat-label">Total Records</span>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{pipeline.totalRecords}</div>
            <div className="stat-target">Across all stages</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Value</span>
            <div className="stat-value" style={{ color: 'var(--green)' }}>AED {(pipeline.totalEstimatedValue / 1000000).toFixed(0)}M</div>
            <div className="stat-target">Estimated pipeline value</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Avg Days to Sign</span>
            <div className="stat-value" style={{ color: 'var(--amber)' }}>{pipeline.avgDaysToSign}d</div>
            <div className="stat-target">From draft to signed</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Signed LOIs</span>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{reporting?.signedCount || 0}</div>
            <div className="stat-target">Signed to date</div>
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${period === '90days' ? 'active' : ''}`} onClick={() => setPeriod('90days')}>90-Day View</button>
        <button className={`tab ${period === '12months' ? 'active' : ''}`} onClick={() => setPeriod('12months')}>12-Month View</button>
      </div>

      {kpiMetrics.length > 0 && (
        <div className="grid-4">{kpiMetrics.map((m: KpiMetric) => <KpiCard key={m.id} metric={m} />)}</div>
      )}

      <div className="dash-grid">
        {pipeline?.stageDistribution && pipeline.stageDistribution.length > 0 && (
          <div className="chart-container">
            <div className="chart-title">LOI Pipeline Stages</div>
            {pipeline.stageDistribution.map((s: any) => {
              const maxCount = Math.max(...pipeline.stageDistribution.map((x: any) => x.count))
              const pct = (s.count / maxCount) * 100
              return (
                <div key={s.stage} className="funnel-bar">
                  <span className="funnel-label" style={{ minWidth: 100 }}>{s.stage}</span>
                  <div className="funnel-track">
                    <div className="funnel-fill" style={{ width: `${pct}%`, background: s.stage === 'signed' ? 'var(--green)' : s.stage === 'expired' || s.stage === 'not-proceeding' ? 'var(--red)' : s.stage === 'negotiation' ? 'var(--amber)' : 'var(--primary)' }}>
                      <span className="funnel-count">{s.count}</span>
                    </div>
                  </div>
                  <span className="funnel-percent">{s.count}</span>
                </div>
              )
            })}
          </div>
        )}

        {loiTracking?.items && loiTracking.items.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>LOI Records ({loiTracking.totalItems})</h3></div>
            <div className="card-body no-pad">
              {loiTracking.items.map((loi: any) => (
                <div key={loi.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{loi.counterpartyName}</span>
                  <span className={`badge ${loi.stage === 'signed' ? 'badge-green' : loi.stage === 'expired' || loi.stage === 'not-proceeding' ? 'badge-red' : loi.stage === 'negotiation' ? 'badge-amber' : 'badge-blue'}`}>{loi.stage}</span>
                  <span className="kpi-val" style={{ fontSize: '0.75rem', fontWeight: 400, minWidth: 70 }}>{loi.counterpartyType}</span>
                  <span className="kpi-target">{loi.estimatedValue ? `AED ${(loi.estimatedValue / 1000000).toFixed(0)}M` : '-'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {reporting?.valueByStage && reporting.valueByStage.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Value by Stage</h3></div>
          <div className="card-body no-pad">
            {reporting.valueByStage.map((v: any) => (
              <div key={v.stage} className="kpi-row">
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{v.stage}</span>
                <span className="kpi-val" style={{ fontSize: '0.8rem', fontWeight: 400, minWidth: 50 }}>{v.count}</span>
                <span className="kpi-target">AED {(v.totalValue / 1000000).toFixed(0)}M</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
