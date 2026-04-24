---
description: 'Instructions for writing Python code following idiomatic Python practices and community standards'
applyTo: '**/*.py,**/pyproject.toml,**/requirements*.txt,**/setup.py,**/setup.cfg'
---

# Python Development Instructions

Follow idiomatic Python practices and community standards when writing Python code. These instructions are based on [PEP 8](https://peps.python.org/pep-0008/), [PEP 20 (The Zen of Python)](https://peps.python.org/pep-0020/), and the [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html).

## General Instructions

- Write simple, clear, and idiomatic Python code
- Follow PEP 8 for all formatting
- Prefer explicit over implicit (PEP 20)
- Return early to reduce nesting; avoid deeply nested conditionals
- Make the happy path obvious and left-aligned
- Use the standard library before reaching for third-party packages
- Write self-documenting code with descriptive names

## Naming Conventions

- **Modules and packages**: `lowercase_with_underscores`
- **Classes**: `PascalCase`
- **Functions and methods**: `snake_case`
- **Variables**: `snake_case`
- **Constants**: `ALL_CAPS_WITH_UNDERSCORES` at module level
- **Private members**: prefix with single underscore `_private`
- **"Dunder" methods**: `__double_underscore__` only for Python protocols
- Avoid single-letter names except in short loop scopes (`i`, `j`, `k`) or comprehensions

## Type Hints

- Add type hints to all public function signatures
- Use `from __future__ import annotations` for forward references in older Python versions
- Use `Optional[X]` or `X | None` (Python 3.10+) for nullable values
- Use `TypedDict`, `dataclass`, or `Pydantic` models for structured data over raw `dict`
- Never use `Any` unless interfacing with untyped third-party code — justify in a comment

```python
# Good
def get_user(user_id: str) -> User | None:
    ...

# Bad
def get_user(user_id):
    ...
```

## Code Structure

- One class or logical unit per module
- Follow modular architecture: `api/`, `services/`, `models/`, `utils/`, `config/`
- Keep functions under 50 lines; under 30 is preferred
- Avoid global mutable state
- Use `dataclasses` or `Pydantic` models instead of plain dicts for structured data
- Prefer composition over inheritance; use `Protocol` for structural typing

## Error Handling

- Never use bare `except:` — always catch specific exception types
- Never swallow exceptions silently (`except Exception: pass`)
- Raise built-in exceptions where appropriate (`ValueError`, `TypeError`, `KeyError`)
- Define custom exception classes for domain errors, inheriting from `Exception`
- Provide meaningful messages in all raised exceptions

```python
# Good
try:
    result = parse_config(path)
except FileNotFoundError as e:
    raise ConfigError(f"Config file not found: {path}") from e

# Bad
try:
    result = parse_config(path)
except:
    pass
```

## Imports

- Order imports: stdlib → third-party → local (enforce with `isort`)
- Use absolute imports; avoid relative imports except within a package
- Never use wildcard imports (`from module import *`)
- Do not import unused symbols

## Constants

- Define constants at module level in `ALL_CAPS`
- Do not use magic numbers or inline string literals; name them

```python
# Good
MAX_RETRIES = 3
DEFAULT_TIMEOUT_SECONDS = 30

# Bad
for attempt in range(3):
    time.sleep(30)
```

## Formatting & Tooling

- Format all code with `black` (line length 88)
- Sort imports with `isort` (compatible with `black`)
- Lint with `ruff` or `flake8`
- Type-check with `mypy` or `pyright`
- All of these must pass with zero errors before a milestone is marked `done`

## Testing

- Use `pytest` as the test runner
- Mirror the source tree in `tests/` (e.g., `src/services/auth.py` → `tests/services/test_auth.py`)
- Prefix all test functions with `test_`
- Use fixtures for shared setup; never share mutable state between tests
- Use `pytest-mock` or `unittest.mock` to mock external dependencies
- Minimum: one passing test and one failure-path test per public function

## Documentation

- Every public module, class, and function needs a docstring
- Use [Google-style docstrings](https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings)
- Private helpers do not require docstrings unless logic is non-obvious

```python
def create_session(user_id: str, ttl_seconds: int = 3600) -> Session:
    """Create a new authenticated session for the given user.

    Args:
        user_id: Unique identifier of the authenticated user.
        ttl_seconds: Session lifetime in seconds. Defaults to 3600.

    Returns:
        A new Session object with a signed token.

    Raises:
        UserNotFoundError: If no user exists with the given ID.
    """
```

## Dependency Management

- Use `pyproject.toml` with `poetry` or `pip` + `requirements.txt`
- Pin exact versions in `requirements.txt` for production
- Separate dev dependencies (`requirements-dev.txt` or `[tool.poetry.dev-dependencies]`)
- Do not add a dependency if the standard library provides the same functionality
