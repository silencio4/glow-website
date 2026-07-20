# How to change things

Everything lives in three files. You don't need a build step, a framework, or
Node — just a text editor. (Node is only needed for the image script.)

| File | What's in it |
|---|---|
| `index.html` | All the text and page structure |
| `assets/css/style.css` | All colours, fonts, spacing, layout |
| `assets/js/main.js` | Menu, gallery lightbox, scroll highlighting |

**Editor suggestion:** [VS Code](https://code.visualstudio.com/) — free, and it
colour-codes the file so it's easier to see what you're changing.

---

## The golden rule

Change what's **between** the tags, not the tags themselves.

```html
<h3 class="service-card__title">Νύχια</h3>
                               ↑─────↑
                    only this part is the text
```

If you delete a `<` or `>` by accident, the page will look broken. Undo with
Ctrl+Z and try again. Nothing is permanent — and with git, you can always get
the last working version back (see the bottom of this file).

---

## Change some text

Open `index.html`, use Ctrl+F to search for the text you want to change, type
the new text, save, and refresh the browser. That's the whole process.

## Change the phone number

It appears in **five** places. Search for `2314` and replace every one. Note
that the `tel:` links use the international format:

```html
<a href="tel:+302314020845">2314 020 845</a>
        ↑ international       ↑ what people see
```

Also update `"telephone": "+302314020845"` near the top of the file — that's
the block that tells Google about your business.

## Fill in the placeholders

Anything highlighted **yellow** on the page still needs your real information.
Search for `TODO` in `index.html`. There are four:

1. Street address (three places — contact section, the Google block near the
   top, and the map link)
2. Opening hours
3. Email address
4. Facebook link (delete the comment line if you don't have a page)

After you replace a value, delete `class="todo"` from that line so the yellow
highlight disappears:

```html
<span class="todo">[Οδός & αριθμός]</span>     ← before
<span>Εγνατίας 100</span>                       ← after
```

---

## Add or remove a service

Each service is one `<article class="service-card">` block. To **remove** one,
delete from `<article` to its matching `</article>`.

To **add** one, copy an existing block and change the text:

```html
<article class="service-card">
  <h3 class="service-card__title">Μασάζ</h3>
  <p class="service-card__desc">
    Χαλαρωτικό μασάζ σώματος με αιθέρια έλαια.
  </p>
  <ul class="service-list">
    <li>Μασάζ πλάτης</li>
    <li>Μασάζ πλήρους σώματος</li>
  </ul>
</article>
```

The grid rearranges itself — you don't need to touch the CSS.

## Add a service to an existing card

Add one line inside that card's `<ul class="service-list">`:

```html
<li>Ημιμόνιμο σχέδιο</li>
```

## Put prices back

If you change your mind, add the price into the same line:

```html
<li>Ημιμόνιμο μανικιούρ — από 20 €</li>
```

---

## Swap or add a photo

1. Put the new photo in the `MEDIA/` folder
2. Open `optimize-images.mjs` and add a line to the list:

```js
['my-new-photo',  'nail-art',  1200],
//  ↑ part of the       ↑ the name    ↑ max width
//    filename            you want      in pixels
```

3. Run it once:

```bash
npm install sharp
node optimize-images.mjs
```

This creates `assets/img/nail-art.jpg` and `assets/img/nail-art.webp`.

4. Reference it in `index.html`. Copy an existing gallery block and change the
   **four** places the name appears, plus the width and height that the script
   printed:

```html
<li>
  <button type="button" class="gallery-item"
          data-src="assets/img/nail-art.jpg"
          data-caption="Σχέδιο σε ημιμόνιμο."
          aria-label="Μεγέθυνση φωτογραφίας: σχέδιο σε ημιμόνιμο">
    <picture>
      <source srcset="assets/img/nail-art.webp" type="image/webp">
      <img src="assets/img/nail-art.jpg"
           alt="Νύχια με ημιμόνιμο βερνίκι και λευκό floral σχέδιο."
           width="1200" height="900" loading="lazy" decoding="async">
    </picture>
    <span class="gallery-item__zoom" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4 4M11 8v6M8 11h6"/></svg>
    </span>
  </button>
</li>
```

**Three things that matter here:**

- **`alt`** must *describe the photo* for blind visitors. "Νύχια με ημιμόνιμο
  και λευκό σχέδιο" — not "φωτογραφία" or "IMG_4821". This is a legal
  accessibility requirement, not a nice-to-have.
- **`width` and `height`** must match the real pixel size the script reported.
  They stop the page from jumping around while images load.
- **`.webp` and `.jpg`** must both point at the same picture.

---

## Change the colours

All colours are defined once at the top of `assets/css/style.css`. Change them
there and they update everywhere on the site.

```css
--sage-700: #445739;   /* text + buttons — 7.9:1 on white ✓AAA */
```

### ⚠️ Read this before changing any colour

The site is WCAG 2.1 AA compliant, and colour contrast is the easiest thing to
break. Text must be at least **4.5:1** against its background.

Your brand green `#7A8F6B` is only **3.1:1** — which is why it is used for
backgrounds and never for text. If you make `--sage-700` lighter, the site
stops being compliant.

**Before changing a text colour**, paste both colours into
[WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) and
confirm it passes AA. Each colour in the file has its measured ratio in the
comment beside it — keep those comments accurate if you change a value.

## Change the fonts

Two places, and they must match:

1. The Google Fonts link near the top of `index.html`
2. `--font-display` and `--font-body` in `style.css`

Pick fonts that support **Greek** — many popular ones (Playfair Display, Jost,
Poppins) do not, and your text will fall back to an ugly default. On Google
Fonts, filter by "Greek" in the language dropdown.

---

## Test before you publish

```bash
npx http-server . -p 4173 -c-1
```

Open <http://localhost:4173>. Check:

- [ ] Does it look right on your phone? (narrow the browser window)
- [ ] Does the menu open and close on a narrow screen?
- [ ] Do the gallery photos open when clicked?
- [ ] Press **Tab** repeatedly — can you see a dark outline moving through
      every link and button?
- [ ] Press **Esc** with a photo open — does it close?

---

## Publish your changes

```bash
git add -A
git commit -m "Update opening hours"
git push
```

If GitHub Pages is switched on, your live site updates in about a minute.

## Undo a mistake

Discard changes you haven't committed yet:

```bash
git restore .
```

See what you changed recently:

```bash
git log --oneline
```

Go back to how one file looked at an earlier commit (use the code from
`git log`):

```bash
git checkout 4da9017 -- index.html
```

This is the real benefit of having the site in git — **you cannot permanently
break it.** Every saved version is recoverable.
