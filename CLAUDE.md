# CropWatch UI — conventions

## Use our own components first

Build CWUI components from other CWUI components wherever one exists, so every
part of the library looks and behaves the same. Reach for a browser built-in
or a hand-rolled copy only when CWUI has nothing for the job.

### Tooltips: always `CwTooltip`, never `title`

- Never put the browser's built-in `title` tooltip on anything in a CWUI
  component (bars, chart parts, truncated text, icon buttons, hints). Wrap the
  trigger in `CwTooltip` instead.
- `CwTooltip` keeps itself on screen and inside clipping parents, and wraps long
  text at 20rem (`--cw-tooltip-max-width`). Use its `class` prop to lay out the
  wrapper, for example to make a whole chart column the hover area. `DliCard`'s
  daily history bars show the pattern.
- What a tooltip says must still reach screen readers. Put the text in an
  `aria-label` or visually hidden text when the trigger is not focusable.
  `CwTooltip` links itself with `aria-describedby` only when its trigger is
  focusable.
