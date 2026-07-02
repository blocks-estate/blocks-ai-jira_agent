import { useState, useEffect } from 'react'
import { fetchJSON, contentSeo } from '../../api'
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

const contentAssetStatusOptions = [
  { label: 'Draft', value: 'draft', color: 'var(--blue)' },
  { label: 'In Review', value: 'in-review', color: 'var(--amber)' },
  { label: 'Approved', value: 'approved', color: 'var(--green)' },
  { label: 'Published', value: 'published', color: 'var(--text2)' },
  { label: 'Archived', value: 'archived', color: 'var(--red)' },
]

export default function ContentSeoDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [performance, setPerformance] = useState<any>(null)
  const [assets, setAssets] = useState<any>(null)
  const [glossary, setGlossary] = useState<any>(null)
  const [keywords, setKeywords] = useState<any>(null)
  const [rankings, setRankings] = useState<any>(null)
  const [localizationQueue, setLocalizationQueue] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      contentSeo.kpis(),
      contentSeo.performance(),
      contentSeo.assets(),
      contentSeo.glossary(),
      contentSeo.keywords(),
      contentSeo.rankings(),
      contentSeo.localizationQueue(),
    ]).then(([k, p, a, g, kw, r, lq]) => {
      setKpis(k)
      setPerformance(p)
      setAssets(a)
      setGlossary(g)
      setKeywords(kw)
      setRankings(r)
      setLocalizationQueue(lq)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleAddAsset = async (data: Record<string, any>) => {
    setSaving(true)
    try {
      const res = await contentSeo.assetsCreate(data)
      if (!res.ok) throw new Error('Failed to create asset')
      await loadAll()
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await contentSeo.assetsUpdate(id, { status: newStatus })
    if (!res.ok) throw new Error('Failed to update asset status')
    await loadAll()
  }

  if (loading) return <div className="loading">Loading Content & SEO Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>Content & SEO Dashboard</h1>
        <p>Content inventory, bilingual glossary, SEO keyword tracking, and Arabic localization</p>
        <div className="meta-bar">
          <span><strong>Assets:</strong> {assets?.totalItems || 0} total</span>
          <span><strong>Keywords:</strong> {keywords?.length || 0} tracked</span>
          <span><strong>Glossary:</strong> {glossary?.length || 0} entries</span>
          <span><strong>Localization:</strong> {localizationQueue?.length || 0} jobs</span>
        </div>
      </div>

      {performance && (
        <div className="grid-4">
          <div className="stat-card">
            <span className="stat-label">Page Views</span>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{performance.totalPageViews?.toLocaleString() || 0}</div>
            <div className="stat-target">Total across all content</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Avg Time on Page</span>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{performance.averageTimeOnPageSeconds || 0}s</div>
            <div className="stat-target">Engagement metric</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Bounce Rate</span>
            <div className="stat-value" style={{ color: (performance.bounceRate || 0) < 50 ? 'var(--green)' : 'var(--amber)' }}>{(performance.bounceRate || 0).toFixed(1)}%</div>
            <div className="stat-target">Target: &lt;50%</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Content Conversions</span>
            <div className="stat-value" style={{ color: 'var(--blue)' }}>{performance.contentAssistedConversions || 0}</div>
            <div className="stat-target">Assisted conversions</div>
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
        {keywords && keywords.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>SEO Keywords ({keywords.length})</h3></div>
            <div className="card-body no-pad">
              {keywords.map((kw: any) => (
                <div key={kw.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{kw.keyword}</span>
                  <span className="kpi-val" style={{ fontSize: '0.78rem', minWidth: 40, fontWeight: 400 }}>#{kw.currentRank}</span>
                  <span className="kpi-target" style={{ fontSize: '0.75rem' }}>
                    {kw.previousRank ? (kw.currentRank < kw.previousRank ? <span style={{ color: 'var(--green)' }}>↑ {kw.previousRank - kw.currentRank}</span> : kw.currentRank > kw.previousRank ? <span style={{ color: 'var(--red)' }}>↓ {kw.currentRank - kw.previousRank}</span> : '—') : '—'}
                  </span>
                  <span className="kpi-val" style={{ fontSize: '0.75rem', fontWeight: 400, minWidth: 60 }}>Vol: {kw.searchVolume?.toLocaleString() || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {performance?.performanceByCategory && performance.performanceByCategory.length > 0 && (
          <div className="chart-container">
            <div className="chart-title">Performance by Category</div>
            {performance.performanceByCategory.map((cat: any) => (
              <div key={cat.category} className="kpi-row">
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{cat.category}</span>
                <span className="kpi-val" style={{ fontSize: '0.78rem', fontWeight: 400, minWidth: 50 }}>{cat.views.toLocaleString()} views</span>
                <span className="kpi-target">{cat.downloads} downloads</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {assets && assets.totalItems > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Content Assets ({assets.totalItems})</h3>
            <ActionBar onAdd={() => setShowAddModal(true)} addLabel="Add Asset" />
          </div>
          <div className="card-body no-pad">
            {assets.items?.map((a: any) => (
              <div key={a.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{a.title || a.name}</span>
                <span className="kpi-val" style={{ fontSize: '0.75rem', fontWeight: 400, minWidth: 80 }}>{a.type || a.assetType}</span>
                <span className="kpi-target">
                  <InlineStatusSelect
                    value={a.status}
                    options={contentAssetStatusOptions}
                    onChange={(v) => handleStatusChange(a.id, v)}
                    entityId={a.id}
                    domainLabel="asset"
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {glossary && glossary.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Bilingual Glossary ({glossary.length} entries)</h3></div>
          <div className="card-body no-pad">
            {glossary.slice(0, 10).map((g: any) => (
              <div key={g.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{g.termEn}</span>
                <span className="kpi-val" style={{ fontSize: '0.78rem', fontWeight: 400, minWidth: 80 }}>{g.termAr}</span>
                <span className={`badge ${g.status === 'approved' ? 'badge-green' : g.status === 'needs-review' ? 'badge-amber' : 'badge-blue'}`}>{g.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {localizationQueue && localizationQueue.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Localization Queue ({localizationQueue.length} jobs)</h3></div>
          <div className="card-body no-pad">
            {localizationQueue.map((job: any) => (
              <div key={job.id} className="kpi-row">
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{job.targetLanguage}</span>
                <span className={`badge ${job.status === 'completed' ? 'badge-green' : job.status === 'in-progress' ? 'badge-blue' : job.status === 'qa-pending' ? 'badge-amber' : job.status === 'blocked' ? 'badge-red' : 'badge-blue'}`}>{job.status}</span>
                <span className="kpi-target">{job.reviewer ? `Reviewer: ${job.reviewer}` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddModal && (
        <AddModal
          title="Add Content Asset"
          fields={[
            { key: 'title', label: 'Title', required: true, placeholder: 'e.g. How to Invest in Dubai Real Estate' },
            { key: 'type', label: 'Type', type: 'select', required: true, options: [
              { label: 'Blog Post', value: 'blog-post' },
              { label: 'Whitepaper', value: 'whitepaper' },
              { label: 'Case Study', value: 'case-study' },
              { label: 'Infographic', value: 'infographic' },
              { label: 'Video', value: 'video' },
              { label: 'Landing Page', value: 'landing-page' },
            ]},
            { key: 'status', label: 'Status', type: 'select', options: [
              { label: 'Draft', value: 'draft' },
              { label: 'In Review', value: 'in-review' },
              { label: 'Approved', value: 'approved' },
              { label: 'Published', value: 'published' },
            ]},
            { key: 'language', label: 'Language', type: 'select', options: [
              { label: 'English', value: 'en' },
              { label: 'Arabic', value: 'ar' },
              { label: 'Bilingual', value: 'bilingual' },
            ]},
          ]}
          onSave={handleAddAsset}
          onClose={() => setShowAddModal(false)}
          saving={saving}
        />
      )}
    </div>
  )
}