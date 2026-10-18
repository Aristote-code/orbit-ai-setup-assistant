# Orbit — working assessment prototype

A React + TypeScript prototype of the Orbit project setup assistant, built on the Verification-RSSB project's actual AlignUI controls and workspace design.

## Run or build

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Live prototype: [orbit-ai-setup-assistant-aristote.netlify.app](https://orbit-ai-setup-assistant-aristote.netlify.app).

Repository: [Aristote-code/orbit-ai-setup-assistant](https://github.com/Aristote-code/orbit-ai-setup-assistant).

## Included

- Project brief with useful examples and local suggestion generation.
- Review each proposed name, template, and task; accept, edit, remove, undo, or restore.
- Bulk acceptance preserves edits and removed suggestions.
- Real editable names and native due-date fields; no dates assumed automatically.
- Final review before creation; blank-project alternative.
- Saved project list with search, project task completion, task editing and addition.
- JSON export for a portable copy of a plan.
- Browser-local persistence of drafts and projects, including after reload.
- Responsive desktop and phone layouts, native modal focus containment, keyboard controls, and reduced-motion support.

## Visual source

The user requested the Verification-RSSB challenge design exactly. This prototype reuses its 62px rail, 128px header, compact surfaces, contextual panel, original Figma SVGs, Certia/Cloister typography, Hugeicons, and AlignUI Fancy Button, Input, Textarea and Checkbox code. Orbit content replaces the expense-review content inside that shell. The original Verification project was left unchanged.

## Prototype boundary

Generation uses transparent, deterministic rules in `src/model.ts` for reviews, launches, events and general projects. There is no external AI connection, authentication, shared database, or cloud sync. All projects are saved in localStorage on the current browser/device. Export before clearing browser data.

To connect a real AI service later, replace `propose()` through a server API. Keep credentials on the server, preserve per-suggestion human review, and retain the final creation step.

## Source map

- `src/App.tsx`: workspace, setup/review flow, projects, dialogs and persistence.
- `src/model.ts`: suggestion/project types, local generator and project creation.
- `src/components/ui/`: reused AlignUI controls.
- `src/components/Icon.tsx`: reused Hugeicons wrapper.
- `src/alignui.css`: reused control styles and fonts.
- `src/styles.css`: responsive workspace and feature styles.
- `public/reference/`: original reference SVG assets.
- `public/fonts/`: fonts reused from the supplied project. Review font licensing before redistributing commercially.

## Validation

Production build and strict TypeScript checking pass. Browser checks cover local generation, seven-item review, bulk acceptance preserving edits/removals, date editing, creation, task completion, persistence, and mobile blank-project creation. This is frontend prototype validation; no backend is present.

## UX refinement

After feedback that the literal verification layout did not suit project setup, the creation flow now uses a wider working area and a contextual preview, with one primary action per step. Reviewed edits are protected when regenerating. See `docs/ux-audit/audit-report.html` for captured findings.

## Deployment

The production site is hosted on Netlify. Build settings are in `netlify.toml`.

```sh
netlify link --id 2a8dd29d-7dfd-4e7a-a0a4-1707df5c0fea
netlify deploy --prod
```

The initial deployment uses the Netlify CLI. GitHub automatic deployments are not configured.

## Assessment handoff

- [Read the assessment documentation](https://orbit-ai-setup-assistant-aristote.netlify.app/assessment/)
- [Download the seven-page PDF](docs/assessment/Orbit-Assessment-Documentation.pdf)
- Editable source: `docs/assessment/content.json`. Regenerate HTML/PDF with `docs/assessment/build.py` using the dependencies in its `requirements.txt`. Copy the two outputs to `public/assessment/` before deploying changes.
- Run `npm test` for the three model regressions (Node 22.18+), and `npm run build` for TypeScript/production checks.

The documentation is a review draft. The original assessment brief, final Figma structure and assessor access still need confirmation before submission.
