import { useState, useEffect } from 'react'
import { fetchJSON, investorServicing } from '../../api'
import type { KpiMetric } from '../../api'
import { AddModal, ActionBar, InlineStatusSelect } from '../../domains/common/InteractiveComponents'

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

const ticketStatusOptions = [
  { label: 'Open', value: 'open', color: 'var(--blue)' },
  { label: 'In Progress', value: 'in-progress', color: 'var(--amber)' },
  { label: 'Resolved', value: 'resolved', color: 'var(--green)' },
  { label: 'Closed', value: 'closed', color: 'var(--text2)' },
]

export default function InvestorServicingDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [dashData, setDashData] = useState<any>(null)
  const [tickets, setTickets] = useState<any>(null)
  const [education, setEducation] = useState<any>(null)
  const [gateReview, setGateReview] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      investorServicing.kpis(),
      investorServicing.dashboard(),
      investorServicing.supportTickets(),
      investorServicing.educationCompletion(),
      investorServicing.sixMonthGate(),
    ]).then(([k, d, t, e, g]) => {
      setKpis(k)
      setDashData(d)
      setTickets(t)
      setEducation(e)
      setGateReview(g)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleAddTicket = async (data: Record<string, any>) => {
    setSaving(true)
    try {
      const res = await investorServicing.supportTicketsCreate(data)
      if (!res.ok) throw new Error('Failed to create ticket')
      await loadAll()
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await investorServicing.supportTicketsUpdate(id, { status: newStatus })
    if (!res.ok) throw new Error('Failed to update ticket status')
    await loadAll()
  }

  if (loading) return <div className="loading">Loading Investor Servicing Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>Investor Servicing Dashboard</h1>
        <p>Post-launch investor support, education completion, and six-month gate reviews</p>
        <div className="meta-bar">
          <span><strong>SLA:</strong> {dashData?.slaComplianceRate?.toFixed(1) || '-'}% compliance</span>
          <span><strong>Response:</strong> {dashData?.averageResponseTimeHours?.toFixed(1) || '-'}h avg</span>
          <span><strong>Escalations:</strong> {dashData?.openEscalations || 0} open</span>
        </div>
      </div>

      {dashData && (
        <div className="grid-4">
          <div className="stat-card">
            <span className="stat-label">Open Tickets</span>
            <div className="stat-value" style={{ color: 'var(--amber)' }}>{dashData.totalOpenTickets}</div>
            <div className="stat-target">Requiring attention</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">SLA Compliance</span>
            <div className="stat-value" style={{ color: dashData.slaComplianceRate >= 90 ? 'var(--green)' : 'var(--amber)' }}>{dashData.slaComplianceRate?.toFixed(1)}%</div>
            <div className="stat-target">Target: 95%</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Avg Response Time</span>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{dashData.averageResponseTimeHours?.toFixed(1)}h</div>
            <div className="stat-target">Hours to first response</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Education Completion</span>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{dashData.educationCompletionRate?.toFixed(1)}%</div>
            <div className="stat-target">Module completion rate</div>
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
        {tickets?.items && tickets.items.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3>Support Tickets ({tickets.totalItems})</h3>
              <ActionBar onAdd={() => setShowAddModal(true)} addLabel="Add Ticket" />
            </div>
            <div className="card-body no-pad">
              {tickets.items.slice(0, 8).map((t: any) => (
                <div key={t.id} className="kpi-row" style={{ cursor: 'pointer' }}>
                  <span className={`badge ${t.priority === 'critical' ? 'badge-red' : t.priority === 'high' ? 'badge-amber' : 'badge-blue'}`}>{t.priority}</span>
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{t.subject}</span>
                  <span className="kpi-val" style={{ fontSize: '0.75rem', fontWeight: 400, minWidth: 80 }}>{t.category}</span>
                  <span className="kpi-target">
                    <InlineStatusSelect
                      value={t.status}
                      options={ticketStatusOptions}
                      onChange={(v) => handleStatusChange(t.id, v)}
                      entityId={t.id}
                      domainLabel="ticket"
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Education Completion ({education.length})</h3></div>
            <div className="card-body no-pad">
              {education.map((e: any) => (
                <div key={e.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{e.moduleName}</span>
                  <span className="kpi-val" style={{ fontSize: '0.78rem', fontWeight: 400, minWidth: 50 }}>{e.score ? `${e.score}%` : '-'}</span>
                  <span className="kpi-target">{e.followUpRequired ? <span className="badge badge-red">Follow-up</span> : <span className="badge badge-green">Complete</span>}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {gateReview && (
        <div className="card">
          <div className="card-header"><h3>Six-Month Gate Review</h3></div>
          <div className="card-body">
            <div style={{ fontSize: '0.82rem', color: 'var(--text2)', marginBottom: 8 }}>Period ending: {gateReview.periodEnd}</div>
            <div style={{ fontSize: '0.85rem', marginBottom: 10 }}>{gateReview.executiveSummary}</div>
            {gateReview.topRisks && gateReview.topRisks.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--red)' }}>Top Risks:</strong>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: 4 }}>
                  {gateReview.topRisks.map((r: string, i: number) => (
                    <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text2)', padding: '2px 0' }}>• {r}</li>
                  ))}
                </ul>
              </div>
            )}
            {gateReview.latestDecision && (
              <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 10, marginTop: 8 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Decision: {gateReview.latestDecision.decision}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>{gateReview.latestDecision.rationale}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <AddModal
          title="Add Support Ticket"
          fields={[
            { key: 'subject', label: 'Subject', required: true, placeholder: 'e.g. KYC document upload failed' },
            { key: 'priority', label: 'Priority', type: 'select', required: true, options: [
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
              { label: 'Critical', value: 'critical' },
            ]},
            { key: 'category', label: 'Category', type: 'select', options: [
              { label: 'KYC', value: 'kyc' },
              { label: 'Onboarding', value: 'onboarding' },
              { label: 'Technical', value: 'technical' },
              { label: 'Billing', value: 'billing' },
              { label: 'General', value: 'general' },
            ]},
            { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the issue...' },
          ]}
          onSave={handleAddTicket}
          onClose={() => setShowAddModal(false)}
          saving={saving}
        />
      )}
    </div>
  )
}