import { useState, useEffect } from 'react'
import { fetchJSON, productPlatform } from '../../api'
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

function GovernanceRuleRow({ rule }: { rule: any }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <div className="kpi-row" style={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text2)', width: 20, userSelect: 'none' }}>
          {expanded ? '▼' : '▶'}
        </span>
        <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{rule.topic}</span>
        <span className={`badge ${rule.dataClassification === 'public' ? 'badge-green' : rule.dataClassification === 'internal' ? 'badge-blue' : rule.dataClassification === 'confidential' ? 'badge-amber' : 'badge-red'}`}>{rule.dataClassification}</span>
        <span className="kpi-target">{rule.owner}</span>
      </div>
      {expanded && (
        <div style={{ background: 'var(--surface2)', padding: '10px 14px 10px 40px', margin: '0 0 2px', fontSize: '0.78rem', color: 'var(--text2)' }}>
          <div style={{ marginBottom: 4 }}><strong>Rule:</strong> {rule.rule || rule.description || '-'}</div>
          {rule.effectiveDate && <div style={{ marginBottom: 4 }}><strong>Effective:</strong> {rule.effectiveDate}</div>}
          {rule.reviewDate && <div><strong>Next Review:</strong> {rule.reviewDate}</div>}
        </div>
      )}
    </div>
  )
}

export default function ProductPlatformDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [apiUsage, setApiUsage] = useState<any>(null)
  const [integrationRoadmap, setIntegrationRoadmap] = useState<any>(null)
  const [governanceMatrix, setGovernanceMatrix] = useState<any>(null)
  const [integrations, setIntegrations] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productPlatform.kpis(),
      productPlatform.apiUsage(),
      productPlatform.integrationRoadmap(),
      productPlatform.governanceMatrix(),
      productPlatform.integrations(),
    ]).then(([k, au, ir, gm, i]) => {
      setKpis(k)
      setApiUsage(au)
      setIntegrationRoadmap(ir)
      setGovernanceMatrix(gm)
      setIntegrations(i)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading Product & Platform Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>Product & Platform Dashboard</h1>
        <p>Platform infrastructure — API usage, integration roadmap, governance, and integration tracking</p>
        <div className="meta-bar">
          <span><strong>API:</strong> {apiUsage?.totalRequests?.toLocaleString() || 0} requests · {apiUsage?.activeConsumers || 0} consumers</span>
          <span><strong>Phases:</strong> {integrationRoadmap?.length || 0} roadmap phases</span>
          <span><strong>Integrations:</strong> {integrations?.length || 0} total</span>
        </div>
      </div>

      {apiUsage && (
        <div className="grid-4">
          <div className="stat-card">
            <span className="stat-label">Total API Requests</span>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{apiUsage.totalRequests?.toLocaleString() || 0}</div>
            <div className="stat-target">All endpoints</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Avg Latency</span>
            <div className="stat-value" style={{ color: apiUsage.averageLatencyMs < 200 ? 'var(--green)' : 'var(--amber)' }}>{apiUsage.averageLatencyMs || 0}ms</div>
            <div className="stat-target">Target: &lt;200ms</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Error Rate</span>
            <div className="stat-value" style={{ color: (apiUsage.errorRate || 0) < 1 ? 'var(--green)' : 'var(--red)' }}>{(apiUsage.errorRate || 0).toFixed(2)}%</div>
            <div className="stat-target">Target: &lt;1%</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Active Consumers</span>
            <div className="stat-value" style={{ color: 'var(--blue)' }}>{apiUsage.activeConsumers || 0}</div>
            <div className="stat-target">API consumers</div>
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
        {integrationRoadmap && integrationRoadmap.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Integration Roadmap ({integrationRoadmap.length} phases)</h3></div>
            <div className="card-body no-pad">
              {integrationRoadmap.map((phase: any) => (
                <div key={phase.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{phase.name}</span>
                  <span className={`badge ${phase.status === 'completed' ? 'badge-green' : phase.status === 'active' ? 'badge-blue' : 'badge-amber'}`}>{phase.status}</span>
                  <span className="kpi-target" style={{ fontSize: '0.72rem' }}>{phase.targetDate || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {integrations && integrations.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Platform Integrations ({integrations.length})</h3></div>
            <div className="card-body no-pad">
              {integrations.map((int: any) => (
                <div key={int.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{int.name}</span>
                  <span className={`badge ${int.status === 'live' ? 'badge-green' : int.status === 'beta' ? 'badge-blue' : int.status === 'in-development' ? 'badge-amber' : int.status === 'deprecated' ? 'badge-red' : 'badge-blue'}`}>{int.status}</span>
                  <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 60 }}>{int.type}</span>
                  <span className="kpi-target">{int.owner}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {governanceMatrix && governanceMatrix.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Governance Rules ({governanceMatrix.length})</h3></div>
          <div className="card-body no-pad">
            {governanceMatrix.map((rule: any) => (
              <GovernanceRuleRow key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}