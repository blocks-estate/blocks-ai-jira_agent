import { useState, useEffect } from 'react'
import { fetchJSON, operations } from '../../api'
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

export default function OperationsDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [vendorRegistry, setVendorRegistry] = useState<any>(null)
  const [onboardingWorkflow, setOnboardingWorkflow] = useState<any>(null)
  const [escalationRules, setEscalationRules] = useState<any>(null)
  const [budgetModel, setBudgetModel] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      operations.kpis(),
      operations.vendorRegistry(),
      operations.onboardingWorkflow(),
      operations.escalationRules(),
      operations.budgetModel(),
    ]).then(([k, vr, ow, er, bm]) => {
      setKpis(k)
      setVendorRegistry(vr)
      setOnboardingWorkflow(ow)
      setEscalationRules(er)
      setBudgetModel(bm)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading Operations Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>Operations Dashboard</h1>
        <p>GTM operations — vendor registry, onboarding workflows, escalation rules, and budget model</p>
        <div className="meta-bar">
          <span><strong>Vendors:</strong> {vendorRegistry?.length || 0} registered</span>
          <span><strong>Onboarding:</strong> {onboardingWorkflow?.length || 0} workflows</span>
          <span><strong>Escalations:</strong> {escalationRules?.length || 0} rules</span>
        </div>
      </div>

      {budgetModel && (
        <div className="grid-4">
          <div className="stat-card">
            <span className="stat-label">Total Budget</span>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>AED {(budgetModel.totalBudget / 1000000).toFixed(0)}M</div>
            <div className="stat-target">GTM operating budget</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Spend to Date</span>
            <div className="stat-value" style={{ color: 'var(--amber)' }}>AED {(budgetModel.spendToDate / 1000000).toFixed(0)}M</div>
            <div className="stat-target">Utilized to date</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Personnel</span>
            <div className="stat-value" style={{ color: 'var(--green)' }}>AED {(budgetModel.personnelCosts / 1000000).toFixed(0)}M</div>
            <div className="stat-target">Personnel costs</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Tooling</span>
            <div className="stat-value" style={{ color: 'var(--blue)' }}>AED {(budgetModel.toolingCosts / 1000000).toFixed(0)}M</div>
            <div className="stat-target">Tooling costs</div>
          </div>
        </div>
      )}

      {budgetModel?.channelAllocation && (
        <div className="chart-container">
          <div className="chart-title">Channel Budget Allocation</div>
          <div className="grid-4" style={{ marginBottom: 0 }}>
            {Object.entries(budgetModel.channelAllocation).map(([channel, amount]: [string, any]) => (
              <div key={channel} className="stat-card" style={{ padding: 12 }}>
                <div className="stat-label">{channel}</div>
                <div className="stat-value" style={{ fontSize: '1.1rem' }}>AED {(amount / 1000000).toFixed(1)}M</div>
                <div className="progress"><div className="progress-fill" style={{ width: `${(amount / budgetModel.totalBudget) * 100}%`, background: 'var(--primary)' }} /></div>
              </div>
            ))}
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
        {vendorRegistry && vendorRegistry.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Vendor Registry ({vendorRegistry.length})</h3></div>
            <div className="card-body no-pad">
              {vendorRegistry.map((v: any) => (
                <div key={v.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{v.legalName}</span>
                  <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 60 }}>{v.vendorType}</span>
                  <span className={`badge ${v.status === 'active' ? 'badge-green' : v.status === 'pending' ? 'badge-amber' : 'badge-blue'}`}>{v.status}</span>
                  <span className="kpi-target">{v.owner}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {escalationRules && escalationRules.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Escalation Rules ({escalationRules.length})</h3></div>
            <div className="card-body no-pad">
              {escalationRules.map((rule: any) => (
                <div key={rule.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{rule.category}</span>
                  <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 80 }}>{rule.condition}</span>
                  <span className="kpi-target">{rule.decisionOwner}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {onboardingWorkflow && onboardingWorkflow.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Onboarding Workflows ({onboardingWorkflow.length})</h3></div>
          <div className="card-body no-pad">
            {onboardingWorkflow.map((w: any) => (
              <div key={w.id} className="kpi-row">
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>Vendor {w.vendorId?.slice(0, 8)}</span>
                <span className={`badge ${w.status === 'onboarded' ? 'badge-green' : w.status === 'contract-pending' || w.status === 'compliance-pending' ? 'badge-amber' : w.status === 'not-started' ? 'badge-blue' : 'badge-blue'}`}>{w.status}</span>
                <span className="kpi-target">{w.owner}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {budgetModel?.assumptions && budgetModel.assumptions.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Budget Assumptions</h3></div>
          <div className="card-body">
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {budgetModel.assumptions.map((a: string, i: number) => (
                <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text2)', padding: '3px 0', paddingLeft: 14, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--primary)' }}>→</span> {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}