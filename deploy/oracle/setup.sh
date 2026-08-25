#!/usr/bin/env bash
#
# Provision the Gargi inference service on an Oracle Cloud ARM (Ampere A1) VM.
# Ubuntu 22.04/24.04 aarch64. Idempotent -- safe to re-run.
#
#   curl -fsSL <raw-url>/setup.sh | sudo bash -s -- <your-api-token>
# or, having copied the repo across:
#   sudo ./setup.sh <your-api-token>
#
set -euo pipefail

API_TOKEN="${1:-}"
APP_USER="gargi"
APP_DIR="/opt/gargi"
PORT=7860

if [[ -z "$API_TOKEN" ]]; then
  echo "usage: sudo ./setup.sh <GARGI_API_TOKEN>" >&2
  echo "generate one with: openssl rand -hex 32" >&2
  exit 1
fi
[[ $EUID -eq 0 ]] || { echo "run with sudo" >&2; exit 1; }

echo "==> 1/7  Packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq python3 python3-venv python3-pip git curl debian-keyring \
  debian-archive-keyring apt-transport-https

echo "==> 2/7  Service user"
id -u "$APP_USER" &>/dev/null || useradd --system --create-home --home-dir "/home/$APP_USER" --shell /usr/sbin/nologin "$APP_USER"
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

echo "==> 3/7  Python environment (this pulls ~200 MB of torch, be patient)"
if [[ ! -d "$APP_DIR/.venv" ]]; then
  sudo -u "$APP_USER" python3 -m venv "$APP_DIR/.venv"
fi
sudo -u "$APP_USER" "$APP_DIR/.venv/bin/pip" install --quiet --upgrade pip
sudo -u "$APP_USER" "$APP_DIR/.venv/bin/pip" install --quiet -r "$APP_DIR/requirements.txt"

echo "==> 4/7  Pre-downloading both checkpoints (~880 MB)"
# Done now rather than on first request, so the first visitor is not the one
# who waits for it.
sudo -u "$APP_USER" HF_HOME="/home/$APP_USER/.cache/huggingface" \
  "$APP_DIR/.venv/bin/python" -c "
from huggingface_hub import hf_hub_download
for r in ['gishnu/malayalam-nanogpt-instruct-v3-100M','gishnu/malayalam-nanogpt-base-v3-100M']:
    for f in ['pytorch_model.bin','tokenizer.json']:
        hf_hub_download(r, f)
    print('  cached', r, flush=True)
"

echo "==> 5/7  systemd service"
install -m 600 -o root -g root /dev/stdin /etc/gargi.env <<EOF
GARGI_API_TOKEN=$API_TOKEN
TORCH_THREADS=2
QUANTIZE=0
PORT=$PORT
HF_HOME=/home/$APP_USER/.cache/huggingface
EOF
cp "$APP_DIR/deploy/oracle/gargi-inference.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now gargi-inference
sleep 5
systemctl is-active --quiet gargi-inference && echo "    service is running" || {
  echo "    service failed to start:"; journalctl -u gargi-inference -n 30 --no-pager; exit 1; }

echo "==> 6/7  Firewall"
# Oracle's Ubuntu images ship iptables rules that REJECT everything except SSH.
# This is the single most common reason an Oracle VM appears unreachable, and
# it is invisible from the web console's Security List page.
iptables -C INPUT -p tcp --dport 80  -j ACCEPT 2>/dev/null || iptables -I INPUT 5 -p tcp --dport 80  -j ACCEPT
iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || iptables -I INPUT 5 -p tcp --dport 443 -j ACCEPT
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq iptables-persistent >/dev/null 2>&1 || true
netfilter-persistent save >/dev/null 2>&1 || iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
echo "    ports 80/443 open locally (you must ALSO open them in the OCI Security List)"

echo "==> 7/7  Caddy (automatic HTTPS)"
if ! command -v caddy &>/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -qq && apt-get install -y -qq caddy
fi

IP=$(curl -s --max-time 10 https://api.ipify.org || echo "")
[[ -n "$IP" ]] || { echo "could not determine public IP" >&2; exit 1; }
HOSTNAME_SSLIP="${IP//./-}.sslip.io"

# sslip.io resolves <dashed-ip>.sslip.io to that IP, which lets Let's Encrypt
# issue a real certificate without you owning a domain. Swap in your own
# hostname here whenever you have one.
sed "s|__HOSTNAME__|$HOSTNAME_SSLIP|g; s|__PORT__|$PORT|g" \
  "$APP_DIR/deploy/oracle/Caddyfile" > /etc/caddy/Caddyfile
systemctl restart caddy
sleep 8

echo
echo "======================================================================"
echo "  Endpoint:  https://$HOSTNAME_SSLIP"
echo
echo "  Set on Vercel:"
echo "    GARGI_INFERENCE_URL=https://$HOSTNAME_SSLIP"
echo "    GARGI_API_TOKEN=<the token you passed to this script>"
echo
echo "  Verify:"
echo "    curl -s https://$HOSTNAME_SSLIP/health | python3 -m json.tool"
echo "======================================================================"
