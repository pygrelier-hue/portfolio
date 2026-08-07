# Portfolio — Pierre-Yves Grelier

Two-page static site, clean editorial design:
- `index.html` — hero, about, skills, contact
- `projects.html` — the full Work grid (all projects, filterable by category)

Both pages share `style.css`, `projects.js` (your project data) and
`script.js`. No server, no build step — works by just double-clicking either
HTML file.

## Adding a project

1. Put your still frame in `images/` (e.g. `images/my-project.jpg`) and, if you
   have one, a short compressed clip in `videos/` (e.g. `videos/my-project.mp4`,
   ideally under ~10 seconds, no audio needed — it autoplays muted on hover).
2. Open `projects.js` and add a block inside the `[ ]` (copy-paste an existing
   line and edit it — keep the commas between entries):

```js
{ "title": "Project name", "category": "Brand film", "image": "images/my-project.jpg", "video": "videos/my-project.mp4", "link": "", "size": "large", "focus": "50% 50%" },
```

- `title`: name shown on the block, and in the preview popup
- `category`: project type (Brand film, Corporate event, Fitness, F&B, Documentary, Travel...) — this also drives the category pills on both pages
- `image`: path to your still frame — used as the poster, and as the fallback if no video is set
- `video`: optional — a short clip that plays on hover (desktop) / tap (mobile). Leave out or set to `""` to show only the still frame.
- `link`: optional — if filled in, the preview popup shows a "Watch full video" link to this URL (e.g. YouTube/Vimeo). Leave `""` if you don't want a link.
- `size`: controls how tall the full-width block is on the Work page — `small`, `large`, `wide`, `tall`
- `focus`: optional — which part of the frame stays centered when it's cropped to fill its block, as a CSS `object-position` value like `"70% 30%"` (horizontal% vertical%). Useful when the subject isn't in the middle of the shot. Defaults to `"50% 50%"` (centered) if omitted.

The Work page is a vertical stack of full-width, full-screen project blocks (editorial style) — visitors scroll down to browse, and clicking a project opens it larger in a preview popup. A row of pill buttons at the top filters the grid by category.

3. Save `projects.js`, reload the page in your browser — the project shows up automatically on both the About-page category preview and the Work page.

## Browsing by category

On the About page (`index.html`), the Filming block has clickable category
pills (Brand film, Corporate event, Fitness...). Clicking one reveals an
inline strip of thumbnails for that category — clicking a thumbnail jumps
straight to that project's preview on the Work page. On the Work page itself,
the same pills filter the grid directly, and the filter is reflected in the
URL (`projects.html?category=Fitness`) so you can link/bookmark a filtered
view.

The 13 projects currently in `projects.js` are real frames and clips pulled
from your BrandPromo, CorporateEvent, Fitness, and Lifestyle footage — swap
titles/categories as needed, reorder them, or delete any you don't want to show.

## Hero background

`index.html`'s hero video (`videos/hero-mashup.mp4`) is a short muted loop
stitched together from a ~1.2s clip of every project — regenerate it any time
by re-running the same ffmpeg steps used to build it (extract a clip per
video, normalize to 1280×720/24fps, concat, no audio) if you add or swap
project clips.

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

Two things to personalize directly in `index.html` once you have them:
- The 3 links in the Contact section (`data-placeholder="portfolio|instagram|linkedin"`) — replace the `href="#"` with your real URLs.
