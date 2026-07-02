import { useState, useEffect } from 'react'
import { fetchJSON, paidMedia } from '../../api'
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

export default function PaidMediaDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [creativeLibrary, setCreativeLibrary] = useState<any>(null)
  const [avoidList, setAvoidList] = useState<any>(null)
  const [reviewQueue, setReviewQueue] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      paidMedia.kpis(),
      paidMedia.creativeLibrary(),
      paidMedia.avoidList(),
      paidMedia.reviewQueue(),
    ]).then(([k, cl, al, rq]) => {
      setKpis(k)
      setCreativeLibrary(cl)
      setAvoidList(al)
      setReviewQueue(rq)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading Paid Media Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>Paid Media Dashboard</h1>
        <p>Compliant education-first paid media — creative library, ad avoid list, review checklists, and platform compliance</p>
        <div className="meta-bar">
          <span><strong>Creative Assets:</strong> {creativeLibrary?.length || 0}</span>
          <span><strong>Avoid List:</strong> {avoidList?.length || 0} entries</span>
          <span><strong>Review Queue:</strong> {reviewQueue?.length || 0}</span>
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
        {creativeLibrary && creativeLibrary.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Creative Library ({creativeLibrary.length})</h3></div>
            <div className="card-body no-pad">
              {creativeLibrary.map((asset: any) => (
                <div key={asset.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{asset.name}</span>
                  <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 60 }}>{asset.platform}</span>
                  <span className={`badge ${asset.reviewStatus === 'completed' ? 'badge-green' : asset.reviewStatus === 'active' ? 'badge-blue' : 'badge-amber'}`}>{asset.reviewStatus}</span>
                  <span className={`badge ${asset.riskLevel === 'low' ? 'badge-green' : asset.riskLevel === 'medium' ? 'badge-amber' : 'badge-red'}`}>{asset.riskLevel}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {avoidList && avoidList.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Paid Media Avoid List ({avoidList.length})</h3></div>
            <div className="card-body no-pad">
              {avoidList.map((a: any) => (
                <div key={a.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{a.phrase}</span>
                  <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 60 }}>{a.platform}</span>
                  <span className="kpi-target" style={{ fontSize: '0.72rem' }}>{a.riskRationale}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {reviewQueue && reviewQueue.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Ad Review Queue ({reviewQueue.length})</h3></div>
          <div className="card-body no-pad">
            {reviewQueue.map((checklist: any) => (
              <div key={checklist.id} className="kpi-row">
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>Creative {checklist.creativeId?.slice(0, 8)}</span>
                <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 50 }}>{checklist.checks?.filter((c: any) => c.passed).length || 0}/{checklist.checks?.length || 0}</span>
                <span className={`badge ${checklist.result === 'pass' ? 'badge-green' : checklist.result === 'conditional-pass' ? 'badge-amber' : 'badge-red'}`}>{checklist.result}</span>
                <span className="kpi-target">{checklist.reviewer}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}