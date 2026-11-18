/**
 * Short open/close motion shared by every disclosure on the site (native <details>, the
 * About team cards, the testimonial cards), so nothing jumps open or shut. The box animates
 * its height over 250ms ease-out (the timing of the home FAQ accordion) with its content
 * clipped; a panel that floats over the page (an absolutely positioned <details> body,
 * like the docs "Menu" and "On this page" dropdowns) also fades. Closing keeps the content
 * in place until the box has folded, then applies the closed state. Users who ask for
 * reduced motion get the instant toggle.
 */

const DURATION = 250;
const EASING = "ease-out";
const MOTION_ID = "disclosure-motion";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const heightOf = (el: HTMLElement) => el.getBoundingClientRect().height;

// inline overflow of each box before its motion clipped it, restored synchronously (an
// animation's cancel event fires later, after the next motion has already started)
const savedOverflow = new WeakMap<HTMLElement, string>();

function restoreOverflow(box: HTMLElement) {
  const overflow = savedOverflow.get(box);
  if (overflow === undefined) return;
  box.style.overflow = overflow;
  savedOverflow.delete(box);
}

/** True while a box is folding and still shows its open state. */
export const isClosing = (box: HTMLElement) => "motionClosing" in box.dataset;

/** Stops a running motion on the box (the state it was heading to is not applied). */
export function cancelMotion(box: HTMLElement) {
  box.getAnimations().forEach((animation) => {
    if (animation.id === MOTION_ID) animation.cancel();
  });
  restoreOverflow(box);
  delete box.dataset.motionClosing;
}

/** Animates the box from one height to another, then runs `done`. */
export function runHeight(
  box: HTMLElement,
  from: number,
  to: number,
  {
    done,
    fade = false,
    closing = false,
  }: { done?: () => void; fade?: boolean; closing?: boolean } = {},
) {
  cancelMotion(box);
  if (prefersReducedMotion() || Math.abs(from - to) < 1) {
    done?.();
    return;
  }
  if (closing) box.dataset.motionClosing = "";
  savedOverflow.set(box, box.style.overflow);
  box.style.overflow = "hidden";
  const opening = to > from;
  const keyframes: Keyframe[] = [
    { height: `${from}px`, ...(fade && { opacity: opening ? 0 : 1 }) },
    { height: `${to}px`, ...(fade && { opacity: opening ? 1 : 0 }) },
  ];
  const animation = box.animate(keyframes, { duration: DURATION, easing: EASING });
  animation.id = MOTION_ID;
  animation.addEventListener("finish", () => {
    restoreOverflow(box);
    delete box.dataset.motionClosing;
    done?.();
  });
}

/**
 * Opens or closes a custom disclosure with motion. `setOpen` applies the state (classes,
 * hidden attributes, aria); it is called twice in a row when closing so the closed height can
 * be measured, which is why it must not have side effects beyond the DOM state.
 */
export function toggleWithMotion(
  box: HTMLElement,
  open: boolean,
  setOpen: (open: boolean) => void,
) {
  const from = heightOf(box);
  cancelMotion(box);
  if (open) {
    setOpen(true);
    runHeight(box, from, heightOf(box));
    return;
  }
  setOpen(false);
  const to = heightOf(box);
  setOpen(true);
  runHeight(box, from, to, { closing: true, done: () => setOpen(false) });
}

/** The body of a <details> when it floats over the page instead of pushing content down. */
function overlayPanel(details: HTMLDetailsElement) {
  const panel = details.querySelector<HTMLElement>(":scope > summary + *");
  if (!panel) return null;
  const { position } = getComputedStyle(panel);
  return position === "absolute" || position === "fixed" ? panel : null;
}

/** Height of a closed <details>: its summary plus the box's own bottom padding and border. */
function closedHeight(details: HTMLDetailsElement, summary: HTMLElement) {
  const style = getComputedStyle(details);
  return (
    summary.getBoundingClientRect().bottom -
    details.getBoundingClientRect().top +
    parseFloat(style.paddingBottom) +
    parseFloat(style.borderBottomWidth)
  );
}

function toggleDetails(details: HTMLDetailsElement, summary: HTMLElement) {
  const overlay = overlayPanel(details);
  const box = overlay ?? details;
  const reopening = details.open && isClosing(box);
  if (details.open && !reopening) {
    const from = heightOf(box);
    const to = overlay ? 0 : closedHeight(details, summary);
    runHeight(box, from, to, {
      fade: Boolean(overlay),
      closing: true,
      done: () => {
        details.open = false;
      },
    });
    return;
  }
  const from = reopening ? heightOf(box) : overlay ? 0 : closedHeight(details, summary);
  cancelMotion(box);
  details.open = true;
  // measured once open: a closed body has no box to measure
  runHeight(box, from, heightOf(box), { fade: Boolean(overlay) });
}

/** Gives every <details> on the page the motion; safe to call again after a page swap. */
export function initDetailsMotion(root: ParentNode = document) {
  root
    .querySelectorAll<HTMLDetailsElement>("details:not([data-motion-ready])")
    .forEach((details) => {
      details.dataset.motionReady = "";
      const summary = details.querySelector<HTMLElement>(":scope > summary");
      if (!summary) return;
      summary.addEventListener("click", (event) => {
        if (prefersReducedMotion()) return;
        event.preventDefault();
        toggleDetails(details, summary);
      });
    });
}
