# Recipe drafts

Proposed recipes wait here until you decide on them. A draft is an ordinary recipe folder one level deeper, so it builds, runs and verifies like the catalogue's recipes. Nothing in the catalogue counts a draft until it is promoted: not the table, the counts or the contact sheet.

## Review them

```
cd plugins/awards/recipes
npm run dev
```

Open the explorer and choose the **Drafts** tab. Each draft runs live beside its README and source. Mark it:

- **Accept**: you want it in the catalogue.
- **Improve**: say what to change in the notes.
- **Reject**: you don't want it.

Saving writes the draft's `review.json`. That needs the dev server; anywhere else the explorer keeps the decision in your browser and offers it as text to copy.

Then hand the reviews over: *"work the draft reviews"*. Accepted drafts are promoted, drafts marked Improve are changed and come back to you as **Revised** with a reply, and rejected ones are dropped.

## Make one

```
node ../scripts/drafts.mjs new my-idea                     # from _drafts/_template
node ../scripts/drafts.mjs new my-variant --from scroll-pin-scrub   # start from an existing recipe
```

Or ask: *"draft a recipe for …"*. A draft holds the six files of the recipe contract (`index.html`, `main.js`, `style.css`, `README.md`, `recipe.json`, `verify.mjs`). Its relative paths climb one level more (`../../_shared/`), and its `recipe.json` carries `drafted` instead of `added`. The explorer lists whatever still keeps a draft from promotion (a missing file, an unknown tag) under **Checks**.

## The rest of the loop

All of these run from `plugins/awards`:

```
node scripts/drafts.mjs list                              # every draft, its status and your notes
node scripts/verify-recipes.mjs --only <id>               # verify a draft (--drafts runs every draft)
node scripts/gallery-frames.mjs --drafts                  # the drafts' frames for the Drafts tab
node scripts/drafts.mjs reply <id> "what changed"         # after an Improve: back to you as Revised
node scripts/drafts.mjs promote <id>                      # into recipes/<id>: paths, added date, catalogue, explorer, counts
node scripts/drafts.mjs drop <id>                         # delete a rejected draft (git keeps it)
```

Drafts meet the same floor as recipes: CI audits and builds them with everything else.
