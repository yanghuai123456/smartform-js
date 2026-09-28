# SmartForm JS SDK — drop-in vanilla JS HTML form helper, zero dependencies

Tiny vanilla-JS helper to wire any HTML form to [SmartForm AI](https://usesmartform.com).

No dependencies, no build step, no React. One `attachSmartForm(formEl, opts)` call and you're done.

## What `attachSmartForm` sends

The helper reads every field from the form, then POSTs JSON to
`https://api.usesmartform.com/api/v1/f/{formId}` with
`Accept: application/json` so the API returns JSON (not a 302). It
honours the same reserved fields as the plain HTML form:

| Field | Behaviour |
|---|---|
| `_gotcha` | Read from `[name="_gotcha"]` if present. If non-empty, the submission is **not** sent — `onSuccess` is called with `{ is_spam: true }` to keep your UI consistent. |
| `_next` | Read from the `redirect` option and sent as `_next` in the JSON body. The API echoes the URL back in `next_url`; the helper passes it to `onSuccess` and your code navigates manually. |
| `_subject` | Pass-through. Set `formData.set('_subject', '...')` before `attachSmartForm` and the API will use it for the notification email. |
| Everything else | Sent verbatim as JSON properties. |

If JS is disabled, the helper is bypassed entirely and the browser
falls back to the native `application/x-www-form-urlencoded` POST,
which the API also accepts.

## Usage

```html
<form id="contact">
  <input name="name" required />
  <input name="email" type="email" required />
  <textarea name="message" required></textarea>
  <input type="text" name="_gotcha" tabindex="-1" autocomplete="off"
         style="position:absolute;left:-9999px" aria-hidden="true" />
  <button>Send</button>
</form>

<script type="module">
  import { attachSmartForm } from './attachSmartForm.js';
  attachSmartForm('#contact', {
    formId: 'f_abc12345',                  // get from https://usesmartform.com/dashboard
    endpoint: 'https://api.usesmartform.com/api/v1/f',  // default; override for self-host
    redirect: '/thanks.html',              // optional: same-origin URL to redirect after success
    onSuccess: (data) => console.log(data),  // { submission_id, is_spam, intent, next_url }
    onError:   (err)  => alert(err.message),
  });
</script>
```

## Demo

```bash
python -m http.server 8000
# open http://localhost:8000/demo.html
```

## API

### `attachSmartForm(target, options)`

- `target` — CSS selector or DOM element for the `<form>`.
- `options.formId` *(required)* — 8-char form ID from your SmartForm dashboard.
- `options.endpoint` *(optional)* — defaults to `https://api.usesmartform.com/api/v1/f`. Use `http://localhost:8000/api/v1/f` for local dev.
- `options.redirect` *(optional)* — same-origin URL to navigate to after a successful submission. Internally sets `_next` (which the API honours for browser submissions).
- `options.onSuccess(data)` — `{ submission_id, is_spam, intent, next_url }`.
- `options.onError(err)` — `err.message` is human-readable; `err.code` is the API `error_code`.

## How it works

`POST {endpoint}/{formId}` with `Content-Type: application/json`. The helper:

1. Reads all form fields (skipping `_gotcha` if empty — it's a honeypot).
2. Sends JSON with `Accept: application/json` so the API returns JSON (not a 302).
3. Invokes `onSuccess` or `onError`.

If the user has JS disabled, the form falls back to the native `application/x-www-form-urlencoded` POST, which the API also accepts.


## FAQ

### Is there a free tier?

Yes. AI spam filtering is enabled by default on every plan. AI intent
classification and high-value lead detection require a paid plan (Pro
or Business) — the dashboard enforces this and returns HTTP 402 if
you try to enable them on a free workspace.

### Do I need an API key?

No. The form posts directly to a public endpoint using only an 8-char
form ID, which is non-enumerable. The example also includes a hidden
`_gotcha` honeypot field so naive bots cannot submit.

### Do I need React?
No. This is plain vanilla JavaScript with zero dependencies. One `attachSmartForm(formEl)` call wires up any existing `<form>` element.

## Related examples
[Vite + React contact form](https://github.com/yanghuai123456/smartform-example-vite-react) | [Vite + Vue 3 contact form](https://github.com/yanghuai123456/smartform-example-vite-vue) | [smartform-cli](https://github.com/yanghuai123456/smartform-cli)


## License

MIT.

