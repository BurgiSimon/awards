---
type: tool_order
before: { tool: Skill, input_match: '"skill"\s*:\s*"(?:awards:)?craft"' }
after: { tool: Skill, input_match: '"skill"\s*:\s*"(?:awards:)?concept"' }
---

The orchestrator owns the run: craft fires first and hands concept the brief, rather than the model
jumping straight to a sub-skill.
