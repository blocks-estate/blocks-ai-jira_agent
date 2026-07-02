import { useState, useEffect } from 'react'
import { fetchJSON, productMarketing } from '../../api'
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

export default function ProductMarketingDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [launchTracker, setLaunchTracker] = useState<any>(null)
  const [messaging, setMessaging] = useState<any>(null)
  const [feeStructure, setFeeStructure] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productMarketing.kpis(),
      productMarketing.launchTracker(),
      productMarketing.messaging(),
      productMarketing.feeStructure(),
    ]).then(([k, lt, m, fs]) => {
      setKpis(k)
      setLaunchTracker(lt)
      setMessaging(m)
      setFeeStructure(fs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading Product Marketing Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>Product Marketing Dashboard</h1>
        <p>Product launch marketing — GTM messaging, fee structure, pricing, and launch tracker</p>
        <div className="meta-bar">
          <span><strong>Launch Items:</strong> {launchTracker?.length || 0} tracked</span>
          <span><strong>Messaging Guides:</strong> {messaging?.length || 0}</span>
          <span><strong>Fees:</strong> {feeStructure?.length || 0} defined</span>
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
        {launchTracker && launchTracker.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Launch Tracker ({launchTracker.length})</h3></div>
            <div className="card-body no-pad">
              {launchTracker.map((item: any) => (
                <div key={item.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{item.name}</span>
                  <span className={`badge ${item.status === 'approved' ? 'badge-green' : item.status === 'in-progress' ? 'badge-blue' : item.status === 'in-review' ? 'badge-amber' : item.status === 'blocked' ? 'badge-red' : 'badge-blue'}`}>{item.status}</span>
                  <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 60 }}>{item.owner}</span>
                  <span className="kpi-target">{item.targetDate || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {messaging && messaging.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Messaging Guides ({messaging.length})</h3></div>
            <div className="card-body no-pad">
              {messaging.map((guide: any) => (
                <div key={guide.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{guide.topic}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text2)', minWidth: 80 }}>{guide.audience}</span>
                  <span className={`badge ${guide.complianceStatus === 'approved' ? 'badge-green' : guide.complianceStatus === 'reviewed' ? 'badge-blue' : 'badge-amber'}`}>{guide.complianceStatus}</span>
                  <span className="kpi-target" style={{ fontSize: '0.72rem' }}>v{guide.version || 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {feeStructure && feeStructure.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Fee Structure ({feeStructure.length})</h3></div>
          <div className="card-body">
            <div className="grid-4" style={{ marginBottom: 0 }}>
              {feeStructure.map((fee: any) => (
                <div key={fee.id} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{fee.feeName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: 2 }}>{fee.amount}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text2)', marginTop: 4 }}>
                    <div>Payer: {fee.payer}</div>
                    <div>Trigger: {fee.trigger}</div>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <span className={`badge ${fee.status === 'active' ? 'badge-green' : fee.status === 'pending' ? 'badge-amber' : 'badge-blue'}`}>{fee.status}</span>
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
