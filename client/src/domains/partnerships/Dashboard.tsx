import { useState, useEffect, useCallback } from 'react'
import { fetchJSON, partnerships } from '../../api'
import type { KpiMetric } from '../../api'
import { InlineStatusSelect } from '../../domains/common/InteractiveComponents'

const pipelineStageOptions = [
  { label: 'In Discussion', value: 'in-discussion', color: 'var(--amber)' },
  { label: 'Due Diligence', value: 'due-diligence', color: 'var(--blue)' },
  { label: 'Negotiating', value: 'negotiating', color: 'var(--primary)' },
  { label: 'Onboarded', value: 'onboarded', color: 'var(--green)' },
  { label: 'Not Proceeding', value: 'not-proceeding', color: 'var(--red)' },
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

export default function PartnershipsDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [pipeline, setPipeline] = useState<any>(null)
  const [diligence, setDiligence] = useState<any>(null)
  const [useCaseMapping, setUseCaseMapping] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(() => {
    setLoading(true)
    Promise.all([
      partnerships.kpis(),
      partnerships.pipeline(),
      partnerships.diligence(),
      partnerships.useCaseMapping(),
    ]).then(([k, p, d, ucm]) => {
      setKpis(k)
      setPipeline(p)
      setDiligence(d)
      setUseCaseMapping(ucm)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStageChange = async (id: string, newStage: string) => {
    await fetch(`/api/partnerships/pipeline/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    })
    fetchData()
  }

  if (loading) return <div className="loading">Loading Partnerships Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>Partnerships Dashboard</h1>
        <p>Partner recruitment and relationship pipeline — due diligence, use-case mapping, and outreach tracking</p>
        <div className="meta-bar">
          <span><strong>Pipeline:</strong> {pipeline?.totalItems || 0} entries</span>
          <span><strong>Diligence:</strong> {diligence?.length || 0} records</span>
          <span><strong>Use Cases:</strong> {useCaseMapping?.length || 0} mappings</span>
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
        {pipeline?.items && pipeline.items.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Partner Pipeline ({pipeline.totalItems})</h3></div>
            <div className="card-body no-pad">
              {pipeline.items.map((p: any) => (
                <div key={p.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.82rem' }}>{p.partnerName}</span>
                  <InlineStatusSelect
                    value={p.stage}
                    options={pipelineStageOptions}
                    onChange={(v) => handleStageChange(p.id, v)}
                    entityId={p.id}
                    domainLabel="partner pipeline"
                  />
                  <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 70 }}>{p.partnerType}</span>
                  <span className="kpi-target">{p.owner}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {diligence && diligence.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Due Diligence ({diligence.length})</h3></div>
            <div className="card-body no-pad">
              {diligence.map((d: any) => (
                <div key={d.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>Partner {d.partnerId?.slice(0, 8)}</span>
                  <span className={`badge ${d.status === 'cleared' ? 'badge-green' : d.status === 'in-progress' ? 'badge-blue' : d.status === 'flagged' ? 'badge-red' : 'badge-amber'}`}>{d.status}</span>
                  <span className="kpi-target" style={{ fontSize: '0.72rem' }}>{d.reviewer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {useCaseMapping && useCaseMapping.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Use Case Mappings ({useCaseMapping.length})</h3></div>
          <div className="card-body no-pad">
            {useCaseMapping.map((uc: any) => (
              <div key={uc.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{uc.useCase}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text2)', minWidth: 60 }}>
                  {uc.partnerOwned ? <span className="badge badge-blue">Partner</span> : ''}
                  {uc.blocksOwned ? <span className="badge badge-green" style={{ marginLeft: 4 }}>Blocks</span> : ''}
                </span>
                <span className="kpi-target">{uc.slaExpectation || '-'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
