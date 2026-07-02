import { useState, ReactNode } from 'react'

// ─── Modal Overlay ──────────────────────────────────────────────────────────
function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius)',
        width: 480, maxWidth: '90vw', maxHeight: '80vh', overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', borderBottom: '1px solid var(--border)',
        }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text2)',
            cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1,
          }}>✕</button>
        </div>
        <div style={{ padding: '14px 18px' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── Field Builder ───────────────────────────────────────────────────────────
interface FieldDef {
  key: string
  label: string
  type?: 'text' | 'number' | 'select' | 'textarea'
  options?: { label: string; value: string }[]
  required?: boolean
  placeholder?: string
}

function renderFields(fields: FieldDef[], form: Record<string, any>, setForm: (f: Record<string, any>) => void) {
  return fields.map(f => {
    const val = form[f.key] ?? ''
    const onChange = (v: string) => setForm({ ...form, [f.key]: v })
    return (
      <div key={f.key} style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text2)', marginBottom: 4 }}>
          {f.label}{f.required ? ' *' : ''}
        </label>
        {f.type === 'select' ? (
          <select value={val} onChange={e => onChange(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: '0.82rem' }}>
            <option value="">Select...</option>
            {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : f.type === 'textarea' ? (
          <textarea value={val} onChange={e => onChange(e.target.value)}
            placeholder={f.placeholder} rows={3}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: '0.82rem', resize: 'vertical' }} />
        ) : (
          <input value={val} onChange={e => onChange(e.target.value)}
            placeholder={f.placeholder}
            type={f.type === 'number' ? 'number' : 'text'}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: '0.82rem' }} />
        )}
      </div>
    )
  })
}

// ─── Add Modal ──────────────────────────────────────────────────────────────
export function AddModal({
  title, fields, onSave, onClose, saving,
}: {
  title: string
  fields: FieldDef[]
  onSave: (data: Record<string, any>) => Promise<void>
  onClose: () => void
  saving?: boolean
}) {
  const [form, setForm] = useState<Record<string, any>>({})
  const [error, setError] = useState('')

  const handleSave = async () => {
    const missing = fields.filter(f => f.required && !form[f.key])
    if (missing.length) { setError(`Required: ${missing.map(f => f.label).join(', ')}`); return }
    setError('')
    try { await onSave(form); onClose() }
    catch (e: any) { setError(e.message || 'Save failed') }
  }

  return (
    <Modal title={title} onClose={onClose}>
      {renderFields(fields, form, setForm)}
      {error && <div style={{ color: 'var(--red)', fontSize: '0.78rem', marginBottom: 10 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
        <button onClick={onClose} className="btn btn-secondary" style={{
          padding: '7px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.82rem',
        }}>Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{
          padding: '7px 16px', borderRadius: 'var(--radius)', border: 'none',
          background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: '0.82rem',
          opacity: saving ? 0.6 : 1,
        }}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </Modal>
  )
}

// ─── Edit Modal ─────────────────────────────────────────────────────────────
export function EditModal({
  title, fields, initial, onSave, onClose, saving,
}: {
  title: string
  fields: FieldDef[]
  initial: Record<string, any>
  onSave: (data: Record<string, any>) => Promise<void>
  onClose: () => void
  saving?: boolean
}) {
  const [form, setForm] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {}
    fields.forEach(f => { init[f.key] = initial[f.key] ?? '' })
    return init
  })
  const [error, setError] = useState('')

  const handleSave = async () => {
    const missing = fields.filter(f => f.required && !form[f.key])
    if (missing.length) { setError(`Required: ${missing.map(f => f.label).join(', ')}`); return }
    setError('')
    try { await onSave(form); onClose() }
    catch (e: any) { setError(e.message || 'Save failed') }
  }

  return (
    <Modal title={title} onClose={onClose}>
      {renderFields(fields, form, setForm)}
      {error && <div style={{ color: 'var(--red)', fontSize: '0.78rem', marginBottom: 10 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
        <button onClick={onClose} style={{
          padding: '7px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.82rem',
        }}>Cancel</button>
        <button onClick={handleSave} disabled={saving} style={{
          padding: '7px 16px', borderRadius: 'var(--radius)', border: 'none',
          background: 'var(--amber)', color: '#fff', cursor: 'pointer', fontSize: '0.82rem',
          opacity: saving ? 0.6 : 1,
        }}>{saving ? 'Saving...' : 'Update'}</button>
      </div>
    </Modal>
  )
}

// ─── Delete Confirm ─────────────────────────────────────────────────────────
export function DeleteConfirm({
  title, message, onConfirm, onClose, deleting,
}: {
  title: string
  message: string
  onConfirm: () => Promise<void>
  onClose: () => void
  deleting?: boolean
}) {
  const handleDelete = async () => {
    try { await onConfirm(); onClose() }
    catch (e: any) { /* error handled by parent */ }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ fontSize: '0.85rem', color: 'var(--text2)', margin: '8px 0 16px' }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{
          padding: '7px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.82rem',
        }}>Cancel</button>
        <button onClick={handleDelete} disabled={deleting} style={{
          padding: '7px 16px', borderRadius: 'var(--radius)', border: 'none',
          background: 'var(--red)', color: '#fff', cursor: 'pointer', fontSize: '0.82rem',
          opacity: deleting ? 0.6 : 1,
        }}>{deleting ? 'Deleting...' : 'Delete'}</button>
      </div>
    </Modal>
  )
}

// ─── Action Button Bar ──────────────────────────────────────────────────────
export function ActionBar({ onAdd, addLabel }: { onAdd: () => void; addLabel?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
      <button onClick={onAdd} style={{
        padding: '6px 14px', borderRadius: 'var(--radius)', border: 'none',
        background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: '0.8rem',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> {addLabel || 'Add'}
      </button>
    </div>
  )
}

// ─── Inline Status Select ───────────────────────────────────────────────────
export function InlineStatusSelect({
  value, options, onChange, entityId, domainLabel,
}: {
  value: string
  options: { label: string; value: string; color: string }[]
  onChange: (newStatus: string) => void
  entityId: string
  domainLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const current = options.find(o => o.value === value) || options[0]

  const handleSelect = async (v: string) => {
    setOpen(false)
    setSaving(true)
    try {
      await onChange(v)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(!open)} disabled={saving} style={{
        padding: '2px 8px', borderRadius: 'var(--radius)', border: 'none',
        background: current?.color === 'var(--green)' ? 'rgba(0,200,83,0.15)' : current?.color === 'var(--amber)' ? 'rgba(255,193,7,0.15)' : current?.color === 'var(--red)' ? 'rgba(244,67,54,0.15)' : 'rgba(33,150,243,0.15)',
        color: current?.color, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
        opacity: saving ? 0.6 : 1,
      }}>
        {saving ? '...' : current?.label || value}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, zIndex: 50, marginTop: 4,
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          minWidth: 140, overflow: 'hidden',
        }}>
          {options.map(o => (
            <div key={o.value} onClick={() => handleSelect(o.value)} style={{
              padding: '6px 12px', cursor: 'pointer', fontSize: '0.78rem',
              color: o.value === value ? o.color : 'var(--text)',
              background: o.value === value ? 'var(--surface2)' : 'transparent',
            }}>{o.label}</div>
          ))}
        </div>
      )}
    </div>
  )
}