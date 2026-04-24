# Accessibility & Disability Compliance Playbook

## Purpose

Ensure applications are usable by people with disabilities across all platforms (web, mobile, desktop, CLI).

---

## When to Use

- Building or modifying any user interface
- Creating user interactions (input, navigation, feedback)
- Reviewing UX/UI behavior

---

## Core Principles (Universal)

All implementations must satisfy:

1. Perceivable  
2. Operable  
3. Understandable  
4. Robust  

---

## Accessibility Requirements

### 1. Input & Interaction

- All functionality must be accessible without relying on a single input method
- Support:
  - Keyboard navigation
  - Touch
  - Assistive technologies

---

### 2. Focus & Navigation

- Users must always know:
  - Where they are
  - What is selectable
- Navigation must be:
  - Predictable
  - Consistent
- No interaction traps (user must always be able to move forward/back)

---

### 3. Feedback & State

- All actions must provide clear feedback:
  - Success
  - Error
  - Loading
- Feedback must NOT rely solely on:
  - Color
  - Sound
  - Motion

---

### 4. Content Clarity

- Labels must be clear and descriptive
- Instructions must be understandable
- Avoid ambiguous or hidden meanings

---

### 5. Error Handling

- Errors must:
  - Clearly explain the issue
  - Provide guidance to fix it
- Errors must be programmatically associated with the source (input/action)

---

### 6. Visual Accessibility

- Ensure sufficient contrast between elements
- Do not rely solely on color to convey meaning
- Support scalable text / zoom where applicable

---

### 7. Assistive Technology Compatibility

- Ensure compatibility with:
  - Screen readers
  - Voice control systems
  - Accessibility APIs (platform-specific)

- UI elements must expose:
  - Role
  - Name
  - State

---

### 8. Dynamic Behavior

- Changes in UI must be:
  - Announced or discoverable
  - Not disruptive or unexpected
- Avoid sudden context shifts

---

### 9. Timing & Motion

- Avoid time-limited interactions when possible
- Provide controls for animations or motion
- Respect reduced-motion preferences

---

## Platform Adapters (Apply When Relevant)

### Web

- Use semantic structure
- Ensure accessibility tree is correct
- Apply ARIA ONLY when necessary (not as default)

---

### Mobile (iOS / Android)

- Use native accessibility labels and traits
- Ensure proper focus order
- Test with built-in screen readers

---

### Desktop

- Support keyboard shortcuts and navigation
- Ensure UI elements expose accessibility metadata

---

### CLI

- Provide clear, readable output
- Avoid color-only meaning
- Support screen readers (structured output)

---

## Verification (MANDATORY)

A feature is NOT complete unless:

- It can be fully operated without a mouse (or primary pointer)
- It provides clear feedback for all actions
- It is understandable without prior context
- It exposes accessibility metadata where applicable

---

## Anti-Patterns

- Input methods limited to one modality (e.g., mouse-only)
- Missing or unclear labels
- Feedback only through color or sound
- Hidden or unpredictable navigation
- Ignoring assistive technologies