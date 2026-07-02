import { useState, useEffect } from 'react'
import { fetchJSON, regionalExpansion } from '../../api'
import type { KpiMetric } from '../../api'
import { AddModal, ActionBar } from '../common/InteractiveComponents'

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

export default function RegionalExpansionDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [jurisdictions, setJurisdictions] = useState<any>(null)
  const [entryMemos, setEntryMemos] = useState<any>(null)
  const [claimReference, setClaimReference] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)
  const [showAddEntryMemo, setShowAddEntryMemo] = useState(false)
  const [savingEntryMemo, setSavingEntryMemo] = useState(false)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      regionalExpansion.kpis(),
      regionalExpansion.jurisdictions(),
      regionalExpansion.entryMemos(),
      regionalExpansion.claimReference(),
    ]).then(([k, j, em, cr]) => {
      setKpis(k)
      setJurisdictions(j)
      setEntryMemos(em)
      setClaimReference(cr)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleAddEntryMemo = async (data: Record<string, any>) => {
    setSavingEntryMemo(true)
    try {
      const res = await regionalExpansion.entryMemosCreate(data)
      if (!res.ok) throw new Error('Failed to create entry memo')
      await fetchAll()
    } finally {
      setSavingEntryMemo(false)
    }
  }

  if (loading) return <div className="loading">Loading Regional Expansion Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  const statusColor = (status: string) => {
    switch (status) {
      case 'entered': case 'ready-to-enter': return 'var(--green)'
      case 'phased-entry': case 'partner-led': return 'var(--amber)'
      case 'in-assessment': return 'var(--blue)'
      case 'on-hold': case 'not-assessed': return 'var(--text2)'
      default: return 'var(--text2)'
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Regional Expansion Dashboard</h1>
        <p>GCC-ready regional expansion — jurisdiction guardrails, market entry memos, and claim reference sheets</p>
        <div className="meta-bar">
          <span><strong>Jurisdictions:</strong> {jurisdictions?.length || 0} tracked</span>
          <span><strong>Entry Memos:</strong> {entryMemos?.length || 0}</span>
          <span><strong>Claim References:</strong> {claimReference?.length || 0}</span>
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
        {jurisdictions && jurisdictions.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Jurisdictions ({jurisdictions.length})</h3></div>
            <div className="card-body no-pad">
              {jurisdictions.map((j: any) => (
                <div key={j.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.85rem' }}>{j.name}</span>
                  <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 80 }}>{j.regulatoryBody || '-'}</span>
                  <span style={{ fontSize: '0.72rem', color: statusColor(j.marketEntryStatus), fontWeight: 600, minWidth: 80 }}>{j.marketEntryStatus?.replace(/-/g, ' ')}</span>
                  <span className="kpi-target">#{j.priority || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {entryMemos && entryMemos.length > 0 && (
          <div className="chart-container">
            <div className="chart-title">
              Market Entry Memos ({entryMemos.length})
              <div style={{ float: 'right' }}>
                <ActionBar onAdd={() => setShowAddEntryMemo(true)} addLabel="Add Entry Memo" />
              </div>
            </div>
            {entryMemos.map((m: any) => (
              <div key={m.id} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.title}</span>
                  <span className={`badge ${m.status === 'approved' ? 'badge-green' : m.status === 'reviewed' ? 'badge-blue' : 'badge-amber'}`}>{m.status}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: 4 }}>{m.recommendation}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {claimReference && claimReference.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Claim Reference Sheet ({claimReference.length})</h3></div>
          <div className="card-body no-pad">
            {claimReference.map((cr: any) => (
              <div key={cr.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{cr.claim}</span>
                <span className={`badge ${cr.allowed ? 'badge-green' : 'badge-red'}`}>{cr.allowed ? 'Allowed' : 'Restricted'}</span>
                {cr.condition && <span style={{ fontSize: '0.72rem', color: 'var(--text2)', minWidth: 100 }}>{cr.condition}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddEntryMemo && (
        <AddModal
          title="Add Entry Memo"
          fields={[
            { key: 'title', label: 'Title', required: true, placeholder: 'e.g. UAE Market Entry Assessment' },
            { key: 'jurisdiction', label: 'Jurisdiction', placeholder: 'e.g. UAE, Saudi Arabia' },
            { key: 'recommendation', label: 'Recommendation', type: 'textarea', required: true, placeholder: 'Market entry recommendation...' },
            { key: 'status', label: 'Status', type: 'select', options: [
              { label: 'Draft', value: 'draft' },
              { label: 'Reviewed', value: 'reviewed' },
              { label: 'Approved', value: 'approved' },
            ]},
          ]}
          onSave={handleAddEntryMemo}
          onClose={() => setShowAddEntryMemo(false)}
          saving={savingEntryMemo}
        />
      )}
    </div>
  )
}