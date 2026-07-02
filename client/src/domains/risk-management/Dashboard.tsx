import { useState, useEffect } from 'react'
import { fetchJSON, riskManagement } from '../../api'
import type { KpiMetric } from '../../api'
import { AddModal, ActionBar, InlineStatusSelect } from '../common/InteractiveComponents'

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

function SeverityBadge({ severity }: { severity: string }) {
  const cls = severity === 'critical' ? 'badge-red' : severity === 'high' ? 'badge-amber' : severity === 'medium' ? 'badge-blue' : 'badge-green'
  return <span className={`badge ${cls}`}>{severity}</span>
}

const mitigationStatusOptions = [
  { label: 'Active', value: 'active', color: 'var(--amber)' },
  { label: 'In Progress', value: 'in-progress', color: 'var(--blue)' },
  { label: 'Completed', value: 'completed', color: 'var(--green)' },
  { label: 'Deferred', value: 'deferred', color: 'var(--text2)' },
]

export default function RiskManagementDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [mitigationRegister, setMitigationRegister] = useState<any>(null)
  const [marketOutlook, setMarketOutlook] = useState<any>(null)
  const [triggers, setTriggers] = useState<any>(null)
  const [talkingPoints, setTalkingPoints] = useState<any>(null)
  const [escalationGuides, setEscalationGuides] = useState<any>(null)
  const [faq, setFaq] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)
  const [showAddMitigation, setShowAddMitigation] = useState(false)
  const [savingMitigation, setSavingMitigation] = useState(false)
  const [showAddFaq, setShowAddFaq] = useState(false)
  const [savingFaq, setSavingFaq] = useState(false)
  const [mitigationStatusSaving, setMitigationStatusSaving] = useState<string | null>(null)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      riskManagement.kpis(),
      riskManagement.mitigationRegister(),
      riskManagement.marketOutlook(),
      riskManagement.triggers(),
      riskManagement.talkingPoints(),
      riskManagement.escalationGuides(),
      riskManagement.faq(),
    ]).then(([k, mr, mo, t, tp, eg, f]) => {
      setKpis(k)
      setMitigationRegister(mr)
      setMarketOutlook(mo)
      setTriggers(t)
      setTalkingPoints(tp)
      setEscalationGuides(eg)
      setFaq(f)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleAddMitigation = async (data: Record<string, any>) => {
    setSavingMitigation(true)
    try {
      const res = await riskManagement.mitigationRegisterCreate(data)
      if (!res.ok) throw new Error('Failed to create mitigation entry')
      await fetchAll()
    } finally {
      setSavingMitigation(false)
    }
  }

  const handleUpdateMitigationStatus = async (id: string, newStatus: string) => {
    setMitigationStatusSaving(id)
    try {
      const res = await riskManagement.mitigationRegisterUpdate(id, { status: newStatus })
      if (!res.ok) throw new Error('Failed to update status')
      await fetchAll()
    } finally {
      setMitigationStatusSaving(null)
    }
  }

  const handleAddFaq = async (data: Record<string, any>) => {
    setSavingFaq(true)
    try {
      const res = await riskManagement.faqCreate(data)
      if (!res.ok) throw new Error('Failed to create FAQ entry')
      await fetchAll()
    } finally {
      setSavingFaq(false)
    }
  }

  if (loading) return <div className="loading">Loading Risk Management Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>Risk Management Dashboard</h1>
        <p>GTM risk mitigations — market messaging, escalation guides, talking points, and trigger monitoring</p>
        <div className="meta-bar">
          <span><strong>Mitigations:</strong> {mitigationRegister?.length || 0} entries</span>
          <span><strong>Triggers:</strong> {triggers?.length || 0} monitored</span>
          <span><strong>FAQ:</strong> {faq?.length || 0} entries</span>
          <span><strong>Escalation Guides:</strong> {escalationGuides?.length || 0}</span>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${period === '90days' ? 'active' : ''}`} onClick={() => setPeriod('90days')}>90-Day View</button>
        <button className={`tab ${period === '12months' ? 'active' : ''}`} onClick={() => setPeriod('12months')}>12-Month View</button>
      </div>

      {kpiMetrics.length > 0 && (
        <div className="grid-4">{kpiMetrics.map((m: KpiMetric) => <KpiCard key={m.id} metric={m} />)}</div>
      )}

      {marketOutlook && (
        <div className="chart-container">
          <div className="chart-title">Market Outlook</div>
          <div style={{ fontSize: '0.85rem', marginBottom: 12 }}>{marketOutlook.summary}</div>
          {marketOutlook.keyIndicators && (
            <div className="grid-4" style={{ marginBottom: 0 }}>
              {marketOutlook.keyIndicators.map((ind: any, i: number) => (
                <div key={i} className="stat-card" style={{ padding: 12 }}>
                  <div className="stat-label">{ind.indicator}</div>
                  <div className="stat-value" style={{ fontSize: '1.2rem', color: ind.trend === 'rising' ? 'var(--green)' : ind.trend === 'declining' ? 'var(--red)' : 'var(--amber)' }}>{ind.currentValue}</div>
                  <div className="stat-target">
                    <span style={{ color: ind.trend === 'rising' ? 'var(--green)' : ind.trend === 'declining' ? 'var(--red)' : 'var(--amber)' }}>{ind.trend}</span>
                    {ind.alertTriggered && <span className="badge badge-red" style={{ marginLeft: 8 }}>Alert</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="dash-grid">
        {mitigationRegister && mitigationRegister.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3>Risk Mitigation Register ({mitigationRegister.length})</h3>
              <ActionBar onAdd={() => setShowAddMitigation(true)} addLabel="Add Mitigation" />
            </div>
            <div className="card-body no-pad">
              {mitigationRegister.map((r: any) => (
                <div key={r.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                  <span className="kpi-name" style={{ fontSize: '0.78rem' }}>{r.riskName}</span>
                  <SeverityBadge severity={r.severity} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text2)', minWidth: 60 }}>{r.likelihood}</span>
                  <InlineStatusSelect
                    value={r.status}
                    options={mitigationStatusOptions}
                    onChange={(newStatus) => handleUpdateMitigationStatus(r.id, newStatus)}
                    entityId={r.id}
                    domainLabel="mitigation"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {triggers && triggers.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Risk Triggers ({triggers.length})</h3></div>
            <div className="card-body no-pad">
              {triggers.map((t: any) => (
                <div key={t.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{t.name}</span>
                  <SeverityBadge severity={t.severity} />
                  <span className="kpi-target" style={{ fontSize: '0.72rem' }}>{t.condition}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="dash-grid">
        {talkingPoints && talkingPoints.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Talking Points ({talkingPoints.length})</h3></div>
            <div className="card-body no-pad">
              {talkingPoints.map((tp: any) => (
                <div key={tp.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{tp.topic}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text2)', minWidth: 80 }}>{tp.audience}</span>
                  <span className="kpi-target" style={{ fontSize: '0.72rem' }}>v{tp.version || 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {escalationGuides && escalationGuides.length > 0 && (
          <div className="chart-container">
            <div className="chart-title">Escalation Guides ({escalationGuides.length})</div>
            {escalationGuides.map((eg: any) => (
              <div key={eg.id} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{eg.scenario}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>SLA: {eg.responseSla}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 4 }}>{eg.trigger}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Risk FAQ ({faq?.length || 0})</h3>
          <ActionBar onAdd={() => setShowAddFaq(true)} addLabel="Add FAQ" />
        </div>
        <div className="card-body no-pad">
          {faq && faq.length > 0 ? faq.map((f: any) => (
            <div key={f.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
              <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{f.question}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text2)', minWidth: 70 }}>{f.audience}</span>
              <span className={`badge ${f.status === 'approved' ? 'badge-green' : f.status === 'draft' ? 'badge-amber' : 'badge-blue'}`}>{f.status}</span>
            </div>
          )) : (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text2)', fontSize: '0.82rem' }}>No FAQ entries yet. Click "+ Add FAQ" to create one.</div>
          )}
        </div>
      </div>

      {showAddMitigation && (
        <AddModal
          title="Add Mitigation Entry"
          fields={[
            { key: 'riskName', label: 'Risk Name', required: true, placeholder: 'e.g. Currency fluctuation risk' },
            { key: 'status', label: 'Status', type: 'select', required: true, options: [
              { label: 'Active', value: 'active' },
              { label: 'In Progress', value: 'in-progress' },
              { label: 'Completed', value: 'completed' },
              { label: 'Deferred', value: 'deferred' },
            ]},
            { key: 'owner', label: 'Owner', required: true, placeholder: 'e.g. John Smith' },
            { key: 'severity', label: 'Severity', type: 'select', required: true, options: [
              { label: 'Critical', value: 'critical' },
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' },
            ]},
            { key: 'mitigation', label: 'Mitigation Plan', type: 'textarea', required: true, placeholder: 'Describe the mitigation approach...' },
          ]}
          onSave={handleAddMitigation}
          onClose={() => setShowAddMitigation(false)}
          saving={savingMitigation}
        />
      )}

      {showAddFaq && (
        <AddModal
          title="Add FAQ Entry"
          fields={[
            { key: 'question', label: 'Question', required: true, placeholder: 'e.g. What happens if a trigger is breached?' },
            { key: 'answer', label: 'Answer', type: 'textarea', required: true, placeholder: 'Provide the answer...' },
            { key: 'audience', label: 'Audience', placeholder: 'e.g. All teams' },
            { key: 'status', label: 'Status', type: 'select', options: [
              { label: 'Draft', value: 'draft' },
              { label: 'Approved', value: 'approved' },
            ]},
          ]}
          onSave={handleAddFaq}
          onClose={() => setShowAddFaq(false)}
          saving={savingFaq}
        />
      )}
    </div>
  )
}