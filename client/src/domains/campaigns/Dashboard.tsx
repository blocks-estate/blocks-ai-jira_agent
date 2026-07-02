import { useState, useEffect } from 'react'
import { fetchJSON, campaigns } from '../../api'
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

export default function CampaignsDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [campaignList, setCampaignList] = useState<any>(null)
  const [referralTests, setReferralTests] = useState<any>(null)
  const [checklists, setChecklists] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      campaigns.kpis(),
      campaigns.campaigns(),
      campaigns.referralTests(),
      campaigns.launchChecklists(),
    ]).then(([k, c, rt, ch]) => {
      setKpis(k)
      setCampaignList(c)
      setReferralTests(rt)
      setChecklists(ch)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading Campaigns Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>Campaigns Dashboard</h1>
        <p>Campaign execution — planning, creative, launch QA, and referral/ambassador test management</p>
        <div className="meta-bar">
          <span><strong>Campaigns:</strong> {campaignList?.totalItems || 0} total</span>
          <span><strong>Referral Tests:</strong> {referralTests?.length || 0}</span>
          <span><strong>Launch Checklists:</strong> {checklists?.length || 0}</span>
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
        {campaignList?.items && campaignList.items.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Campaigns ({campaignList.totalItems})</h3></div>
            <div className="card-body no-pad">
              {campaignList.items.map((c: any) => (
                <div key={c.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.82rem' }}>{c.name}</span>
                  <span className={`badge ${c.status === 'live' ? 'badge-green' : c.status === 'ready-for-launch' ? 'badge-blue' : c.status === 'paused' || c.status === 'drafting' ? 'badge-amber' : c.status === 'completed' ? 'badge-blue' : 'badge-red'}`}>{c.status}</span>
                  <span className="kpi-val" style={{ fontSize: '0.75rem', fontWeight: 400, minWidth: 80 }}>{c.audience || '-'}</span>
                  <span className="kpi-target">{c.owner}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {referralTests && referralTests.length > 0 && (
          <div className="chart-container">
            <div className="chart-title">Referral Tests ({referralTests.length})</div>
            {referralTests.map((t: any) => (
              <div key={t.id} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.name}</span>
                  <span className={`badge ${t.status === 'active' ? 'badge-green' : t.status === 'analysing' || t.status === 'completed' ? 'badge-blue' : t.status === 'paused' ? 'badge-amber' : 'badge-blue'}`}>{t.status}</span>
                </div>
                {t.resultsSummary && <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: 4 }}>{t.resultsSummary}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {checklists && checklists.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Launch Readiness Checklists ({checklists.length})</h3></div>
          <div className="card-body no-pad">
            {checklists.map((ch: any) => (
              <div key={ch.id} className="kpi-row">
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>Campaign {ch.campaignId?.slice(0, 8)}</span>
                <span className="kpi-val" style={{ fontSize: '0.75rem', fontWeight: 400, minWidth: 50 }}>{ch.checks?.filter((x: any) => x.passed).length || 0}/{ch.checks?.length || 0}</span>
                <span className="kpi-target">{ch.allPassed ? <span className="badge badge-green">Ready</span> : <span className="badge badge-amber">In Progress</span>}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
