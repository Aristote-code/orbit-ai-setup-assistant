# Orbit prototype

- The user explicitly requested the Verification-RSSB challenge designs exactly, on 18 October 2026. Reuse that project's original 62px rail, 128px header, 333px left panel, 401px right panel, Certia typography, Hugeicons and Figma SVGs, #EBEBEB borders, and AlignUI controls.
- Keep Orbit project content and its human-reviewed setup workflow inside this shell. Do not introduce a wide sidebar, decorative onboarding illustration, large marketing typography, or a different visual direction.
- Use the imported AlignUI primitives for all small controls. Keep layouts and tabs structural.
- Drafts/projects persist in browser localStorage. Generation is local demo logic, clearly disclosed; no live AI service is connected.
- Run typecheck/build and verify relevant interactive flows in the browser after changes.

## UX correction, 18 October 2026

- The user reported that the copied flow felt wrong. Preserve the Verification visual language, but use a two-panel setup layout: a wide working area and contextual preview. This supersedes the earlier three-panel geometry requirement for the setup flow.
- Keep one primary action per step. Do not duplicate Generate, Continue, or Create buttons across panels.
- Show the project as the header identity. Use compact suggestion rows and preview only included items.
- Returning to the description must preserve reviewed suggestions; generating a replacement plan requires an explicit choice.
