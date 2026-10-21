import { X } from 'lucide-react'
import { Search } from 'lucide-react'
import AppButton from './common/AppButton'
import SearchSelect from './SearchSelect'

export interface SearchValues { text: string; developer: string; consultant: string }
export const NO_SEARCH: SearchValues = { text: '', developer: '', consultant: '' }

/** One search box plus Developer / Consultant dropdowns. It narrows the list already on the screen as you type: nothing is asked of the server. */
export default function SearchFilters({ value, onChange, developers, consultants, resultText }: {
  value: SearchValues; onChange: (v: SearchValues) => void; developers: string[]; consultants: string[]; resultText?: string
}) {
  const used = !!(value.text || value.developer || value.consultant)
  return (
    <div className="card toolbar reveal-item" role="search" aria-label="Search">
      <div className="row wrap" style={{ gap: 10 }}>
        <div style={{ position: 'relative', flex: '1 1 320px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-tertiary)' }} />
          <input className="input" style={{ width: '100%', paddingLeft: 34 }} aria-label="Search" value={value.text} onChange={(e) => onChange({ ...value, text: e.target.value })}
            placeholder="Search by project, ref., Dev / DM plot no., substation or SCADA name…" />
        </div>
        <div style={{ flex: '0 1 220px' }}><SearchSelect label="Developer" placeholder="Developer" options={developers} value={value.developer} onChange={(x) => onChange({ ...value, developer: x })} /></div>
        <div style={{ flex: '0 1 220px' }}><SearchSelect label="Consultant" placeholder="Consultant" options={consultants} value={value.consultant} onChange={(x) => onChange({ ...value, consultant: x })} /></div>
        <AppButton variant="outlined" disabled={!used} startIcon={<X size={15} />} onClick={() => onChange(NO_SEARCH)}>Clear</AppButton>
      </div>
      {resultText && <div className="faint" style={{ fontSize: 12, marginTop: 8 }}>{resultText}</div>}
    </div>
  )
}
