/**
 * Injects a small runtime script into a generated site's HTML before
 * </body>. It never touches the site's own markup or styles — it only:
 *
 *  1. Listens for a `nova-set-edit-mode` message from the parent window to
 *     turn "point to edit" mode on/off. While on, hovering highlights
 *     elements and clicking selects one instead of following its normal
 *     behavior (links, buttons, etc. are prevented from firing), then
 *     reports the selection back via `nova-element-selected`.
 *  2. Always listens for uncaught errors/rejections and reports them via
 *     `nova-runtime-error`, so the app can trigger an automatic fix.
 *
 * Runs fine inside a sandboxed iframe with only `allow-scripts` — postMessage
 * doesn't require `allow-same-origin`.
 */
export function injectPreviewRuntime(html: string): string {
  const runtime = `
<script>
(function () {
  var editMode = false;
  var lastHighlighted = null;

  function clearHighlight() {
    if (lastHighlighted) {
      lastHighlighted.style.outline = '';
      lastHighlighted.style.outlineOffset = '';
      lastHighlighted = null;
    }
  }

  function cssPath(el) {
    if (!(el instanceof Element)) return '';
    var path = [];
    while (el && el.nodeType === Node.ELEMENT_NODE && path.length < 6) {
      var selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += '#' + el.id;
        path.unshift(selector);
        break;
      } else {
        var sibling = el, nth = 1;
        while ((sibling = sibling.previousElementSibling)) {
          if (sibling.nodeName.toLowerCase() === selector) nth++;
        }
        selector += ':nth-of-type(' + nth + ')';
      }
      path.unshift(selector);
      el = el.parentElement;
    }
    return path.join(' > ');
  }

  document.addEventListener('mouseover', function (e) {
    if (!editMode) return;
    clearHighlight();
    var el = e.target;
    if (el && el !== document.body && el !== document.documentElement) {
      el.style.outline = '2px solid #00df89';
      el.style.outlineOffset = '2px';
      lastHighlighted = el;
    }
  }, true);

  document.addEventListener('click', function (e) {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    var el = e.target;
    var snippet = el.outerHTML || '';
    if (snippet.length > 1500) snippet = snippet.slice(0, 1500) + '...';
    window.parent.postMessage({
      type: 'nova-element-selected',
      selector: cssPath(el),
      tag: el.tagName ? el.tagName.toLowerCase() : '',
      snippet: snippet,
    }, '*');
  }, true);

  window.addEventListener('message', function (e) {
    var data = e.data || {};
    if (data.type === 'nova-set-edit-mode') {
      editMode = !!data.enabled;
      document.body.style.cursor = editMode ? 'crosshair' : '';
      if (!editMode) clearHighlight();
    }
  });

  function reportError(message) {
    window.parent.postMessage({ type: 'nova-runtime-error', message: String(message).slice(0, 500) }, '*');
  }
  window.addEventListener('error', function (e) { reportError(e.message || 'Unknown script error'); });
  window.addEventListener('unhandledrejection', function (e) {
    reportError((e.reason && e.reason.message) || e.reason || 'Unhandled promise rejection');
  });
})();
</script>`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${runtime}\n</body>`);
  }
  return html + runtime;
}

export function toPreviewUrl(html: string): string {
  const withRuntime = injectPreviewRuntime(html);
  const base64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(withRuntime, 'utf-8').toString('base64')
      : btoa(unescape(encodeURIComponent(withRuntime)));
  return `data:text/html;base64,${base64}`;
}
