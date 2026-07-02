import { useState, useEffect, useCallback } from 'react'
import { fetchJSON, prEvents } from '../../api'
import type { KpiMetric } from '../../api'
import { AddModal, ActionBar } from '../../domains/common/InteractiveComponents'

const mentionFields = [
  { key: 'title', label: 'Title', required: true, placeholder: 'Article or mention title' },
  { key: 'outlet', label: 'Outlet', required: true, placeholder: 'e.g. Bloomberg, TechCrunch' },
  { key: 'sentiment', label: 'Sentiment', type: 'select' as const, options: [
    { label: 'Positive', value: 'positive' },
    { label: 'Neutral', value: 'neutral' },
    { label: 'Negative', value: 'negative' },
  ]},
  { key: 'source', label: 'Source', placeholder: 'URL or publication name' },
]

const eventFields = [
  { key: 'name', label: 'Event Name', required: true },
  { key: 'eventType', label: 'Event Type', type: 'select' as const, options: [
    { label: 'Conference', value: 'conference' },
    { label: 'Roundtable', value: 'roundtable' },
    { label: 'Webinar', value: 'webinar' },
    { label: 'Breakfast Session', value: 'breakfast-session' },
    { label: 'Other', value: 'other' },
  ]},
  { key: 'date', label: 'Date', type: 'text' as const, placeholder: 'e.g. 2026-07-15' },
  { key: 'location', label: 'Location', placeholder: 'City or venue' },
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

export default function PrEventsDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [mentions, setMentions] = useState<any>(null)
  const [events, setEvents] = useState<any>(null)
  const [breakfastSessions, setBreakfastSessions] = useState<any>(null)
  const [period, setPeriod] = useState<'90days' | '12months'>('90days')
  const [loading, setLoading] = useState(true)

  const [showAddMention, setShowAddMention] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    Promise.all([
      prEvents.kpis(),
      prEvents.mentions(),
      prEvents.events(),
      prEvents.breakfastSessions(),
    ]).then(([k, m, e, bs]) => {
      setKpis(k)
      setMentions(m)
      setEvents(e)
      setBreakfastSessions(bs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddMention = async (data: Record<string, any>) => {
    setSaving(true)
    await fetch('/api/pr-events/mentions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSaving(false)
    fetchData()
  }

  const handleAddEvent = async (data: Record<string, any>) => {
    setSaving(true)
    await fetch('/api/pr-events/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSaving(false)
    fetchData()
  }

  if (loading) return <div className="loading">Loading PR & Events Dashboard...</div>

  const kpiMetrics = kpis?.[period]?.metrics || []

  return (
    <div>
      <div className="page-header">
        <h1>PR & Events Dashboard</h1>
        <p>PR, founder thought leadership, events, private roundtables, and share-of-voice tracking</p>
        <div className="meta-bar">
          <span><strong>Mentions:</strong> {mentions?.totalItems || 0} media mentions</span>
          <span><strong>Events:</strong> {events?.length || 0} events</span>
          <span><strong>Breakfast Sessions:</strong> {breakfastSessions?.length || 0}</span>
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
        {mentions?.items && mentions.items.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3>Media Mentions ({mentions.totalItems})</h3>
              <ActionBar onAdd={() => setShowAddMention(true)} addLabel="Mention" />
            </div>
            <div className="card-body no-pad">
              {mentions.items.map((m: any) => (
                <div key={m.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{m.title}</span>
                  <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 60 }}>{m.outlet}</span>
                  <span className={`badge ${m.sentiment === 'positive' ? 'badge-green' : m.sentiment === 'neutral' ? 'badge-blue' : 'badge-red'}`}>{m.sentiment}</span>
                  <span className="kpi-target" style={{ fontSize: '0.72rem' }}>{m.source}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {events && events.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3>Events ({events.length})</h3>
              <ActionBar onAdd={() => setShowAddEvent(true)} addLabel="Event" />
            </div>
            <div className="card-body no-pad">
              {events.map((e: any) => (
                <div key={e.id} className="kpi-row">
                  <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{e.name}</span>
                  <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 60 }}>{e.eventType}</span>
                  <span className="kpi-target">{e.date} · {e.location || ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {breakfastSessions && breakfastSessions.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Breakfast Sessions ({breakfastSessions.length})</h3></div>
          <div className="card-body no-pad">
            {breakfastSessions.map((s: any) => (
              <div key={s.id} className="kpi-row" style={{ flexWrap: 'wrap' }}>
                <span className="kpi-name" style={{ fontSize: '0.8rem' }}>{s.title}</span>
                <span className="kpi-val" style={{ fontSize: '0.72rem', fontWeight: 400, minWidth: 60 }}>{s.host}</span>
                <span className="kpi-target">{s.date}</span>
                {s.effectivenessScore && <span className="badge badge-blue">Score: {s.effectivenessScore}/5</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddMention && (
        <AddModal
          title="Add Media Mention"
          fields={mentionFields}
          onSave={handleAddMention}
          onClose={() => setShowAddMention(false)}
          saving={saving}
        />
      )}

      {showAddEvent && (
        <AddModal
          title="Add Event"
          fields={eventFields}
          onSave={handleAddEvent}
          onClose={() => setShowAddEvent(false)}
          saving={saving}
        />
      )}
    </div>
  )
}
