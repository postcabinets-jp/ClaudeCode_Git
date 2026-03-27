# Remote Access — Claude Code from iPhone

Access Claude Code on your Mac from your iPhone over Tailscale VPN.

## Architecture

```
iPhone (Safari / PWA)
    |
    | Tailscale VPN (encrypted, peer-to-peer)
    |
    v
Mac mini / MacBook
    |
    +-- :7680  PWA Launcher (Node.js)   <-- remote-app/server.mjs
    |          Serves index.html with session buttons
    |
    +-- :7681  ttyd (terminal-in-browser) <-- scripts/start-ttyd.sh
               Runs ttyd-claude.sh → tmux session
               Basic Auth (TTYD_USER:TTYD_PASS)
```

### Data flow

1. iPhone opens `http://<tailscale-ip>:7680` (PWA Launcher)
2. User taps a session button (Resume / New / Shell / Sessions)
3. PWA opens ttyd iframe at `:7681` with Basic Auth
4. ttyd spawns `ttyd-claude.sh` which attaches to the `claude` tmux session
5. User types commands in the terminal (voice typing works via iOS keyboard)

### Security model

- **No port is exposed to the internet.** ttyd binds to the Tailscale interface only.
- Basic Auth protects ttyd (credentials in `.env`).
- Tailscale provides end-to-end encryption and identity-based access.

## Setup

### Prerequisites

- macOS with Homebrew
- Tailscale installed and connected
- Node.js 20+

### One-shot setup

```bash
npm run remote:setup
```

This will:
1. Install `ttyd`, `tmux`, `node` if missing
2. Prompt for ttyd username/password (stored in `.env`)
3. Create `logs/` directory
4. Install `~/.tmux.conf` (mobile-optimized, if not already present)
5. Generate and install launchd plists (auto-start on boot)
6. Verify services are running
7. Print access URLs

### Manual setup (if you prefer)

```bash
# Install dependencies
brew install ttyd tmux node

# Configure credentials
echo 'TTYD_USER=claude' >> .env
echo 'TTYD_PASS=your-secure-password' >> .env

# Start services
npm run ttyd:start
npm run remote:start
```

## Changing the Password

### Step 1: Update `.env`

Edit `.env` in the project root:

```
TTYD_USER=claude
TTYD_PASS=your-new-password
```

### Step 2: Restart ttyd

Option A — npm scripts:
```bash
npm run ttyd:stop && npm run ttyd:start
```

Option B — launchctl:
```bash
launchctl kickstart -k gui/$(id -u)/com.postcabinets.ttyd-claude
```

### Step 3: Update PWA credentials

Edit `remote-app/index.html` and find the `CRED` constant near the top of the `<script>` block:

```javascript
const CRED = 'claude:your-new-password';
```

Change it to match the new `TTYD_USER:TTYD_PASS`.

Then reload the PWA on your phone (or re-add to Home Screen).

## Using the PWA

### Install on iPhone

1. Open `http://<tailscale-ip>:7680` in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Name it "Claude" (or whatever you like)

### Session modes

| Button | What it does | Command to type |
|--------|-------------|-----------------|
| Resume Session | Opens terminal, attach to existing tmux | `claude --resume` |
| New Session | Opens terminal for a fresh Claude session | `claude` |
| Terminal Only | Opens a plain shell | (use as normal shell) |
| Session List | Opens terminal to view sessions | `claude sessions list` |

After the terminal opens, a toast message will briefly show the suggested command to type.

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run remote:setup` | One-shot setup (install deps, configure, start services) |
| `npm run ttyd:start` | Start ttyd manually |
| `npm run ttyd:stop` | Stop ttyd |
| `npm run ttyd:status` | Check ttyd status and show URL |
| `npm run remote:start` | Start PWA launcher server |
| `npm run remote:status` | Show access URLs |

## Troubleshooting

### "Mac is offline" in PWA

- Check that Tailscale is running on both the Mac and the iPhone.
- Verify with `tailscale status` on the Mac.
- Make sure both devices are on the same Tailscale network (tailnet).

### ttyd not starting

```bash
# Check if ttyd is installed
which ttyd

# Check launchd status
launchctl list com.postcabinets.ttyd-claude

# Check logs
cat logs/ttyd.log
cat logs/ttyd.err
```

### "Connection refused" on :7681

- ttyd may have crashed. Check `logs/ttyd.err`.
- Restart: `npm run ttyd:stop && npm run ttyd:start`
- Or: `launchctl kickstart -k gui/$(id -u)/com.postcabinets.ttyd-claude`

### PWA launcher not loading (:7680)

```bash
# Check if node server is running
pgrep -fl "server.mjs"

# Check logs
cat logs/launcher.log
cat logs/launcher.err

# Restart
launchctl kickstart -k gui/$(id -u)/com.postcabinets.claude-launcher
```

### tmux session not found

```bash
# List tmux sessions
tmux list-sessions

# Create a new one manually
tmux new-session -d -s claude
tmux attach -t claude
```

### Wrong password / auth loop

1. Verify `.env` has the correct `TTYD_USER` and `TTYD_PASS`
2. Verify `remote-app/index.html` has the matching `CRED` constant
3. Restart ttyd after changing the password
4. Clear browser cache on iPhone (Settings > Safari > Clear History)

### launchd services not starting after reboot

```bash
# Re-run setup to reinstall plists
npm run remote:setup

# Or manually load
launchctl load ~/Library/LaunchAgents/com.postcabinets.ttyd-claude.plist
launchctl load ~/Library/LaunchAgents/com.postcabinets.claude-launcher.plist
```

## File Reference

| File | Purpose |
|------|---------|
| `scripts/remote-setup.sh` | One-shot setup script |
| `scripts/start-ttyd.sh` | ttyd startup (reads .env, binds to Tailscale) |
| `scripts/ttyd-claude.sh` | Shell script spawned by ttyd (tmux attach) |
| `remote-app/index.html` | PWA launcher UI |
| `remote-app/server.mjs` | PWA static file server |
| `remote-app/manifest.json` | PWA manifest |
| `config/tmux.conf` | Mobile-optimized tmux config |
| `scripts/launchd/*.plist` | launchd service templates |
| `.env` | Credentials (TTYD_USER, TTYD_PASS) |
