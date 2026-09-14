# Example: bounded Copilot worker task

## EVERLOOM WORKER TASK

### Objective
Add a `--check` flag to an existing formatter command without changing default formatting behaviour.

### Context
The repository already has a formatter. CI needs a non-mutating mode that exits non-zero when files would change.

### Relevant files
- `src/formatter.py`
- `tests/test_formatter.py`
- `README.md`

### Constraints
- Do not create a second formatter implementation.
- Preserve default command behaviour.
- Do not add new runtime dependencies unless unavoidable.

### Acceptance criteria
- `formatter --check <path>` makes no file changes.
- Exit code is 0 when formatting is already clean.
- Exit code is non-zero when formatting would change files.
- Existing formatter tests continue to pass.
- New behaviour is documented.

### Verification
```bash
pytest -q
python -m formatter --check tests/fixtures/already_clean
python -m formatter --check tests/fixtures/needs_formatting; test $? -ne 0
```

### Deliverables
- implementation
- tests
- README update
- reviewable commit or PR

## Example completion report

**Status:** VERIFIED

**Changes made:** Added non-mutating `--check` mode to the existing formatter path and tests for clean/dirty inputs.

**Files changed:** `src/formatter.py`, `tests/test_formatter.py`, `README.md`.

**Verification:** `pytest -q` passed; clean fixture returned 0; dirty fixture returned non-zero and remained unmodified.

**Unresolved issues:** None.

**Recommended next task:** Orchestrator records the verified result in `.everloom/LEDGER.md` and advances to the next release blocker.

This example demonstrates the required flow: Everloom objective → bounded worker assignment → implementation → verification → structured completion report → durable checkpoint/resume state.
