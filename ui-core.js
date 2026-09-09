/* Shared interaction lifecycle: one dialog, one page lock, one scroll intent. */
(() => {
  'use strict';
  const modal = { open: false, closing: false };
  let dialog = null;
  let previousFocus = null;
  let returnY = 0;
  let closeTimer = 0;
  let revision = 0;
  let scrollTimer = 0;
  let scrolling = false;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const background = () => document.querySelectorAll('body > header, body > main, body > nav');
  function endScroll() { scrolling = false; clearTimeout(scrollTimer); }
  function scrollTo(top, behavior = 'auto') {
    endScroll();
    const smooth = behavior === 'smooth' && !reduced();
    scrolling = smooth;
    window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'instant' });
    if (smooth) scrollTimer = setTimeout(endScroll, 1200);
  }
  function open(element) {
    if (!element || modal.open) return false;
    endScroll();
    const token = ++revision;
    previousFocus = document.activeElement;
    returnY = window.scrollY;
    dialog = element;
    modal.open = true;
    modal.closing = false;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    Object.assign(document.body.style, { position: 'fixed', top: `-${returnY}px`, left: '0', right: '0', width: '100%', paddingRight: gap ? `${gap}px` : '' });
    background().forEach(node => { node.inert = true; });
    element.hidden = false;
    requestAnimationFrame(() => {
      if (token !== revision || modal.closing) return;
      element.classList.add('is-open');
      element.querySelector('.modal__close')?.focus({ preventScroll: true });
    });
    return true;
  }
  function finish() {
    clearTimeout(closeTimer);
    revision++;
    dialog?.classList.remove('is-open');
    if (dialog) dialog.hidden = true;
    Object.assign(document.body.style, { position: '', top: '', left: '', right: '', width: '', paddingRight: '' });
    background().forEach(node => { node.inert = false; });
    scrollTo(returnY);
    modal.open = false;
    modal.closing = false;
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
    dialog = null;
  }
  function close({ immediate = false } = {}) {
    if (!modal.open || (modal.closing && !immediate)) return;
    modal.closing = true;
    revision++;
    dialog?.classList.remove('is-open');
    if (immediate || reduced()) finish();
    else closeTimer = setTimeout(finish, 180);
  }
  document.addEventListener('keydown', event => {
    if (!modal.open) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key !== 'Tab') return;
    const elements = [...dialog.querySelectorAll('button:not([disabled]), a[href], input, [tabindex="0"]')].filter(node => node.getClientRects().length);
    const first = elements[0], last = elements.at(-1);
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
  });
  window.addEventListener('scrollend', endScroll);
  for (const event of ['wheel', 'touchstart', 'pointerdown']) window.addEventListener(event, endScroll, { passive: true });
  window.addEventListener('keydown', event => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) endScroll(); });
  window.addEventListener('pageshow', event => { if (event.persisted && modal.open) close({ immediate: true }); });
  function categoryTop(target, offset) {
    const shell = document.querySelector('.menu-shell');
    const headerHeight = document.querySelector('#siteHeader').getBoundingClientRect().height;
    const stickyStart = shell.getBoundingClientRect().top + window.scrollY - headerHeight;
    return Math.max(0, stickyStart, target.getBoundingClientRect().top + window.scrollY - offset);
  }
  function enableCategoryScrolling(strip) {
    if (!strip) return;
    let drag = null;
    let suppressClick = false;
    strip.addEventListener('wheel', event => {
      // Preserve native horizontal trackpad gestures and browser zoom.
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? strip.clientWidth : 1;
      const delta = event.deltaY * unit;
      const max = strip.scrollWidth - strip.clientWidth;
      if (max <= 1 || (delta < 0 && strip.scrollLeft <= 1) || (delta > 0 && strip.scrollLeft >= max - 1)) return;
      event.preventDefault();
      strip.scrollBy({ left: delta, behavior: 'instant' });
    }, { passive: false });
    strip.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      suppressClick = false;
      drag = { id: event.pointerId, x: event.clientX, left: strip.scrollLeft, moved: false };
    });
    strip.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const distance = event.clientX - drag.x;
      if (!drag.moved && Math.abs(distance) < 7) return;
      if (!drag.moved) {
        drag.moved = true;
        strip.setPointerCapture(event.pointerId);
        strip.classList.add('is-dragging');
      }
      event.preventDefault();
      strip.scrollLeft = drag.left - distance;
    });
    const finishDrag = event => {
      if (!drag || event.pointerId !== drag.id) return;
      suppressClick = drag.moved;
      drag = null;
      strip.classList.remove('is-dragging');
      if (strip.hasPointerCapture(event.pointerId)) strip.releasePointerCapture(event.pointerId);
    };
    strip.addEventListener('pointerup', finishDrag);
    strip.addEventListener('pointercancel', finishDrag);
    strip.addEventListener('lostpointercapture', finishDrag);
    strip.addEventListener('pointerleave', event => { if (drag && !drag.moved) drag = null; });
    strip.addEventListener('click', event => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
    strip.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const buttons = [...strip.querySelectorAll('button')];
      const index = buttons.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)));
      buttons[next].focus({ preventScroll: true });
      strip.scrollTo({ left: buttons[next].offsetLeft - (strip.clientWidth - buttons[next].offsetWidth) / 2, behavior: 'instant' });
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    enableCategoryScrolling(document.querySelector('#categoryStrip'));
    enableCategoryScrolling(document.querySelector('#banquetCategories'));
  }, { once: true });
  window.NectarUI = { modal, open, close, scrollTo, categoryTop, get scrolling() { return scrolling; } };
})();
