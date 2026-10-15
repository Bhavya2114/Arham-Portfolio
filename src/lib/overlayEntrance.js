/**
 * Entrance sequence for the map's floating overlay (the campus card).
 *
 * Runs on every city selection — the first one from a state view and every direct city → city
 * switch — with the same 300 ms slide-up:
 * 1. 'reset'  — synchronously (before paint): the card jumps to its hidden position below the map
 *               edge with transitions disabled, so it never visibly slides *down* first.
 * 2. When ready — `waitFor(go)` calls `go` once the map has settled and any clearance pan has ended
 *    (or right away; a `go` during setup is moved to the next task so step 1 is committed first) —
 *    force a reflow so the hidden position is the transition's start, then
 * 3. 'enter'  — transitions back on; the card slides up into place.
 *
 * Returns a cancel function so a newer selection supersedes a pending entrance (no overlapping runs).
 * The scheduler is injectable so the sequence can be tested without a browser.
 */

export const OVERLAY_RESET = 'reset';
export const OVERLAY_ENTER = 'enter';

export const startOverlayEntrance = ({ setPhase, reflow, waitFor = null, schedule = setTimeout, cancel = clearTimeout }) => {
  let cancelled = false;
  let starting = true;
  let timer = null;
  setPhase(OVERLAY_RESET);
  const enter = () => {
    if (cancelled) return;
    cancelled = true; // enter once
    reflow?.();
    setPhase(OVERLAY_ENTER);
  };
  const go = () => {
    if (cancelled) return;
    if (starting) {
      // Called synchronously from setup: the 'reset' render is not committed yet, so wait a task.
      if (timer === null) timer = schedule(enter, 0);
    } else {
      enter();
    }
  };
  const stopWaiting = waitFor ? waitFor(go) : (go(), null);
  starting = false;
  return () => {
    cancelled = true;
    if (timer !== null) cancel(timer);
    stopWaiting?.();
  };
};
