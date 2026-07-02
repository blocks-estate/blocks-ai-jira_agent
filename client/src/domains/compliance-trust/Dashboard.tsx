import { useState, useEffect } from 'react'
import { fetchJSON, complianceTrust } from '../../api'
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

const claimCategoryOptions = [
  { label: 'Approved', value: 'approved', color: 'var(--green)' },
  { label: 'Conditional', value: 'conditional', color: 'var(--amber)' },
  { label: 'Prohibited', value: 'prohibited', color: 'var(--red)' },
]

export default function ComplianceTrustDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [avoidList, setAvoidList] = useState<any>(null)
  const [claimMatrix, setClaimMatrix] = useState<any>(null)
  const [checklists, setChecklists] = useState<any>(null)
  const [riskLanguage, setRiskLanguage] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      complianceTrust.kpis(),
      complianceTrust.avoidList(),
      complianceTrust.claimMatrix(),
      complianceTrust.checklists(),
      complianceTrust.riskLanguage(),
    ]).then(([k, al, cm, ch, rl]) => {
      setKpis(k)
      setAvoidList(al)
      setClaimMatrix(cm)
      setChecklists(ch)
      setRiskLanguage(rl)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleAddClaimEntry = async (data: Record<string, any>) => {
    setSaving(true)
    try {
      const res = await complianceTrust.claimMatrixCreate(data)
      if (!res.ok) throw new Error('Failed to create claim matrix entry')
      await loadAll()
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await complianceTrust.claimMatrixUpdate(id, { category: newStatus })
    if (!res.ok) throw new Error('Failed to update claim matrix entry')
    await loadAll()
  }

  if (loading) return <div className="loading">Loading Compliance & Trust Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  const riskColor = (level: string) => {
    switch (level) {
      case 'investment-promise': case 'security-guarantee': return 'var(--red)'
      case 'liquidity-promise': case 'regulatory-implication': return 'var(--amber)'
      case 'eligibility-overreach': case 'urgency-trading': return 'var(--blue)'
      default: return 'var(--text2)'
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Compliance & Trust Dashboard</h1>
        <p>Compliance-safe GTM claim guardrails — avoid list, claim matrix, risk language, and copy review</p>
        <div className="meta-bar">
          <span><strong>Avoid List:</strong> {avoidList?.length || 0} prohibited phrases</span>
          <span><strong>Claim Matrix:</strong> {claimMatrix?.length || 0} entries</span>
          <span><strong>Risk Modules:</strong> {riskLanguage?.length || 0}</span>
          <span><strong>Checklists:</strong> {checklists?.length || 0}</span>
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
        {avoidList && avoidList.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Avoid List ({avoidList.length})</h3></div>
            <div className="card-body no-pad">
              {avoidList.map((a: any) => (
                <div key={a.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{a.phrase}</span>
                  <span style={{ fontSize: '0.72rem', color: riskColor(a.riskType), fontWeight: 600, minWidth: 100 }}>{a.riskType.replace(/-/g, ' ')}</span>
                  <span className="kpi-target" style={{ fontSize: '0.72rem' }}>{a.reviewerSignOff ? <span className="badge badge-green">Signed</span> : <span className="badge badge-amber">Pending</span>}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {claimMatrix && claimMatrix.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3>Claim Matrix ({claimMatrix.length})</h3>
              <ActionBar onAdd={() => setShowAddModal(true)} addLabel="Add Entry" />
            </div>
            <div className="card-body no-pad">
              {claimMatrix.map((c: any) => (
                <div key={c.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                  <span className="kpi-name" style={{ fontSize: '0.78rem' }}>{c.claim}</span>
                  <span className="kpi-target" style={{ fontSize: '0.72rem' }}>
                    <InlineStatusSelect
                      value={c.category}
                      options={claimCategoryOptions}
                      onChange={(v) => handleStatusChange(c.id, v)}
                      entityId={c.id}
                      domainLabel="claim"
                    />
                  </span>
                  <span className="kpi-target" style={{ fontSize: '0.72rem', marginLeft: 8 }}>{c.approvalStatus}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {checklists && checklists.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Copy Review Checklists ({checklists.length})</h3></div>
          <div className="card-body no-pad">
            {checklists.map((ch: any) => (
              <div key={ch.id} className="kpi-row">
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{ch.campaignName}</span>
                <span className="kpi-val" style={{ fontSize: '0.75rem', fontWeight: 400, minWidth: 80 }}>{ch.assetType}</span>
                <span className="kpi-target">{ch.items.filter((i: any) => i.passed).length}/{ch.items.length} passed</span>
                <span className={`badge ${ch.status === 'completed' ? 'badge-green' : ch.status === 'active' ? 'badge-blue' : 'badge-amber'}`}>{ch.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {riskLanguage && riskLanguage.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Risk Language Modules ({riskLanguage.length})</h3></div>
          <div className="card-body">
            <div className="grid-4">
              {riskLanguage.map((m: any) => (
                <div key={m.id} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 4 }}>
                    <span>v{m.version} · </span>
                    <span className={`badge ${m.approvalStatus === 'approved' ? 'badge-green' : m.approvalStatus === 'in-review' ? 'badge-amber' : m.approvalStatus === 'draft' ? 'badge-blue' : 'badge-red'}`} style={{ fontSize: '0.68rem' }}>{m.approvalStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddModal
          title="Add Claim Matrix Entry"
          fields={[
            { key: 'claim', label: 'Claim', required: true, placeholder: 'e.g. "Top 10 real estate platform in UAE"' },
            { key: 'category', label: 'Category', type: 'select', required: true, options: [
              { label: 'Approved', value: 'approved' },
              { label: 'Conditional', value: 'conditional' },
              { label: 'Prohibited', value: 'prohibited' },
            ]},
            { key: 'riskLevel', label: 'Risk Level', type: 'select', options: [
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
            ]},
            { key: 'approvalStatus', label: 'Approval Status', type: 'select', options: [
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
            ]},
          ]}
          onSave={handleAddClaimEntry}
          onClose={() => setShowAddModal(false)}
          saving={saving}
        />
      )}
    </div>
  )
}