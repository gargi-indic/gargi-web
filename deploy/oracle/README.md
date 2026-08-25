# Deploying Gargi inference to Oracle Cloud (ARM Always Free)

Runs both Gargi-M1 checkpoints on an Ampere A1 VM, behind HTTPS, for **$0/month**.

Why this rather than Docker: on a VM you control there is no benefit to building
a 1.3 GB image and pushing it anywhere. systemd runs the same `app.py` directly
against a venv, starts in seconds, and iterating is a `git pull` and a restart.

| | |
|---|---|
| Shape | `VM.Standard.A1.Flex`, 2 OCPU, 12 GB (current Always Free cap) |
| Needs | ~1.4 GB peak while loading both checkpoints |
| Cost | Free, permanently — not a trial credit |
| Sleeps | Never. No cold start, no 48h idle timeout |

> Oracle halved Always Free A1 from 4 OCPU/24 GB to **2 OCPU/12 GB** on
> 15 June 2026 and began terminating over-limit instances on 18 August. Stay at
> or under 2 OCPU / 12 GB. It is still ~8x more memory than this service needs.

---

## 1. Create the instance (OCI console)

**Compute → Instances → Create instance**

- **Image**: Ubuntu 24.04 (make sure it is the **aarch64** build)
- **Shape**: Ampere → `VM.Standard.A1.Flex` → **2 OCPUs, 12 GB**
- **Networking**: assign a **public IPv4 address**
- **SSH keys**: upload your public key

> **"Out of host capacity"** is the usual first result, and it is the single
> most annoying thing about this tier. It is regional. Try a different
> availability domain, try a less busy home region, or retry later — capacity
> does free up. It is not a problem with your account.

## 2. Open the ports (OCI console)

**Networking → Virtual Cloud Networks → your VCN → Subnet → Security List →
Add Ingress Rules**

| Source CIDR | Protocol | Destination port |
|---|---|---|
| `0.0.0.0/0` | TCP | 80 |
| `0.0.0.0/0` | TCP | 443 |

Port 80 is needed for the Let's Encrypt challenge, not just redirects.

## 3. Deploy

```bash
ssh ubuntu@<YOUR_PUBLIC_IP>
```

```bash
sudo mkdir -p /opt/gargi && sudo chown $USER /opt/gargi
git clone <your-repo-url> /opt/gargi   # or scp the inference/ + deploy/ dirs across
cd /opt/gargi
openssl rand -hex 32                    # save this — it is your GARGI_API_TOKEN
sudo ./deploy/oracle/setup.sh <that-token>
```

The script installs Python and Caddy, creates a `gargi` service user, builds the
venv, **pre-downloads both checkpoints** so the first request does not pay for
it, installs the systemd unit, fixes the firewall, and obtains a TLS certificate.
Allow 10–15 minutes, most of it downloading torch and 880 MB of weights.

It prints your endpoint at the end. Without a domain you get a real Let's
Encrypt certificate via `sslip.io`, which resolves `1-2-3-4.sslip.io` to
`1.2.3.4`:

```
https://141-148-x-x.sslip.io
```

### The firewall gotcha

Oracle's Ubuntu images ship **iptables rules that REJECT everything except
SSH**, entirely separately from the Security List in the console. Opening ports
in the console alone leaves the box unreachable, and nothing tells you why.
`setup.sh` fixes this, but it is the first thing to check if the endpoint hangs.

## 4. Point the site at it

On Vercel (and in `web/.env.local` to test locally against it):

```
GARGI_INFERENCE_URL=https://141-148-x-x.sslip.io
GARGI_API_TOKEN=<the token from step 3>
```

## 5. Verify

```bash
curl -s https://YOUR-ENDPOINT/health | python3 -m json.tool
```

Both checkpoints should show `params_m: 110.0`, `context: 512`.

```bash
curl -sN -X POST https://YOUR-ENDPOINT/generate \
  -H "Authorization: Bearer $GARGI_API_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"സൂര്യൻ എന്താണ്?","checkpoint":"instruct","max_tokens":120}' \
  | grep -A1 'event: done'
```

Tokens should arrive progressively, not in one lump at the end — if they lump,
Caddy is buffering and `flush_interval -1` has gone missing from the Caddyfile.

**Expected throughput: 40–70 tok/s.** Measured 100 tok/s on 2 threads of Apple
Silicon; Ampere A1 cores are real dedicated cores rather than shared vCPU, so
this should land far closer to local speed than a free Space would have.

---

## Using your own domain

Point an A record at the instance IP, then:

```bash
sudo sed -i 's|[0-9-]*\.sslip\.io|api.gargi.ai|' /etc/caddy/Caddyfile
sudo systemctl restart caddy
```

Caddy fetches the new certificate automatically.

## Operating it

```bash
sudo systemctl status gargi-inference     # is it up
sudo journalctl -u gargi-inference -f     # live logs
sudo systemctl restart gargi-inference    # after a config change
```

Deploying a change:

```bash
cd /opt/gargi && git pull && sudo systemctl restart gargi-inference
```

Tuning, in `/etc/gargi.env` (restart after editing):

| Variable | Default | |
|---|---|---|
| `TORCH_THREADS` | `2` | Match your OCPU count |
| `QUANTIZE` | `0` | `1` for int8 — lower memory, some quality cost |
| `MAX_NEW_TOKENS_CAP` | `300` | Hard ceiling on generation length |

## Troubleshooting

**Endpoint times out** — Security List rules missing, or iptables. Check both:
`sudo iptables -L INPUT -n --line-numbers | head`

**Certificate fails** — port 80 must be open to the world for the ACME
challenge, and `sslip.io` must resolve: `dig +short <dashed-ip>.sslip.io`

**Service will not start** — `sudo journalctl -u gargi-inference -n 50`.
Most likely the weights did not finish downloading; re-run step 4 of `setup.sh`.

**Out of memory** — you are probably on a 1 GB shape rather than the A1.
Confirm with `free -h`; you want ~12 GB.
