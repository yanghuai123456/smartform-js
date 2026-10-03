// smartform-js — attach any HTML form to SmartForm AI.
// Zero deps, no build, no React. Just ES2020.

const DEFAULT_ENDPOINT = 'https://api.usesmartform.com/api/v1/f';

export function attachSmartForm(target, options = {}) {
  if (!options.formId) throw new Error('smartform: formId is required');
  if (!/^[A-Za-z0-9_-]{4,}$/.test(options.formId)) {
    throw new Error('smartform: formId must be at least 4 chars of letters, digits, "_" or "-"');
  }

  const form = typeof target === 'string' ? document.querySelector(target) : target;
  if (!form) throw new Error(`smartform: form not found: ${target}`);

  const endpoint   = (options.endpoint || DEFAULT_ENDPOINT).replace(/\/+$/, '');
  const redirect   = options.redirect || null;
  const onSuccess  = options.onSuccess || (() => {});
  const onError    = options.onError   || ((e) => console.error('smartform error:', e));

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    // Honeypot: if `_gotcha` is filled, treat as spam silently.
    const gotcha = form.querySelector('[name="_gotcha"]');
    if (gotcha && gotcha.value.trim() !== '') {
      onSuccess({ submission_id: null, is_spam: true, intent: 'discarded', next_url: null });
      return;
    }

    const data = {};
    for (const el of form.elements) {
      if (!el.name) continue;
      data[el.name] = el.value;
    }

    if (redirect && data._next === undefined) data._next = redirect;

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const r = await fetch(`${endpoint}/${options.formId}`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Accept':        'application/json',
        },
        body: JSON.stringify(data),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        onError(Object.assign(new Error(body.message || `HTTP ${r.status}`), {
          code:   body.error_code,
          status: r.status,
          body,
        }));
      } else {
        onSuccess(body);
        form.reset();
        if (body.next_url) location.href = body.next_url;
      }
    } catch (e) {
      onError(Object.assign(new Error('Network error: ' + e.message), { code: 'NETWORK_ERROR' }));
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
