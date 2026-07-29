/**
 * One dashboard metric. The meter is a proportion of the tile's own domain, so
 * a tile with no data renders an empty track rather than a misleading bar.
 */
export function StatTile({ label, value, meta, tone, ratio, icon: Icon }) {
  const pct = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0)) * 100;

  return (
    <div className="pg-panel pg-stat" data-tone={tone}>
      <div className="pg-stat__head">
        <span className="pg-dot" aria-hidden="true" />
        <span className="pg-label">{label}</span>
        {Icon && (
          <span className="pg-stat__icon" aria-hidden="true">
            <Icon className="w-[15px] h-[15px]" />
          </span>
        )}
      </div>
      <p className="pg-stat__value pg-num">{value}</p>
      <p className="pg-stat__meta">{meta}</p>
      <div className="pg-stat__meter" aria-hidden="true">
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default StatTile;
