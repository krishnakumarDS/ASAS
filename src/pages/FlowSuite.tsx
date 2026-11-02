import { Fragment, useState } from 'react'
import { Play } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import { FileDrop } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { callApi } from '../data/api'
import { listFiles, setFileStatus, uploadFile } from '../data/files'
import { toSpFile } from '../data/spFiles'
import { ACTIONS, SAMPLES } from './flowActions'

type Status = 'ok' | 'fail' | 'skip'
interface Result { name: string; status: Status; ms: number; detail: string; raw?: string; files?: FileItem[] }
interface FileItem { type: 'folder' | 'file'; name: string; folder: string; modified: string; by: string; link: string; id: string; identifier: string; driveItemId: string }
/** A step returns a one-line detail, or the detail plus the full response to show underneath. */
type Out = string | { detail: string; raw: string; files?: FileItem[] }
type Suite = 'read' | 'crud' | 'upload' | 'list' | 'status' | 'inject'

/** Runs one step and records how long it took; a thrown error becomes a failed row. */
async function step(name: string, fn: () => Promise<Out>, expectError = false): Promise<Result> {
  const t0 = performance.now()
  try {
    const out = await fn()
    const detail = typeof out === 'string' ? out : out.detail
    const raw = typeof out === 'string' ? undefined : out.raw
    const files = typeof out === 'string' ? undefined : out.files
    const ms = Math.round(performance.now() - t0)
    return expectError ? { name, status: 'fail', ms, detail: 'Expected an error but the call succeeded.' } : { name, status: 'ok', ms, detail, raw, files }
  } catch (e) {
    const ms = Math.round(performance.now() - t0)
    const msg = e instanceof Error ? e.message : String(e)
    return expectError ? { name, status: 'ok', ms, detail: `Failed as expected: ${msg}` } : { name, status: 'fail', ms, detail: msg }
  }
}

const rowsOf = (sets: Record<string, unknown>[][]) => sets.map((s) => s.length).join(' + ') || '0'

