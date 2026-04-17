export default function RSVPBadge({ status }) {
  const labels = { yes: '✓ Going', no: '✗ Declined', maybe: '? Maybe', pending: '… Pending' };
  return (
    <span className={`badge badge-${status}`}>
      {labels[status] || status}
    </span>
  );
}
