/**
 * Is this click a tap on the empty map background (the ocean)?
 *
 * The background is the map viewport box, the <svg> itself, or the <svg>'s own wrapper — never a state
 * path, city marker, the floating card or a map control (those are other targets). A click already
 * cancelled by the viewport's drag guard (`defaultPrevented`) never counts, so a drag or pan is never
 * treated as a tap.
 */
export const isMapBackgroundTap = ({ target, viewport, svg, defaultPrevented = false }) =>
  !defaultPrevented && Boolean(target) && (target === viewport || (Boolean(svg) && (target === svg || target === svg.parentElement)));
