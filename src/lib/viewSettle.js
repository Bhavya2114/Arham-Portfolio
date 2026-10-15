/**
 * "Tell me when the map view has settled" — listeners for the end of the map's view animation.
 *
 * A listener stays attached while one animation hands over to the next (e.g. the state zoom is
 * replaced by a zoom-button animation), and is called once, when the view finally stops:
 *   'finished'    — the animation completed (or was instant under reduced motion), or none was running
 *   'interrupted' — the user took over (drag / pinch) or the map unmounted
 * Each `add` returns an unsubscribe function so a superseded selection never acts on a stale view.
 */
export const createSettleQueue = () => {
  let listeners = [];
  return {
    add(cb) {
      listeners.push(cb);
      return () => {
        listeners = listeners.filter((l) => l !== cb);
      };
    },
    flush(reason) {
      const pending = listeners;
      listeners = [];
      pending.forEach((cb) => cb(reason));
    },
    get size() {
      return listeners.length;
    },
  };
};
