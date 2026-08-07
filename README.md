# Portfolio — Pierre-Yves Grelier

Three-page static site, clean editorial design:
- `index.html` — the Work page (video reel banner + filterable project grid) — this is the homepage
- `about.html` — photo, bio, skills
- `contact.html` — email, social links

All three pages share `style.css`, `projects.js` (your project data) and
`script.js`. No server, no build step — works by just double-clicking any
HTML file.

## Adding a project

1. Put your still frame in `images/` (e.g. `images/my-project.jpg`) and, if you
   have one, a short compressed clip in `videos/` (e.g. `videos/my-project.mp4`,
   ideally under ~10 seconds, no audio needed — it autoplays muted on hover).
2. Open `projects.js` and add a block inside the `[ ]` (copy-paste an existing
   line and edit it — keep the commas between entries):

```js
{ "title": "Project name", "category": "Brand film", "image": "images/my-project.jpg", "video": "videos/my-project.mp4", "link": "", "focus": "50% 50%" },
```

- `title`: name shown on the block, and in the preview popup
- `category`: project type (Brand content, Corporate events, Rightfit, F&B, Travel...) — this drives both the category section headings on the Work page and the category pills. Add a new category name here any time; its section appears automatically once at least one project uses it.
- `image`: path to your still frame — used as the poster, and as the fallback if no video is set
- `video`: optional — a short clip that plays on hover (desktop) / tap (mobile). Leave out or set to `""` to show only the still frame.
- `wideVideo`: optional — a wider version of `video` (e.g. the same clip mirrored side-by-side into a landscape composite) used in the preview popup instead of `video`, so a vertical/portrait clip doesn't leave empty space on the sides of the popup. Leave out to just reuse `video` in the popup too.
- `link`: optional — if filled in, the preview popup shows a "Watch full video" link to this URL (e.g. an unlisted YouTube/Vimeo link). Leave `""` if you don't want a link.
- `focus`: optional — which part of the frame stays centered when it's cropped to fill its square thumbnail, as a CSS `object-position` value like `"70% 30%"` (horizontal% vertical%). Useful when the subject isn't in the middle of the shot. Defaults to `"50% 50%"` (centered) if omitted.

The Work page groups projects into one section per category (Brand content,
Corporate events, F&B, Rightfit...), each with a heading and a row of square
thumbnails — easier to scan than one mixed grid. Clicking a thumbnail opens
it larger in a preview popup, with a "Watch full video" link if you set one.
A row of pill buttons at the top can also filter down to a single category.

3. Save `projects.js`, reload the page in your browser — the project shows up automatically on both the About-page category preview and the Work page.

## Browsing by category

On the About page (`about.html`), the Filming block has clickable category
pills (Brand content, Corporate events, Rightfit...). Clicking one reveals an
inline strip of thumbnails for that category — clicking a thumbnail jumps
straight to that project's preview on the Work page. On the Work page itself
(`index.html`), the same pills filter the grid directly, and the filter is
reflected in the URL (`index.html?category=Rightfit`) so you can link/bookmark
a filtered view.

The 13 projects currently in `projects.js` are real frames and clips pulled
from your BrandPromo, CorporateEvent, Fitness, and Lifestyle footage — swap
titles/categories as needed, reorder them, or delete any you don't want to show.

## Work page reel banner

`index.html`'s banner video (`videos/hero-mashup.mp4`) is a short muted loop
stitched together from a ~1.2s clip of every project. Keep it web-sized: a
short muted loop should stay in the low single-digit MB range. If a new
export comes out oversized, re-encode it for the web, e.g. with ffmpeg:

```bash
ffmpeg -i your-export.mp4 -vf "scale=1280:720:flags=lanczos,fps=24" -an \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 23 -preset slow \
  -movflags +faststart videos/hero-mashup.mp4
```

`-an` strips audio (not needed, it's muted), `-movflags +faststart` moves
the file's metadata to the front so it starts playing immediately instead of
waiting for the whole file to download.

## Going live with GitHub Pages (free)

1. Create a GitHub account at [github.com](https://github.com) if you don't have one.
2. Create a new repository, e.g. `portfolio`. Public, no README (we already have one).
3. On your machine, inside the `portfolio-site` folder:

```bash
git init
git add .
git commit -m "First deploy of the portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/portfolio.git
git push -u origin main
```

4. On GitHub, go to **Settings → Pages** for the repo.
5. Under "Build and deployment", choose **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
6. After 1-2 minutes, your site is live at:
   `https://YOUR-USERNAME.github.io/portfolio/`

For any update afterwards (new project, new frame): edit the files locally, then:

```bash
git add .
git commit -m "Add project X"
git push
```

The site updates automatically within 1-2 minutes.

## Finishing touches

One thing to personalize directly in `contact.html` once you have them:
- The 3 links in the Contact section (`data-placeholder="portfolio|instagram|linkedin"`) — replace the `href="#"` with your real URLs.
