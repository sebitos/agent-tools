# Performance Optimization Playbook

## Purpose
Profile, measure, and improve performance without breaking behaviour or correctness.

---

## When to Use

- Milestone explicitly targets latency, throughput, or memory reduction
- A benchmark or profiler reveals a hotspot
- SLA or Deployment Target specifies a performance threshold

---

## Rules

- DO NOT optimize without a measurement first
- DO NOT change correctness to gain speed
- DO NOT mix performance work with feature development
- All improvements must be validated by the same benchmark before and after

---

## Steps

### 1. Define the Target

Before touching any code, write down:

- What metric you are improving (latency p99, RPS, memory MB, CPU %)
- What the current measured value is (baseline)
- What the target value is (must be in the plan's Deployment Target or Acceptance Criteria)

If no target exists → do not proceed. Add it to the plan first.

---

### 2. Measure (Baseline)

- Run the benchmark or profiler on the unchanged code
- Record the result in the Decision Log
- Identify the single biggest bottleneck (hotspot-first rule)

Tools by type:

| Type | Examples |
|---|---|
| CPU profiling | `py-spy`, `pprof`, `clinic.js` |
| Memory profiling | `tracemalloc`, `heapdump`, `valgrind` |
| HTTP benchmarking | `wrk`, `k6`, `hey`, `ab` |
| DB query analysis | `EXPLAIN ANALYZE`, slow query log |

---

### 3. Hypothesize

- State one hypothesis: "I believe X is slow because Y"
- Implement the smallest change to test that hypothesis
- Do not batch multiple optimizations into one change

---

### 4. Implement

- Make the minimal change
- Keep the optimized and original paths easy to diff
- Add a comment explaining why the optimization exists (not what it does)

---

### 5. Measure (After)

- Run the same benchmark against the changed code
- Compare to baseline
- If improvement is < 10% of target → reconsider hypothesis

---

### 6. Verify Correctness

- Run the full test suite
- No regressions allowed
- If tests fail → revert before proceeding

---

### 7. Document

In the Decision Log, record:

- Baseline measurement
- After measurement
- % improvement
- What was changed and why

---

## Anti-Patterns

- Optimizing without a baseline measurement
- Micro-optimizing non-bottlenecks
- Sacrificing correctness for speed
- Premature caching without profiling
- Rewriting working code in a faster language without data
- Benchmarking with unrealistic inputs
