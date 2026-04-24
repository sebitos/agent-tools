# Debugging Playbook

## Purpose
Systematically identify and fix defects.

---

## When to Use

- Failing tests
- Runtime errors
- Unexpected behavior

---

## Steps

### 1. Reproduce

- Confirm the bug exists
- Identify exact failure conditions

---

### 2. Isolate

- Narrow down where the issue occurs
- Identify root cause (not symptoms)

---

### 3. Fix

- Apply minimal change required
- Avoid introducing new behavior

---

### 4. Verify

- Confirm bug is resolved
- Test:
  - Original failure case
  - Edge cases
  - Related functionality

---

### 5. Prevent Regression

- Add test for the bug

---

## Anti-Patterns

- Fixing symptoms instead of root cause
- Large refactors during bug fix
- No verification