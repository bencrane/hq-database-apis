# Post-Mortem: Unintended Modification of Discovery Endpoints

**Date:** 2026-01-09
**Severity:** High (mission-critical codebase)

## Incident Summary

During a route renaming operation, discovery endpoints were unintentionally modified due to a non-surgical find-and-replace operation.

## What Happened

1. Task: Rename `/api/companies` to `/api/companies/firmo`
2. Action taken: Used `replace_all` with pattern `/api/companies`
3. Unintended result: All strings containing `/api/companies` were matched, including `/api/companies/discovery`, which became `/api/companies/firmo/discovery`
4. Compounding error: Attempted a second bulk replacement to "fix" the issue rather than reverting and doing it correctly

## Root Cause

**Lazy pattern matching.** A broad substring match was used when the task required exact, targeted edits. The following steps were not taken:
- Consider all strings that would match the pattern
- Verify the scope of changes before executing
- Use precise replacement targets (e.g., exact path strings with delimiters)

## Impact

- Documentation temporarily contained incorrect paths
- Time wasted on corrections
- Eroded confidence in the quality of work

## Standards for This Project Going Forward

1. **No bulk find-and-replace on path strings.** Edit each occurrence individually or use exact-match patterns with surrounding context.

2. **Verify scope before execution.** When modifying multiple occurrences, first search to see all matches and confirm each should change.

3. **Understand the full requirement before acting.** Execution began before fully understanding that discovery endpoints were a separate concern. The complete picture should have been confirmed first.

4. **When uncertain, ask.** Do not assume. This codebase requires precision.

5. **If an error occurs, stop and reassess.** Do not layer fixes on top of mistakes.
