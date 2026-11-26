# Design skills for Claude Code

Third-party skills committed so everyone on the team (Hendy, Faith, Mike) gets them automatically when Claude Code runs in this repo.
Each is copied unchanged from its official repository; licences are kept beside each one.

| Skill / command | Use it for | Source (commit) | Licence |
|---|---|---|---|
| `/ui-ux-pro-max` | Design decisions and UX checklists: palettes, fonts, touch targets, forms, accessibility. Local search: `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain ux` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (a0d0410) | MIT |
| `/make-interfaces-feel-better` | Polish review: radius, shadows, motion, hit areas, typography details (`quick` or `full`) | [jakubkrehel/make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) (6d9f2f1) | MIT |
| `/impeccable` | Design critique, audit, polish, typeset, layout… (`/impeccable critique <page>`) | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (2fc5e14) | Apache-2.0 (see NOTICE.md) |
| `/web-interface-guidelines <files>` | Vercel's Web Interface Guidelines compliance review (in `.claude/commands/`) | [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) (434b7f9) | MIT |

## Notes
- **Impeccable's launcher** (`.claude/skills/impeccable/scripts/impeccable`) downloads a prebuilt binary from the project's GitHub releases on first run. If you'd rather not run an unreviewed binary, the skill works without it: it falls back to reading the project context directly.
- UI/UX Pro Max needs Python 3 (no extra packages); its search runs fully offline.
- To update a skill, re-copy it from its repository and update the commit in the table above.
