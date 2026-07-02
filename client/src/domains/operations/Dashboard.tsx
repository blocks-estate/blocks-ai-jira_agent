import { useState, useEffect } from 'react'
import { fetchJSON, operations } from '../../api'
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

const vendorStatusOptions = [
  { label: 'Active', value: 'active', color: 'var(--green)' },
  { label: 'Pending', value: 'pending', color: 'var(--amber)' },
  { label: 'Inactive', value: 'inactive', color: 'var(--blue)' },
]

export default function OperationsDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [vendorRegistry, setVendorRegistry] = useState<any>(null)
  const [onboardingWorkflow, setOnboardingWorkflow] = useState<any>(null)
  const [escalationRules, setEscalationRules] = useState<any>(null)
  const [budgetModel, setBudgetModel] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)
  const [showVendorModal, setShowVendorModal] = useState(false)
  const [showEscalationModal, setShowEscalationModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [vendorStatuses, setVendorStatuses] = useState<Record<string, string>>({})

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
      const vs: Record<string, string> = {}
      vr?.forEach((v: any) => { vs[v.id] = v.status })
      setVendorStatuses(vs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const refetchVendors = () => {
    operations.vendorRegistry().then(vr => {
      setVendorRegistry(vr)
      const vs: Record<string, string> = {}
      vr?.forEach((v: any) => { vs[v.id] = v.status })
      setVendorStatuses(vs)
    })
  }

  const refetchEscalationRules = () => {
    operations.escalationRules().then(setEscalationRules)
  }

  const handleAddVendor = async (data: Record<string, any>) => {
    setSaving(true)
    try {
      await operations.vendorRegistryCreate(data)
      refetchVendors()
    } finally {
      setSaving(false)
    }
  }

  const handleAddEscalationRule = async (data: Record<string, any>) => {
    setSaving(true)
    try {
      await operations.escalationRulesCreate(data)
      refetchEscalationRules()
    } finally {
      setSaving(false)
    }
  }

  const handleVendorStatusChange = async (vendorId: string, newStatus: string) => {
    setVendorStatuses(prev => ({ ...prev, [vendorId]: newStatus }))
  }

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
            <div className="card-header">
              <h3>Vendor Registry ({vendorRegistry.length})</h3>
              <ActionBar onAdd={() => setShowVendorModal(true)} addLabel="Add Vendor" />
            </div>
            <div className="card-body no-pad">
              {vendorRegistry.map((v: any) => (
                <div key={v.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{v.legalName}</span>
                  <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 60 }}>{v.vendorType}</span>
                  <InlineStatusSelect
                    value={vendorStatuses[v.id] || v.status}
                    options={vendorStatusOptions}
                    onChange={(newStatus) => handleVendorStatusChange(v.id, newStatus)}
                    entityId={v.id}
                    domainLabel="vendor"
                  />
                  <span className="kpi-target">{v.owner}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {escalationRules && escalationRules.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3>Escalation Rules ({escalationRules.length})</h3>
              <ActionBar onAdd={() => setShowEscalationModal(true)} addLabel="Add Rule" />
            </div>
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

      {showVendorModal && (
        <AddModal
          title="Register Vendor"
          fields={[
            { key: 'legalName', label: 'Legal Name', type: 'text', required: true },
            { key: 'vendorType', label: 'Vendor Type', type: 'select', required: true, options: [
              { label: 'Technology', value: 'technology' },
              { label: 'Marketing', value: 'marketing' },
              { label: 'Consulting', value: 'consulting' },
              { label: 'Legal', value: 'legal' },
              { label: 'Compliance', value: 'compliance' },
              { label: 'Other', value: 'other' },
            ]},
            { key: 'owner', label: 'Owner', type: 'text', required: true, placeholder: 'e.g. john@example.com' },
            { key: 'status', label: 'Status', type: 'select', options: [
              { label: 'Pending', value: 'pending' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]},
          ]}
          onSave={handleAddVendor}
          onClose={() => setShowVendorModal(false)}
          saving={saving}
        />
      )}

      {showEscalationModal && (
        <AddModal
          title="Add Escalation Rule"
          fields={[
            { key: 'category', label: 'Category', type: 'text', required: true, placeholder: 'e.g. Compliance, Technical' },
            { key: 'condition', label: 'Condition', type: 'text', required: true, placeholder: 'e.g. SLA breach > 4h' },
            { key: 'decisionOwner', label: 'Decision Owner', type: 'text', required: true, placeholder: 'e.g. alice@example.com' },
            { key: 'escalationLevel', label: 'Escalation Level', type: 'select', options: [
              { label: 'Level 1', value: 'level-1' },
              { label: 'Level 2', value: 'level-2' },
              { label: 'Level 3', value: 'level-3' },
            ]},
          ]}
          onSave={handleAddEscalationRule}
          onClose={() => setShowEscalationModal(false)}
          saving={saving}
        />
      )}
    </div>
  )
}
