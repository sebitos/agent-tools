# API Development Playbook

## Purpose
Guide the implementation of RESTful or service-based APIs with consistency, validation, and maintainability.

---

## When to Use

- Creating new API endpoints
- Modifying existing endpoints
- Adding service-layer logic

---

## Required Steps

### 1. Define Contract First

- Define request/response schema
- Include types for all fields
- Validate required vs optional fields

---

### 2. Input Validation

- Validate all external inputs at boundary
- Reject invalid inputs early (fail fast)
- Return clear error messages

---

### 3. Structure

- Controller/route layer → handles request/response
- Service layer → business logic
- Data layer → DB or external calls

---

### 4. Error Handling

- No raw errors returned
- Map errors to structured responses
- Use consistent error format

---

### 5. Logging

- Log:
  - Requests (if safe)
  - Failures
  - Key decisions
- Do not log sensitive data

---

### 6. Testing

- Test:
  - Valid request
  - Invalid input
  - Edge cases
- Include at least one failure scenario

---

## Anti-Patterns

- Business logic in controllers
- No validation
- Silent failures
- Inconsistent response formats