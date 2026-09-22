# Running Awards in Codex

Apply these runtime mappings when using the shared Awards skills in Codex. The design workflow, phase boundaries, evidence requirements and output files stay the same.

## Files and commands

The installed plugin root is **two directories above the folder containing the active `SKILL.md`**: `skills/craft/../..`, for example. Resolve it from the skill's supplied absolute path, not from the user's project or a fixed cache location. The whole plugin must be installed together because `references/`, `recipes/`, `scripts/`, `assets/` and sibling skills live outside individual skill folders.

`${CLAUDE_PLUGIN_ROOT}` in the shared instructions means that resolved plugin root. Substitute the absolute root into each path and command before calling a tool; Codex need not provide this environment variable, and shell exports need not survive between calls. Quote paths that contain spaces. Run project commands from the user's project directory so `.awards/`, `AWARDS.md` and `DESIGN.md` are written there.

`$ARGUMENTS` means the user's request and any supplied flags. Claude's `Read`, `Glob`, `Grep` and `Bash` names mean the available file-reading, search and shell tools. `AskUserQuestion` means an available user-input tool, or a concise question in the conversation when none is available; respect that tool's limits on option counts. Open screenshots with an image-viewing tool; reading PNG bytes is not visual inspection. If Context7 is unavailable, consult the library's official documentation using available web tools and state anything you could not verify.

## Environment and captures

Before implementation or the first capture, run `scripts/doctor.mjs <project-dir> --json` through its resolved absolute plugin path. Do it once per environment, then again after setup changes; an absent future project directory means checking its existing parent first. Read the individual checks: continue independent source/design work while naming missing browser evidence, and do not change host permissions to make a check green.

`capture.mjs --states <json-file>` adds menu-open, keyboard-focus, drag or reload checkpoints to the normal captures. Follow [the shared state-plan format](capture-states.md), preserve the plan path in the handoff, and pass it to the juror with the captures. No client-specific action runner is needed.

## Skill handoffs

`/awards:craft` in Claude Code is `$awards:craft` in Codex; the same mapping applies to every phase. When instructed to invoke `awards:<phase>` with the Skill tool, load the sibling `skills/<phase>/SKILL.md` using Codex's skill mechanism or read that file directly, then follow it with the brief, target, flags and project paths. Do not skip its instructions or invent an unavailable Skill tool. Non-jury phases may run in the current agent; the shared instruction to avoid inline work means use the named skill's procedure instead of improvising its work.

Keep the user's scope: a request for one component or one phase does not authorize a whole-site build. Read each phase only when needed and preserve the existing standalone stopping points.

## Jury isolation

Claude's `context: fork` and `agent: awards-jury` frontmatter do not establish a fresh Codex context. When a jury is needed and fresh-agent delegation is available, dispatch a new agent without the build conversation. Give it the installed paths to `skills/jury/SKILL.md`, `agents/awards-jury.md` and this reference, plus the input packet from the agent file: target, captures, interaction-plan path, audit, AWARDS.md path, component selector and verdict flag. Include the project working directory, but no proposed scores or conclusions. Use an available agent type; do not assume `awards-jury` is registered in Codex.

A delegated juror reads the skill and agent procedure and performs the review itself; it does not spawn another jury. It may write only the jury report and the specified AWARDS.md log/status entries. The caller relays the disposition and scores unchanged, then routes the next authorized phase. Keep the existing limit of two jury rounds unless the user requests more.

If fresh-agent delegation is unavailable, disclose that the review uses the current context and follow the same evidence-first procedure. Do not describe that review as independent. Missing captures still require `recapture`; do not invent visual evidence.

## Audit hook

The bundled `hooks/hooks.json` is configured for Claude Code's `Edit|Write` events. Do not assume it runs after Codex edits. After an edit batch in a project with `AWARDS.md`, run the bundled `scripts/audit.mjs <project-dir> --quick` explicitly, substituting its absolute installed path. Keep the full audit and capture checks at the phase boundaries. No global hook or permission changes are needed.
