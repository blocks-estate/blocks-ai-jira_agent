import { useState, useEffect, useCallback } from 'react'
import { fetchJSON, salesOpsCrm } from '../../api'
import type { KpiMetric } from '../../api'
import { AddModal, ActionBar, DeleteConfirm, InlineStatusSelect } from '../../domains/common/InteractiveComponents'

const loiStageOptions = [
  { label: 'Draft', value: 'draft', color: 'var(--blue)' },
  { label: 'Negotiation', value: 'negotiation', color: 'var(--amber)' },
  { label: 'Signed', value: 'signed', color: 'var(--green)' },
  { label: 'Expired', value: 'expired', color: 'var(--red)' },
  { label: 'Not Proceeding', value: 'not-proceeding', color: 'var(--red)' },
]

const loiFields = [
  { key: 'counterpartyName', label: 'Counterparty Name', required: true },
  { key: 'counterpartyType', label: 'Counterparty Type', type: 'select' as const, options: [
    { label: 'Investor', value: 'investor' },
    { label: 'Partner', value: 'partner' },
    { label: 'Vendor', value: 'vendor' },
    { label: 'Other', value: 'other' },
  ]},
  { key: 'stage', label: 'Stage', type: 'select' as const, options: loiStageOptions.map(s => ({ label: s.label, value: s.value })) },
  { key: 'estimatedValue', label: 'Estimated Value (AED)', type: 'number' as const },
]

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

  const [showAddLoi, setShowAddLoi] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
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

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddLoi = async (data: Record<string, any>) => {
    setSaving(true)
    await fetch('/api/loi/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSaving(false)
    fetchData()
  }

  const handleStageChange = async (id: string, newStage: string) => {
    await fetch(`/api/loi/tracking/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    })
    fetchData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await fetch(`/api/loi/tracking/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleteTarget(null)
    fetchData()
  }

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
            <div className="card-header">
              <h3>LOI Records ({loiTracking.totalItems})</h3>
              <ActionBar onAdd={() => setShowAddLoi(true)} addLabel="LOI Record" />
            </div>
            <div className="card-body no-pad">
              {loiTracking.items.map((loi: any) => (
                <div key={loi.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{loi.counterpartyName}</span>
                  <InlineStatusSelect
                    value={loi.stage}
                    options={loiStageOptions}
                    onChange={(v) => handleStageChange(loi.id, v)}
                    entityId={loi.id}
                    domainLabel="LOI"
                  />
                  <span className="kpi-val" style={{ fontSize: '0.75rem', fontWeight: 400, minWidth: 70 }}>{loi.counterpartyType}</span>
                  <span className="kpi-target">{loi.estimatedValue ? `AED ${(loi.estimatedValue / 1000000).toFixed(0)}M` : '-'}</span>
                  <button
                    onClick={() => setDeleteTarget(loi)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--red)',
                      cursor: 'pointer', fontSize: '0.72rem', padding: '2px 6px',
                      marginLeft: 6, opacity: 0.7,
                    }}
                    title="Delete LOI record"
                  >✕</button>
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

      {showAddLoi && (
        <AddModal
          title="Add LOI Record"
          fields={loiFields}
          onSave={handleAddLoi}
          onClose={() => setShowAddLoi(false)}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          title="Delete LOI Record"
          message={`Are you sure you want to delete the LOI record for "${deleteTarget.counterpartyName}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
