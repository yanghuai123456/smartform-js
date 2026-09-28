# smartform-js

Tiny vanilla-JS helper to wire any HTML form to [SmartForm AI](https://usesmartform.com).

No dependencies, no build step, no React. One `attachSmartForm(formEl, opts)` call and you're done.

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

## License

MIT.
