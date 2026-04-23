export default function StatCard({ label, value, icon, color, iconBg, change, changeLabel }) {
  return (
    <div
      className="stat-card"
      style={{ '--stat-color': color, '--stat-icon-bg': iconBg, '--stat-color-solid': color }}
    >
      <div className="stat-card-inner">
        <div className="stat-info">
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value ?? 0}</div>
          {change !== undefined && (
            <div className={`stat-change ${change < 0 ? 'negative' : ''}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% {changeLabel || 'vs last month'}
            </div>
          )}
        </div>
        <div className="stat-icon" style={{ boxShadow: `0 0 25px ${iconBg}`, border: `1px solid ${iconBg}` }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
