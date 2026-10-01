import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './KPICard.module.css'

export type Tone = 'primary' | 'info' | 'warning' | 'success' | 'error' | 'secondary'
const toneVar: Record<Tone, string> = { primary: 'var(--accent-600)', secondary: 'var(--accent-500)', info: 'var(--color-info)', warning: 'var(--color-warning)', success: 'var(--color-success)', error: 'var(--color-danger)' }
interface Props { label: string; value: string; unit?: string; icon: ReactNode; color?: Tone; trend?: { dir: 'up' | 'down' | 'flat'; text: string; good?: boolean }; hint?: string; to?: string; loading?: boolean; index?: number }

export default function KPICard({ label, value, unit, icon, color = 'primary', trend, hint, to, loading, index = 0 }: Props) {
  const body = (
    <>
      <div className={styles.text}>
        <span className="eyebrow">{label}</span>
        {loading ? <div className="skeleton" style={{ width: 80, height: 40, marginTop: 6 }} /> : <div className={styles.value}>{value}{unit && <small>{unit}</small>}</div>}
        {(trend || hint) && (
          <div className={styles.meta}>
            {trend && (
              <span className={`${styles.trend} ${trend.dir === 'flat' ? styles.flat : trend.good ? styles.good : styles.bad}`}>
                {trend.dir === 'up' ? <ArrowUpRight size={13} /> : trend.dir === 'down' ? <ArrowDownRight size={13} /> : <Minus size={13} />}{trend.text}
              </span>
            )}
            {hint && <span className="faint">{hint}</span>}
          </div>
        )}
      </div>
      <span className={styles.icon}>{icon}</span>
    </>
  )
  const style = { ['--tone' as string]: toneVar[color], ['--index' as string]: index }
  return to
    ? <Link to={to} className={`card lift reveal-item ${styles.kpi}`} style={style}>{body}</Link>
    : <div className={`card lift reveal-item ${styles.kpi}`} style={style}>{body}</div>
}
