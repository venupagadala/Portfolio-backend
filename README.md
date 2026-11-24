# Portfolio Contact API

Small Express service behind the contact form on
[venupagadala.github.io/Portfolio](https://venupagadala.github.io/Portfolio/).
It validates the message and emails it to me through [Resend](https://resend.com)'s HTTPS API.

## Why Resend instead of Gmail SMTP

The service runs on Render's free plan. Since September 2025 Render blocks outbound
SMTP (ports 25, 465 and 587) on free web services, so the old Gmail/Nodemailer version
could never connect and requests hung until they timed out. Resend sends over HTTPS
(port 443), which is allowed.

## Endpoints

| Method | Path      | Purpose                                                   |
| ------ | --------- | --------------------------------------------------------- |
| GET    | `/health` | Returns `{ ok: true }`. The site calls it to wake the instance early. |
| POST   | `/send`   | Body: `name`, `email`, `message`, optional `phone`. Returns 200, 400 (invalid input), 500 (not configured) or 502 (email provider failed). |

Visitor input is HTML-escaped before it goes into the email, length-limited, and the
visitor's address is set as `reply_to` so replying goes straight to them.

## Configuration

| Variable             | Required | Notes |
| -------------------- | -------- | ----- |
| `RESEND_API_KEY`     | yes      | From Resend → API Keys. |
| `CONTACT_TO_EMAIL`   | yes      | Inbox that receives messages. With the shared test sender this must be the address you signed up to Resend with. |
| `CONTACT_FROM_EMAIL` | no       | Defaults to `Portfolio Contact <onboarding@resend.dev>`. Use an address on a domain verified in Resend to send from your own domain. |
| `ALLOWED_ORIGINS`    | no       | Comma-separated origins for CORS, e.g. `https://venupagadala.github.io`. Defaults to `*`. |
| `PORT`               | no       | Defaults to 5000 (Render sets it automatically). |

## Run locally

```bash
npm install
cp .env.example .env   # then fill in the values
npm start
npm test               # runs against a fake Resend server; no credentials needed
```
