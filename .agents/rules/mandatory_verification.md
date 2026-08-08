---
name: mandatory-verification-loop
description: Mandates automatic build checks, runtime verification, and self-healing error testing on every task.
---

# Mandatory Verification & Error Testing Protocol for Gulbi (React/Vite Web App Agent)

1. **Automatic Error Testing**: Automatically run build/test commands on every code modification.
2. **Self-Healing Loop**: Inspect error tracebacks, fix root causes, and re-test until clean success.
3. **No Unverified Declarations**: Never claim completion without empirical runtime test evidence.
