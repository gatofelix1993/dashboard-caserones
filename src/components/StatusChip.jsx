// ============================================================
// components/StatusChip.jsx — Chip de estado por color
// ============================================================
import { STATUS_LABELS, STATUS_ICONS } from '../utils/maintenance';

export default function StatusChip({ status }) {
  return (
    <span className={`status-chip chip-${status}`}>
      <i className={`bi ${STATUS_ICONS[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
