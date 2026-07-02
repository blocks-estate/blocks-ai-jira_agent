import { useState, useEffect } from 'react'
import { fetchJSON, websitesConversion } from '../../api'
import type { KpiMetric } from '../../api'
import { InlineStatusSelect } from '../../domains/common/InteractiveComponents'

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

const handoffStatusOptions = [
  { label: 'Completed', value: 'completed', color: 'var(--green)' },
  { label: 'In Progress', value: 'in-progress', color: 'var(--blue)' },
  { label: 'Failed', value: 'failed', color: 'var(--red)' },
  { label: 'Pending', value: 'pending', color: 'var(--amber)' },
]

export default function WebsitesConversionDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [kycHandoff, setKycHandoff] = useState<any>(null)
  const [funnelMetrics, setFunnelMetrics] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)
  const [expandedKyc, setExpandedKyc] = useState<Record<string, boolean>>({})
  const [kycStatuses, setKycStatuses] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([
      websitesConversion.kpis(),
      websitesConversion.kycHandoff(),
      websitesConversion.funnelMetrics(),
    ]).then(([k, kh, fm]) => {
      setKpis(k)
      setKycHandoff(kh)
      setFunnelMetrics(fm)
      const st: Record<string, string> = {}
      kh?.items?.forEach((h: any) => { st[h.id] = h.handoffStatus })
      setKycStatuses(st)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedKyc(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    setKycStatuses(prev => ({ ...prev, [id]: newStatus }))
  }

  if (loading) return <div className="loading">Loading Websites & Conversion Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>Websites & Conversion Dashboard</h1>
        <p>Developer and investor conversion funnel — account creation, KYC/AML handoff, and funnel metrics</p>
        <div className="meta-bar">
          <span><strong>KYC Handoffs:</strong> {kycHandoff?.totalItems || 0} records</span>
          <span><strong>Visitors:</strong> {funnelMetrics?.totalVisitors?.toLocaleString() || 0}</span>
          <span><strong>Signups:</strong> {funnelMetrics?.totalSignups?.toLocaleString() || 0}</span>
        </div>
      </div>

      {funnelMetrics && (
        <div className="grid-4">
          <div className="stat-card">
            <span className="stat-label">Total Visitors</span>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{funnelMetrics.totalVisitors?.toLocaleString()}</div>
            <div className="stat-target">All website visitors</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Signups</span>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{funnelMetrics.totalSignups?.toLocaleString()}</div>
            <div className="stat-target">Completed registrations</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">KYC Started</span>
            <div className="stat-value" style={{ color: 'var(--amber)' }}>{funnelMetrics.kycStarted?.toLocaleString()}</div>
            <div className="stat-target">Initiated KYC process</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">KYC Completed</span>
            <div className="stat-value" style={{ color: 'var(--blue)' }}>{funnelMetrics.kycCompleted?.toLocaleString()}</div>
            <div className="stat-target">KYC verified</div>
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
        {funnelMetrics?.conversionRates && (
          <div className="chart-container">
            <div className="chart-title">Conversion Rates</div>
            <div className="kpi-row">
              <span className="kpi-name" style={{ fontSize: '0.82rem' }}>Visitor → Signup</span>
              <span className="kpi-val" style={{ color: 'var(--green)', minWidth: 60 }}>{(funnelMetrics.conversionRates.visitorToSignup * 100).toFixed(1)}%</span>
            </div>
            <div className="kpi-row">
              <span className="kpi-name" style={{ fontSize: '0.82rem' }}>Signup → KYC Start</span>
              <span className="kpi-val" style={{ color: 'var(--amber)', minWidth: 60 }}>{(funnelMetrics.conversionRates.signupToKycStart * 100).toFixed(1)}%</span>
            </div>
            <div className="kpi-row">
              <span className="kpi-name" style={{ fontSize: '0.82rem' }}>KYC Start → Complete</span>
              <span className="kpi-val" style={{ color: 'var(--blue)', minWidth: 60 }}>{(funnelMetrics.conversionRates.kycStartToKycComplete * 100).toFixed(1)}%</span>
            </div>
            <div className="kpi-row">
              <span className="kpi-name" style={{ fontSize: '0.82rem' }}>KYC Complete → Activated</span>
              <span className="kpi-val" style={{ color: 'var(--primary)', minWidth: 60 }}>{(funnelMetrics.conversionRates.kycCompleteToActivated * 100).toFixed(1)}%</span>
            </div>
            <div className="kpi-row">
              <span className="kpi-name" style={{ fontSize: '0.82rem' }}>Handoff Failure Rate</span>
              <span className="kpi-val" style={{ color: (funnelMetrics.handoffFailureRate || 0) > 0.1 ? 'var(--red)' : 'var(--green)', minWidth: 60 }}>{(funnelMetrics.handoffFailureRate * 100).toFixed(1)}%</span>
            </div>
            <div className="kpi-row">
              <span className="kpi-name" style={{ fontSize: '0.82rem' }}>Avg Time to KYC</span>
              <span className="kpi-val" style={{ color: 'var(--text)', minWidth: 60 }}>{funnelMetrics.averageTimeToKycInitiationHours?.toFixed(1) || '-'}h</span>
            </div>
          </div>
        )}

        {funnelMetrics?.stageBreakdown && funnelMetrics.stageBreakdown.length > 0 && (
          <div className="chart-container">
            <div className="chart-title">Funnel Stage Breakdown</div>
            {funnelMetrics.stageBreakdown.map((s: any, i: number) => {
              const maxCount = Math.max(...funnelMetrics.stageBreakdown.map((x: any) => x.count))
              const pct = (s.count / maxCount) * 100
              return (
                <div key={s.id || i} className="funnel-bar">
                  <span className="funnel-label" style={{ minWidth: 120, fontSize: '0.75rem' }}>{s.name}</span>
                  <div className="funnel-track">
                    <div className="funnel-fill" style={{ width: `${pct}%`, background: i < 3 ? 'var(--primary)' : i < 6 ? 'var(--amber)' : 'var(--green)' }}>
                      <span className="funnel-count">{s.count.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="funnel-percent">{s.count > 0 && funnelMetrics.stageBreakdown[0].count > 0 ? ((s.count / funnelMetrics.stageBreakdown[0].count) * 100).toFixed(1) : '0'}%</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {kycHandoff?.items && kycHandoff.items.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>KYC Handoff Records ({kycHandoff.totalItems})</h3></div>
          <div className="card-body no-pad">
            {kycHandoff.items.slice(0, 10).map((h: any) => {
              const expanded = expandedKyc[h.id] || false
              return (
                <div key={h.id}>
                  <div
                    className="kpi-row"
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleExpand(h.id)}
                  >
                    <span className="kpi-name" style={{ fontSize: '0.78rem' }}>
                      <span style={{ marginRight: 6, fontSize: '0.7rem', color: 'var(--text2)' }}>
                        {expanded ? '▼' : '▶'}
                      </span>
                      User {h.userId?.slice(0, 8)}
                    </span>
                    <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 50 }}>{h.userType}</span>
                    <InlineStatusSelect
                      value={kycStatuses[h.id] || h.handoffStatus}
                      options={handoffStatusOptions}
                      onChange={(newStatus) => handleStatusChange(h.id, newStatus)}
                      entityId={h.id}
                      domainLabel="kyc"
                    />
                    <span className="kpi-target" style={{ fontSize: '0.72rem' }}>{h.provider}</span>
                  </div>
                  {expanded && (
                    <div style={{
                      padding: '8px 16px 10px 28px',
                      background: 'var(--surface2)',
                      borderBottom: '1px solid var(--border)',
                      fontSize: '0.78rem',
                      color: 'var(--text2)',
                    }}>
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                        {h.fullName && <span><strong>Name:</strong> {h.fullName}</span>}
                        {h.email && <span><strong>Email:</strong> {h.email}</span>}
                        {h.submittedAt && <span><strong>Submitted:</strong> {h.submittedAt}</span>}
                        {h.completedAt && <span><strong>Completed:</strong> {h.completedAt}</span>}
                        {h.reason && <span><strong>Reason:</strong> {h.reason}</span>}
                        {h.notes && <span><strong>Notes:</strong> {h.notes}</span>}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}