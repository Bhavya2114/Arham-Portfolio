import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';

/**
 * Our Work sheet levels in the browser history, so the phone's back button / gesture steps back one
 * level at a time (photo viewer → project → group list → city summary → sheet closed) and never leaves
 * /our-work while a level is open.
 *
 * Every level is a history entry for the SAME URL (react-router push with state { ourWorkLevel: n }):
 * no reload, no route change, the page and the map stay mounted and the map never moves.
 * - Opening level(s) in the page pushes one entry per level.
 * - Closing level(s) in the page (back links, Escape, ✕, choosing another state…) goes back by the same
 *   number of entries, so history and the page stay in step.
 * - The browser's back (or forward) button: the entry's level is compared with the page's and the page
 *   steps back that many levels (`stepBack(n)`). Going forward into a level that is no longer open
 *   is undone.
 * The browser's own scroll restoration is turned off on this page, so going back never jumps the page.
 */
export const historyDepth = (nav, viewerOpen = false) =>
  (nav.city ? 1 : 0) + (nav.groupId ? 1 : 0) + (nav.projectId || nav.clusterIds ? 1 : 0) + (viewerOpen ? 1 : 0);

const entryLevel = (location) => (Number.isInteger(location.state?.ourWorkLevel) ? location.state.ourWorkLevel : 0);

export const useSheetHistory = (depth, stepBack) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const here = `${location.pathname}${location.search}`;
  const historyLevel = useRef(0); // the level of the history entry we are on
  const depthRef = useRef(depth);
  depthRef.current = depth;
  const stepBackRef = useRef(stepBack);
  stepBackRef.current = stepBack;

  // Arriving on the page (also after a reload in the middle of browsing): the sheet starts closed, so a
  // level entry we land on becomes the plain page.
  useEffect(() => {
    if (entryLevel(location) > 0) navigate(here, { replace: true, state: null });
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previous;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Page → history: one entry per newly opened level; closing levels goes back as many entries.
  useEffect(() => {
    const at = historyLevel.current;
    if (depth > at) {
      for (let level = at + 1; level <= depth; level += 1) navigate(here, { state: { ourWorkLevel: level } });
    } else if (depth < at) {
      navigate(depth - at);
    }
    historyLevel.current = depth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depth]);

  // History → page: the browser's back / forward buttons.
  useEffect(() => {
    if (navigationType !== 'POP') return;
    const level = entryLevel(location);
    const open = depthRef.current;
    historyLevel.current = level;
    if (level < open) {
      stepBackRef.current(open - level);
    } else if (level > open) {
      historyLevel.current = open;
      navigate(open - level);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);
};

export default useSheetHistory;
