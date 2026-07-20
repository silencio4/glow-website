# glow — Beauty, Nails & More

Static website for the salon in Thessaloniki. Greek language, no build step,
no dependencies. Hosts anywhere that serves files.

```
index.html
assets/
  css/style.css
  js/main.js
  img/            ← images copied and renamed from MEDIA/
MEDIA/            ← your original files, untouched
```

Sections: Hero · About · Services · Gallery · Contact (details + map) · ΕΣΠΑ footer

---

## ⚠️ Before you go live

Four things are placeholders. Everywhere one appears on the page it is
**highlighted in yellow** — search the code for `TODO` and `class="todo"`.

| # | What | Where |
|---|------|-------|
| 1 | **Street address** | contact section, JSON-LD block (line ~31), and the map `q=` parameter |
| 2 | **Opening hours** | contact section |
| 3 | **Email address** | contact section (currently `info@example.gr`) |
| 4 | **Facebook link** | commented out next to the Instagram link — delete the comment if you have no page |

Once you replace a value, remove its `class="todo"` so the highlight disappears.

The service cards list the treatments you offer with **no prices**. Check the
treatment names are right — I inferred them from your photos and equipment.

### Logo

The header and footer use `logo-glow-green.jpg` — your square logo, cropped to
a circle. It works, but it's a JPEG. **Send a transparent PNG or SVG** and it
will render crisply at every size and on any background.

---

## Accessibility — WCAG 2.1 Level AA

Verified in a real browser, not assumed:

| Check | Result |
|---|---|
| Text contrast (1.4.3) | **91 text elements measured, 0 failures.** Lowest 6.42:1 against a 4.5:1 requirement |
| Non-text contrast (1.4.11) | All component boundaries ≥3:1 |
| Touch targets | 0 controls below 44×44px |
| Reflow at 320px (1.4.10) | No horizontal scroll, no content loss |
| Text spacing override (1.4.12) | No content loss |
| 200% text zoom (1.4.4) | No content loss |
| Heading order (1.3.1) | Single `h1`, no skipped levels |
| Names on controls (4.1.2) | 0 unnamed buttons or links |
| Keyboard (2.1.1, 2.4.3) | Full traversal, no positive `tabindex`, no traps |
| Focus visible (2.4.7) | 3px ring on every control |

Also: skip link, landmark regions, `lang="el"`, labelled `nav`s and `iframe`,
`prefers-reduced-motion`, Windows High Contrast mode, and colour never used as
the sole indicator.

### The brand colour problem, and how it's solved

Your sage green `#7A8F6B` measures **3.1:1 on white** — it fails AA for body
text and for buttons with white labels. There is no way to use it as a text
colour and be AA compliant. So the palette splits it:

| Token | Value | Used for | Ratio |
|---|---|---|---|
| `--sage-500` | `#7A8F6B` | Backgrounds and decorative fills **only** | 3.1:1 — never text |
| `--sage-700` | `#445739` | All text, buttons, icons, links | **7.9:1** ✓ AAA |
| `--sage-900` | `#2E3A26` | Footer background | — |
| `--ink` | `#1C1E1A` | Body text | **15.9:1** ✓ AAA |
| `--ink-muted` | `#4B5145` | Secondary text, component borders | **8.2:1** ✓ AAA |

Visually it still reads as your brand green — `#445739` is the same hue, just
darkened enough to be legible. Every token in `style.css` carries its measured
ratio in a comment. **Don't lighten them without re-testing.**

### Fixes made during testing

Testing caught five real defects that eyeballing would have missed:

1. Footer and contact links were 41px/32px tall — under the 44px minimum
2. The mobile menu button's border was 1.5:1 — a component boundary needs 3:1
3. Price rows clipped when text spacing was overridden (1.4.12) — since removed
4. Long Greek compounds overflowed their container at 200% zoom — now break
5. Rem-based padding doubled at 200% zoom, squeezing the text column — now capped in px

### Known-good exception

The phone number inside the services paragraph is a 105×20px link. Target-size
rules explicitly exempt links inside a sentence, so this is compliant. The same
number appears as a full-size button in the hero and as a 44px target in the
contact section.

---

## Putting it on GitHub

| | |
|---|---|
| GitHub account | **silencio4** |
| Repository | **glow-website** (public) |
| Remote | `git@github.com:silencio4/glow-website.git` (SSH) |
| Commit author | `silencio4 <giorgosid20@gmail.com>` |
| Live URL once Pages is on | https://silencio4.github.io/glow-website/ |

### Already done

- Repository created on GitHub
- Local repo initialised, 3 commits, working tree clean
- Remote `origin` added and pointed at the **SSH** URL
- SSH key generated at `~/.ssh/id_ed25519`

### Remaining steps

**1. Register the SSH key** — <https://github.com/settings/ssh/new>

Paste the contents of `~/.ssh/id_ed25519.pub`. Print it with:

```bash
cat ~/.ssh/id_ed25519.pub
```

That is the *public* half and is safe to share. The private half stays on this
machine and must never be shared.

**2. Push**

```bash
cd ~/Desktop/GlowBeatyNails
git push -u origin main
```

**3. Turn on GitHub Pages**

Repo → **Settings** → **Pages** → Source: *Deploy from a branch* →
Branch: `main`, folder: `/ (root)` → **Save**.

### Why SSH and not HTTPS

The first attempt used HTTPS, which signs in through GitHub's **REST API**.
That API was in a partial outage and returned `503`, so Git Credential Manager
fell back to sending empty credentials and reported the misleading error
`Invalid username or token`.

SSH authenticates over port 22 and never touches that API, so it works even
while the API is degraded.

To move back to HTTPS later:

```bash
git remote set-url origin https://github.com/silencio4/glow-website.git
```

### ⚠️ The commit email is public

Commits are authored as `giorgosid20@gmail.com`. **In a public repository this
address is permanently visible** through GitHub's API, and spam bots harvest
it.

To use GitHub's private noreply address instead — find yours under
GitHub → Settings → Emails, it looks like `12345678+silencio4@users.noreply.github.com`:

```bash
git config user.email "12345678+silencio4@users.noreply.github.com"
git rebase --root --exec 'git commit --amend --no-edit --reset-author'
```

Commits still link to your profile and still count toward your contribution
graph. **Do this before the first push** — afterwards the old address stays in
the public history permanently.

---

## Running it locally

```bash
npx http-server . -p 4173 -c-1
```

Then open <http://localhost:4173>. Opening `index.html` directly as a file also
works, though the map iframe may not load.

## Editing the site

See **[EDITING.md](EDITING.md)** — written for non-developers. Covers changing
text, swapping photos, adding services, changing colours safely, and undoing
mistakes.

## Images

`optimize-images.mjs` regenerates the web-sized images from the originals in
`MEDIA/`. It always reads from the originals, so it's safe to re-run.

```bash
npm install sharp
node optimize-images.mjs
```

Current weight: **656KB** of WebP across 11 images, down from 9.3MB of
unoptimised JPEGs.
