# Everloom Verification Contract

Everloom separates implementation from verification so worker output cannot silently become a completion claim.

## Status vocabulary

### IMPLEMENTED
The requested code or artifact exists, but required verification has not yet fully passed.

### VERIFIED
All required automated and manual checks defined for the task have passed and evidence is recorded.

### PARTIALLY VERIFIED
Some required checks passed, but one or more checks could not be performed. Missing checks and the reason must be explicit.

### BLOCKED
A dependency, authorization boundary, unavailable resource, or external condition prevents completion.

### FAILED
The implementation or required verification failed. Record the evidence and safest next action.

## Evidence rules

Useful verification evidence may include:
- passing test output
- successful build/typecheck/lint
- schema validation
- reopened/readable generated artifact
- source-confirmed research claim
- exact commit/PR checks
- deployment health probes
- DNS/HTTPS resolution
- publication confirmation
- externally confirmed transaction or revenue

Configuration, code presence, screenshots of intended settings, or an agent saying “done” are not equivalent to verified runtime behaviour.

## Worker completion rule

Every worker completion report must include:
1. objective
2. status from the vocabulary above
3. files changed
4. verification performed
5. exact result/evidence
6. checks not performed and why
7. blockers or unresolved risks
8. recommended next action

If verification fails, create or update a corrective ledger task instead of marking the original work complete.
