---
type: tool_order
before: { tool: Skill, input_match: '"skill"\s*:\s*"(?:awards:)?concept"' }
after: { tool: Skill, input_match: '"skill"\s*:\s*"(?:awards:)?system"' }
---

The phase order craft promises: the direction is dealt and locked before tokens are chosen. Also
fails when either skill never ran.
