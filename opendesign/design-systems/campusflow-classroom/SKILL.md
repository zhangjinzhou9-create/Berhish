# CampusFlow Classroom Editorial

Use this design system for CampusFlow web pages and classroom-presentation views.

## Product intent

CampusFlow is a compact classroom web-service project. The interface should look authored and memorable before it tries to look enterprise-ready. Keep the API functions visible, but present them as supporting details rather than as the brand story.

## Visual direction

- Japanese slice-of-life editorial mood translated into original web compositions.
- Cinematic crops, manga-panel rhythm, off-white paper, black ink, vermilion marks.
- Uneven torn-paper frames and controlled overlaps; one focal image per page, supporting images kept quieter.
- Strong differences between Today, Profile, and Account layouts while preserving shared typography, navigation, and interaction rules.
- Use real CampusFlow photographs. Apply the shared muted treatment so no incidental image dominates.

## Rules

1. Use `tokens/colors_and_type.css` for all colors, type, spacing, and motion.
2. Use Shippori Mincho for expressive display text and Zen Kaku Gothic New for interface copy.
3. Default page background is paper, not glass or a full-bleed photo.
4. Buttons are compact and rectangular. Reserve the filled vermilion button for the primary action.
5. Photos use `object-fit: cover`, subtle desaturation, and a warm paper overlay.
6. Page navigation represents three distinct views: `Today`, `Profile`, and `Account`.
7. Transitions should reveal hierarchy: page enters, headline follows, collage settles last.
8. Avoid generic dashboard card grids, excessive pills, gradients, emoji, and “international student forum” positioning.

## Content voice

Short, observational, and confident. Prefer “A quiet Thursday in Kyoto” over explanatory product slogans. Functional labels remain literal.

## Source material

The system is derived from:

- `backend/src/main/resources/static/index.html`
- `backend/src/main/resources/static/style.css`
- `backend/src/main/resources/static/script.js`
- `backend/src/main/resources/static/assets/campus-*.jpg`