/** Three one-click test runs: (1) every read action, (2) a create → get → update → hide → delete cycle on a throw-away developer, (3) a file upload to SharePoint, (4) a listing of that folder. */
export default function FlowSuite() {
  const { user } = useAuth()
  const me = user?.email || 'flow-test'
  const [running, setRunning] = useState<Suite | null>(null)
  const [results, setResults] = useState<Record<Suite, Result[]>>({ read: [], crud: [], upload: [], list: [], status: [], inject: [] })
  const [file, setFile] = useState<File | null>(null)

  const push = (suite: Suite, r: Result) => setResults((p) => ({ ...p, [suite]: [...p[suite], r] }))
  const begin = (suite: Suite) => { setRunning(suite); setResults((p) => ({ ...p, [suite]: [] })) }

  /** 1. Retrieve_SQL_Data: every read action with its sample JSON. IDs in the samples are placeholders, so "0 rows" is fine; only an error fails. "Nope" must error. */
  const runRead = async () => {
    begin('read')
    for (const a of ACTIONS) {
      push('read', await step(a, async () => rowsOf(await callApi(a, SAMPLES[a] as Record<string, unknown>)) + ' rows', a === 'Nope'))
    }
    setRunning(null)
  }

  /** 2. Retrieve_SQL_Data → sp_UC000420_Crud: writes one developer named "ZZ Flow Test …" and walks it through every single-row operation. It ends hidden (IsActive = 0), not removed. */
  const runCrud = async () => {
    begin('crud')
    const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
    let id = ''
    const created = await step('developer.create', async () => {
      const r = await callApi('developer.create', { developerName: `ZZ Flow Test ${stamp}`, developerURL: 'https://example.com', user: me })
      id = String(r[0]?.[0]?.Id ?? '')
      if (!id) throw new Error('No Id came back.')
      return `new Id ${id}`
    })
    push('crud', created)
    if (created.status === 'ok') {
      push('crud', await step('developer.get', async () => {
        const r = await callApi('developer.get', { id })
        if (!r[0]?.length) throw new Error('The new row was not found.')
        return `${r[0][0].DeveloperName}`
      }))
      push('crud', await step('developer.update', async () => { await callApi('developer.update', { id, developerURL: 'https://example.org', user: me }); return 'URL changed' }))
      push('crud', await step('developer.get (after update)', async () => {
        const r = await callApi('developer.get', { id })
        const url = String(r[0]?.[0]?.DeveloperURL ?? '')
        if (url !== 'https://example.org') throw new Error(`URL is "${url}", expected the updated value.`)
        return url
      }))
      push('crud', await step('developer.setActive (false)', async () => { await callApi('developer.setActive', { id, isActive: false, user: me }); return 'hidden' }))
      push('crud', await step('developer.setActive (true)', async () => { await callApi('developer.setActive', { id, isActive: true, user: me }); return 'shown again' }))
      push('crud', await step('developer.deleteMany', async () => { await callApi('developer.deleteMany', { ids: [id], user: me }); return 'hidden (soft delete)' }))
    } else {
      for (const n of ['get', 'update', 'get (after update)', 'setActive (false)', 'setActive (true)', 'deleteMany']) push('crud', { name: `developer.${n}`, status: 'skip', ms: 0, detail: 'Skipped: create failed.' })
    }
    push('crud', await step('developer.list', async () => rowsOf(await callApi('developer.list', { pageSize: 5, pageNumber: 1 })) + ' rows'))
    setRunning(null)
  }

  /** 3. Asas_file_Storage: uploads the chosen file (or a small generated text file) to the "_flow-test" folder of the SharePoint library. */
  const runUpload = async () => {
    begin('upload')
    const f = file ?? new File([`ASAS flow test\n${new Date().toISOString()}\nuser: ${me}\n`], `flow-test-${Date.now()}.txt`, { type: 'text/plain' })
    push('upload', await step(`Upload ${f.name}`, async () => { await uploadFile('_flow-test', f); return `${f.size} bytes sent to _flow-test/${f.name}` }))
    setRunning(null)
  }

  /** 4. ASAS_GetFiles: lists what the flow returns. Run the upload test first so _flow-test holds a file. */
  const runList = async () => {
    begin('list')
    push('list', await step('List files', async () => {
      const files = await listFiles('_flow-test')
      // "Get files (properties only)" returns every item of the library with SharePoint's braced keys ({Name}, {FullPath}, {IsFolder}, {Link}…).
      // Thumbnails and user details are left out so the output stays readable.
      const items: FileItem[] = files.map((f) => ({
        type: f['{IsFolder}'] ? 'folder' : 'file', name: String(f['{FilenameWithExtension}'] ?? f['{Name}'] ?? ''), folder: String(f['{Path}'] ?? '').replace(/\/$/, ''),
        modified: String(f.Modified ?? '').replace('T', ' ').replace('Z', ''), by: (f.Editor as { DisplayName?: string } | undefined)?.DisplayName ?? '', link: String(f['{Link}'] ?? ''),
        id: String(f.ID ?? ''), identifier: String(f['{Identifier}'] ?? ''), driveItemId: String(f['{DriveItemId}'] ?? ''),
      }))
      const folders = items.filter((i) => i.type === 'folder').length
      const inTest = items.filter((i) => i.folder.endsWith('/_flow-test')).length
      return { detail: `${items.length} items (${items.length - folders} files, ${folders} folders); ${inTest} inside _flow-test`, raw: JSON.stringify(items, null, 2), files: items }
    }))
    setRunning(null)
  }

  /** 5. ASAS_File_Activations: sets Status on the newest file in _flow-test to Active, then Inactive, and reads the list back after a short wait to confirm it was stored. */
  const runStatus = async () => {
    begin('status')
    const findTarget = async () => (await listFiles('_flow-test')).map(toSpFile).filter((f) => !f.isFolder && f.folder.endsWith('/_flow-test')).sort((a, b) => b.modified.localeCompare(a.modified))[0]
    let id = ''
    const found = await step('Find a file in _flow-test', async () => { const f = await findTarget(); if (!f) throw new Error('No file there: run test 3 first.'); id = f.id; return `${f.name} (item ${f.id}, status "${f.status || '—'}")` })
    push('status', found)
    if (found.status === 'ok') {
      for (const want of ['Active', 'Inactive'] as const) {
        push('status', await step(`Set Status = ${want}`, async () => {
          await setFileStatus(Number(id), want)
          await new Promise((r) => setTimeout(r, 4000)) // the flow does not answer, so give it a moment to finish
          const f = (await listFiles('_flow-test')).map(toSpFile).find((x) => x.id === id)
          if (!f) throw new Error('The file disappeared from the list.')
          if (f.status.toLowerCase() !== want.toLowerCase()) throw new Error(`The list says "${f.status || '(empty)'}" after 4 s: the flow may still be running, or the Status column does not exist in the library.`)
          return `read back as "${f.status}"`
        }))
      }
    }
    setRunning(null)
  }

  /** 6. SQL injection check (read-only): text that tries to break out of a query must be treated as plain text, so it matches nothing. A real name with an apostrophe must still work. */
  const runInject = async () => {
    begin('inject')
    const evil = "zzqq' OR 1=1 --"
    const count = async (action: string, params: Record<string, unknown>) => Number((await callApi(action, params))[0]?.[0]?.TotalCount ?? 0)
    push('inject', await step('SearchProjects_Count with projectName = ' + evil, async () => {
      const n = await count('SearchProjects_Count', { projectName: evil })
      if (n !== 0) throw new Error(`Returned ${n} rows: the text was run as SQL. Run sql/fix_sql_injection.sql.`)
      return '0 rows: treated as text'
    }))
    push('inject', await step('SearchPlots_Count with devPlotNum = ' + evil, async () => {
      const n = await count('SearchPlots_Count', { devPlotNum: evil })
      if (n !== 0) throw new Error(`Returned ${n} rows: the text was run as SQL. Run sql/fix_sql_injection.sql.`)
      return '0 rows: treated as text'
    }))
    push('inject', await step("ViewProjDetails with maalemDubaiRef = x' OR 1=1 --", async () => {
      const sets = await callApi('ViewProjDetails', { maalemDubaiRef: "x' OR 1=1 --" })
      const n = sets[0]?.length ?? 0
      if (n !== 0) throw new Error(`Returned ${n} project rows: the text was run as SQL. Run sql/fix_sql_injection.sql.`)
      return '0 rows: treated as text'
    }))
    push('inject', await step("A name with an apostrophe (O'Brien) still searches without an error", async () => `${await count('SearchProjects_Count', { projectName: "O'Brien" })} rows`))
    setRunning(null)
  }

  const summary = (rs: Result[]) => {
    const ok = rs.filter((r) => r.status === 'ok').length, bad = rs.filter((r) => r.status === 'fail').length
    return rs.length ? <span className={`badge ${bad ? 'badge-danger' : 'badge-success'}`}>{ok} passed{bad ? ` · ${bad} failed` : ''}</span> : null
  }
  const table = (rs: Result[]) => rs.length > 0 && (
    <div className="table-wrap" style={{ marginTop: 10 }}>
      <table className="table">
        <thead><tr><th>Step</th><th>Result</th><th>Time</th><th>Detail</th></tr></thead>
        <tbody>{rs.map((r) => (
          <Fragment key={r.name}>
          <tr>
            <td>{r.name}</td>
            <td><span className={`badge ${r.status === 'ok' ? 'badge-success' : r.status === 'fail' ? 'badge-danger' : 'badge-warning'}`}>{r.status === 'ok' ? 'Pass' : r.status === 'fail' ? 'Fail' : 'Skipped'}</span></td>
            <td>{r.ms} ms</td>
            <td style={{ wordBreak: 'break-word' }}>{r.detail}</td>
          </tr>
          {r.files && (
            <tr><td colSpan={4}>
              <table className="table">
                <thead><tr><th>Type</th><th>Name</th><th>Folder</th><th>Modified (UTC)</th><th>Modified by</th><th>ID</th><th>Identifier</th><th>Drive item ID</th></tr></thead>
                <tbody>{[...r.files].sort((x, y) => (x.folder + '/' + x.name).localeCompare(y.folder + '/' + y.name)).map((f, i) => (
                  <tr key={i}>
                    <td><span className={`badge ${f.type === 'folder' ? 'badge-warning' : 'badge-success'}`}>{f.type === 'folder' ? 'Folder' : 'File'}</span></td>
                    <td>{f.link ? <a href={f.link} target="_blank" rel="noreferrer">{f.name}</a> : f.name}</td>
                    <td style={{ wordBreak: 'break-word' }}>{f.folder}</td><td>{f.modified}</td><td>{f.by}</td>
                    <td>{f.id}</td><td style={{ wordBreak: 'break-all', fontSize: 12 }}>{f.identifier}</td><td style={{ wordBreak: 'break-all', fontSize: 12 }}>{f.driveItemId}</td>
                  </tr>
                ))}</tbody>
              </table>
            </td></tr>
          )}
          {r.raw && <tr><td colSpan={4}><details><summary className="muted" style={{ cursor: 'pointer', fontSize: 13 }}>Raw JSON</summary><pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, margin: '8px 0 0', maxHeight: 480, overflow: 'auto' }}>{r.raw}</pre></details></td></tr>}
          </Fragment>
        ))}</tbody>
      </table>
    </div>
  )

  const block = (suite: Suite, title: string, desc: string, run: () => void, extra?: React.ReactNode) => (
    <div style={{ marginBottom: 22 }}>
      <div className="row between wrap" style={{ gap: 10 }}>
        <div><b>{title}</b> {summary(results[suite])}<div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{desc}</div></div>
        <AppButton variant="outlined" loading={running === suite} disabled={running !== null} startIcon={<Play size={15} />} onClick={run}>Run</AppButton>
      </div>
      {extra}
      {table(results[suite])}
    </div>
  )

  return (
    <section className="card pad reveal-item" style={{ marginTop: 16 }}>
      <div className="section-title">Test all flows</div>
      {block('read', '1 · Retrieve_SQL_Data: read actions', `Runs all ${ACTIONS.length} Search*/View* actions with their sample JSON. Placeholder ids may return 0 rows; only errors fail. "Nope" must fail.`, runRead)}
      {block('crud', '2 · Retrieve_SQL_Data: create / update / delete', 'Creates a developer named "ZZ Flow Test …" and walks it through get, update, hide, show and delete. Writes real rows: the test row stays in the table, hidden.', runCrud)}
      {block('upload', '3 · Asas_file_Storage: SharePoint upload', 'Sends a file to the _flow-test folder. With no file chosen, a small generated .txt is used.', runUpload,
        <FileDrop label="Optional file" file={file} onFile={setFile} hint="Leave empty to upload a generated text file." />)}
      {block('list', '4 · ASAS_GetFiles: list SharePoint files', 'Lists what the flow returns (the whole library, with paths) so you can see the upload from test 3. Thumbnails and user details are trimmed.', runList)}
      {block('status', '5 · ASAS_File_Activations: file Active / Inactive', 'Sets the Status column of the newest file in _flow-test to Active, then Inactive, and reads it back to confirm. Run test 3 first.', runStatus)}
      {block('inject', '6 · SQL injection check (read-only)', "Sends text such as zzqq' OR 1=1 -- to three searches. It must match nothing. Fails until sql/fix_sql_injection.sql has been run in the database.", runInject)}
    </section>
  )
}
