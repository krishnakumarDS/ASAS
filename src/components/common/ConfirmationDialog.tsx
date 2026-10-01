import { Modal } from '../ui'
import AppButton from './AppButton'

interface Props { open: boolean; title: string; message: string; confirmLabel?: string; destructive?: boolean; onConfirm: () => void; onClose: () => void }

export default function ConfirmationDialog({ open, title, message, confirmLabel = 'Confirm', destructive, onConfirm, onClose }: Props) {
  if (!open) return null
  return (
    <Modal title={title} size="sm" onClose={onClose} footer={
      <>
        <AppButton variant="outlined" onClick={onClose}>Cancel</AppButton>
        <AppButton variant="contained" color={destructive ? 'error' : 'primary'} onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</AppButton>
      </>
    }>
      <p className="muted">{message}</p>
    </Modal>
  )
}
