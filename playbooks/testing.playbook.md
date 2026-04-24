# Testing Playbook

## Purpose
Define how tests are written, structured, and verified across all task types.

---

## When to Use

- Any milestone that produces new functions, classes, or modules
- Any milestone that changes existing behaviour
- Bug fixes (always add a regression test)
- API endpoints (always add contract tests)

---

## Test Pyramid

Follow this ratio unless the plan explicitly overrides it:

```
         [E2E]          ← few, slow, high confidence
        [Integration]   ← moderate, test module boundaries
       [Unit]           ← many, fast, test pure logic
```

- Unit tests are the default
- Integration tests are required when crossing a boundary (DB, HTTP, filesystem, queue)
- E2E tests are required only when the Deployment Target specifies observable user behaviour

---

## Required Steps

### 1. Test Before Code (Where Possible)

- Write the test stub or failing assertion before implementing
- Defines the contract the implementation must satisfy
- Acceptable to write test immediately after implementation when TDD is impractical

---

### 2. Test Naming

Use the pattern: `test_<what>_<condition>_<expected_result>`

Examples:
- `test_create_user_valid_input_returns_201`
- `test_login_wrong_password_returns_401`
- `test_parse_config_missing_key_raises_error`

---

### 3. Test Structure — AAA

Every test must follow Arrange → Act → Assert:

```
# Arrange
input = build_valid_user()

# Act
result = create_user(input)

# Assert
assert result.status == 201
```

No implicit setup. No mixed concerns per test.

---

### 4. Coverage Minimums

| Scope | Minimum |
|---|---|
| New public functions | 100% |
| New modules | 80% line coverage |
| Bug fixes | Regression test required |
| Integration boundaries | At least one happy-path + one failure |

These are floors, not targets. Do not game coverage with trivial tests.

---

### 5. Test Isolation

- Tests must not depend on each other's side effects
- Tests must not share mutable state
- Use setup/teardown or fixtures to manage state
- Mock all external dependencies (DB, HTTP, clock, filesystem) unless it's an integration test

---

### 6. Failure Scenarios Are Mandatory

For every public function or API endpoint, include at least one test that:
- Passes invalid or missing input
- Triggers an error path
- Verifies the error message or status code

---

### 7. Verify Commands

Every milestone using this playbook must include:

```
# Run all tests
<test runner command>
Expected: 0 failures, 0 errors

# Run with coverage
<test runner command with coverage flag>
Expected: meets minimums above
```

---

## Anti-Patterns

- Tests that only test the happy path
- Assertions like `assert result is not None` with no real check
- Tests coupled to implementation details (test behaviour, not internals)
- Skipped or commented-out tests committed to main
- Coverage as the only metric (test quality matters more than percentage)
- No mocking of external dependencies in unit tests
