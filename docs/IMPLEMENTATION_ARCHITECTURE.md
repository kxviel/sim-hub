# Simulation Hub: implementation and architecture blueprint

## 1. Purpose and scope

Simulation Hub is a browser/Tauri client for submitting, monitoring, and retrieving reproducible materials simulations. The project outline describes a simulator catalog rather than one single solver:

- DFT/atomistic: Quantum ESPRESSO, ABINIT, CP2K, BigDFT, SIESTA, Octopus, GPAW, Exciting, and FLEUR.
- FEM/continuum: BFE.NET, MYSTRAN, FEAScript, New_Abaqus, section-properties, MFEM, STAN, FEMWELL, JAX-FEM, and FEBio.
- High-throughput orchestration: ASE, AiiDA, and later FireWorks/AFLOW-style integrations.
- Photonics/FDTD: MEEP.
- Other extensible methods: Monte Carlo and future solvers.

The first production milestone should be one complete, honest vertical slice: authenticated user -> validated Quantum ESPRESSO input -> backend job -> status/progress -> parsed results/downloads. Other catalog entries should remain explicitly marked “planned” until they have a real adapter and backend capability.

## 2. Current state: verified in this checkout

### Already present

- Vite + React + TypeScript client with TanStack Router, React Query, Tailwind, shadcn-style UI components, and optional Tauri packaging.
- Routes `/` and `/home`; the home route currently has its auth guard commented out.
- Login and registration forms using TanStack Form and Zod validation.
- API client using Axios and `VITE_API_BASE_URI`; response errors are normalized into `ApiError`.
- Local-storage session model containing username, email, SSH domain, notifications, and download links.
- Simulation type/subtype catalog for DFT, FEM, high-throughput, and “Others”.
- A CIF tokenizer/parser that attempts to detect elements from `_atom_site_type_symbol` or labels.
- 5 MiB client-side file-size checks and basic required/optional file lists.
- One public Quantum ESPRESSO CSV template.
- Tauri shell, permissions, icons, and Rust entry points.
- Existing Graphify output (`graphify-out/`) documenting the current dependency and import structure; it contains no evidence that the listed solvers are implemented.

### Partially implemented or misleading

- `home.api.ts` submits only `proj_name` and optional `pseudofiles`; the required parameter and structure files are currently commented out.
- The simulation endpoint is called with an empty username slug and the UI reports a successful submission as “Account created.”
- Results are typed as `string[]`, initialized to `[""]`, never populated from the API, and render only a placeholder.
- Quantum ESPRESSO and ABINIT show upload UIs, but ABINIT has no distinct submission contract and both accept any file type.
- CIF parsing exists but is not connected to the upload flow; detected elements do not drive pseudopotential requirements.
- CP2K, FEM, AiiDA, ASE, MEEP, and Monte Carlo currently reuse the Quantum ESPRESSO placeholder component.
- “Download Template” controls are present but do not implement downloads.
- Auth session persistence is client-only. There is no visible bearer/session token, refresh, expiry, logout flow, or server-authoritative session restoration.
- The `/home` route is not protected, and the current API paths (`/login`, `/sign-up`) must be reconciled with the backend contract before release.
- No job polling/streaming, cancellation, retry, validation-error mapping, file upload progress, result parsing, provenance view, or simulator capability discovery is present.

## 3. Target architecture

```text
React/Tauri client
  ├─ Auth/session boundary
  ├─ Simulator catalog + schema-driven forms
  ├─ File staging/validation + upload progress
  ├─ Job list/detail/status stream
  └─ Result/provenance viewers
          │ HTTPS JSON + multipart (or presigned object upload)
API gateway / backend
  ├─ Auth and authorization
  ├─ Simulation/job API
  ├─ Input validation and artifact service
  ├─ Queue/workflow service
  └─ WebSocket/SSE status service
          │ durable job messages
Queue + workers
  ├─ Adapter: Quantum ESPRESSO
  ├─ Adapter: ABINIT/CP2K/... 
  ├─ Adapter: FEM/MEEP/Monte Carlo
  └─ AiiDA/ASE integration where provenance is required
          │ SSH/Slurm/local containers
HPC execution + artifact storage + metadata database
```

### Architectural rules

1. The frontend never constructs solver-specific command lines. It submits a versioned, validated job specification.
2. Each simulator is an adapter implementing the same lifecycle interface: validate, stage, submit, observe, cancel, collect, parse, and cleanup.
3. Raw input/output artifacts are immutable. Parsed summaries are derived data and can be regenerated with a parser version.
4. Every job has a stable ID, idempotency key, owner, simulator/version, input manifest, execution profile, timestamps, status history, and provenance links.
5. Capability metadata is data, not a hard-coded switch statement. The UI renders forms from a simulator schema and displays unsupported capabilities clearly.
6. “Submitted” is not “finished”, and “finished” is not “scientifically valid”. The UI must expose both execution status and parser/validation status.

## 4. Core domain model

```ts
type JobStatus =
  | "draft" | "validating" | "queued" | "staging" | "running"
  | "collecting" | "succeeded" | "failed" | "cancelled" | "expired";

type SimulationJob = {
  id: string;
  ownerId: string;
  simulatorId: string;
  simulatorVersion: string;
  workflowVersion: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  inputManifest: ArtifactRef[];
  executionProfile: ExecutionProfile;
  progress?: { phase: string; percent?: number; message?: string };
  result?: ResultSummary;
  failure?: { code: string; message: string; retryable: boolean };
};

type ArtifactRef = {
  id: string; name: string; mediaType: string; size: number;
  sha256: string; role: "parameters" | "structure" | "pseudopotential" | "mesh" | "output";
};
```

Minimum backend entities: `User`, `Credential/ConnectionProfile`, `Simulator`, `SimulatorVersion`, `Job`, `JobEvent`, `Artifact`, `Result`, `ProvenanceNode`, and `AuditEvent`. Store hashes and metadata separately from large blobs; never use filenames as identity.

## 5. API contract to implement before adding more simulators

Use an OpenAPI document as the source of truth. A minimal contract is:

- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`.
- `GET /simulators` returns simulator IDs, versions, capabilities, schemas, accepted artifact roles, limits, and availability.
- `POST /jobs` creates a draft or validated job and returns `{ id, status, uploadPlan }`.
- `POST /jobs/{id}/artifacts` uploads or confirms artifacts with size/type/hash checks.
- `POST /jobs/{id}/submit` is idempotent and enqueues the job.
- `GET /jobs`, `GET /jobs/{id}`, `GET /jobs/{id}/events` support list/detail/history.
- `GET /jobs/{id}/events/stream` uses SSE or WebSocket; polling remains the fallback.
- `POST /jobs/{id}/cancel` requests cancellation and reports whether it was accepted.
- `GET /jobs/{id}/artifacts/{artifactId}/download` returns an authorized short-lived download.
- `GET /jobs/{id}/provenance` returns the execution DAG and software/input hashes.

All mutating requests should accept an `Idempotency-Key`. Errors should use a stable shape such as `{ code, message, fieldErrors, requestId, retryable }`. Do not leak scheduler commands, SSH credentials, or raw internal paths.

## 6. Simulator adapter contract

```text
SimulatorAdapter
  metadata() -> capabilities and schema
  validate(spec, artifacts) -> field/file diagnostics
  estimate(spec) -> resource estimate and warnings
  stage(job, workspace) -> generated input manifest
  submit(job, workspace, executionProfile) -> external job reference
  observe(externalRef) -> normalized status/progress
  cancel(externalRef) -> cancellation result
  collect(externalRef, workspace) -> output artifacts
  parse(outputs) -> typed result summary + parser warnings
  cleanup(workspace) -> safe cleanup result
```

Implement Quantum ESPRESSO first. Its adapter should validate CSV schema, CIF structure, elemental coverage, pseudopotential mapping, units, k-points, cutoffs, occupations, charge/spin settings, and compatible calculation types before staging `pw.x`/related inputs. Never infer a pseudopotential solely from an arbitrary filename; parse and confirm the element mapping.

Next adapters should be added in this order: ABINIT, CP2K, ASE/AiiDA workflow, MEEP, one representative FEM solver, then the remaining catalog. Each adapter requires a contract test, a small fixture, a failure fixture, a resource estimate, and a result schema.

## 7. Frontend implementation plan

### Phase 0 — contract and safety foundation

- Confirm backend route names, auth response/token model, multipart field names, and whether the backend supports async jobs.
- Remove secrets from `.env` conventions; browser-exposed `VITE_*` values are not secrets. Put internal credentials only on the server.
- Add typed API DTOs generated or checked against OpenAPI.
- Add authenticated route protection, logout, token expiry handling, and a safe session bootstrap.
- Add a global request ID/error presentation policy.

### Phase 1 — real Quantum ESPRESSO vertical slice

- Replace ad hoc subtype switches with a `simulatorRegistry` keyed by stable IDs.
- Build a schema-driven `ArtifactUploader` with required roles, accepted extensions/media types, duplicate handling, per-file and total-size limits, progress, retry, and clear validation.
- Wire CIF upload to element detection, show warnings, require user confirmation for ambiguous labels, and require exactly one compatible pseudopotential per detected element unless the backend has an explicit default.
- Validate CSV headers, duplicate keys, empty values, numeric ranges, scientific notation, booleans, and unsupported parameters before submit.
- Create a job, upload artifacts, submit it, and render the returned job ID/status.
- Implement job detail with status timeline, cancel, retry-as-new-job, raw logs, parsed summary, and authorized downloads.

### Phase 2 — shared job UX and provenance

- Job history with filtering, pagination, owner isolation, status badges, and server-side sorting.
- SSE/WebSocket status with reconnect/backoff and polling fallback.
- Result viewers for energies, forces, stress, convergence, structures, trajectories, bands, DOS, and solver-specific plots; large arrays must be paginated or sampled.
- Provenance graph view: input hashes -> generated files -> scheduler job -> outputs -> parser version.
- Persist user connection profiles without storing private keys in the browser; use server-side secret references or an external secret manager.

### Phase 3 — additional solver families

- Add a family-specific form/schema and adapter per solver; do not clone the QE component.
- Add FEM mesh/geometry/BC/load/solver settings with unit-aware fields and mesh validation.
- Add MEEP geometry/material/source/PML/symmetry/resolution controls with Courant and memory checks.
- Add ASE calculator/workflow configuration and AiiDA provenance/profile selection.
- Add Monte Carlo ensemble, seed, sample count, burn-in, convergence, and uncertainty controls.

## 8. Backend/worker implementation plan

1. API creates a job and stores an immutable input manifest.
2. Validator resolves simulator version and rejects unknown/unsupported fields.
3. Queue accepts only validated, authorized jobs and records an outbox event atomically.
4. Worker leases a job with a heartbeat and timeout; a lease can be recovered after worker failure.
5. Stager creates an isolated workspace with sanitized paths and read-only input copies.
6. Executor runs in a controlled container/HPC allocation with explicit CPU, memory, wall-time, disk, and network policy.
7. Observer normalizes scheduler states and captures stdout/stderr without trusting their contents.
8. Collector checks expected outputs, computes hashes, stores artifacts, and marks missing/partial output explicitly.
9. Parser emits versioned typed results plus warnings; parser failure must not delete raw outputs.
10. Finalizer writes a durable terminal event and releases the lease/workspace.

Use an outbox/event table so a database commit cannot succeed while the queue notification is lost. Use retries only for known transient failures. A user retry must create a new job linked to the original, preserving the failed run for diagnosis.

## 9. Edge-case review from five team roles

### Computational scientist

- Units are mixed or omitted; cell vectors are non-physical; fractional/cartesian coordinates disagree.
- CIF has multiple data blocks, quoted values, uncertainty suffixes, multiline fields, partial rows, disorder, duplicate labels, nonstandard element labels, or no atom-site loop.
- Pseudopotential family/valence does not match the requested functional or element; spin, charge, smearing, k-points, cutoff, and convergence settings are physically inconsistent.
- A solver finishes with a zero exit code but unconverged or incomplete results. Surface convergence warnings and do not call them valid.
- FEM meshes are inverted/degenerate; boundary conditions overconstrain or underconstrain the model; MEEP violates Courant stability or uses incompatible symmetry/source boundaries.

### Distributed-systems/HPC engineer

- Browser disconnects after submit; duplicate clicks create duplicate jobs; workers die mid-run; scheduler reports states out of order.
- Queue starvation, per-user quotas, cluster unavailable, SSH host-key changes, clock skew, disk exhaustion, log truncation, and cancellation races.
- A job completes but artifact upload fails, or output is too large for one response. Make collection resumable and downloads range-friendly.
- A stale status event arrives after a terminal event. Order by server sequence number, not client arrival time.

### Security engineer

- Never expose `BACKEND_API_KEY`, SSH private keys, scheduler credentials, internal hostnames, or arbitrary command arguments to the browser.
- Validate filenames, archive extraction, symlinks, MIME claims, file sizes, decompression ratios, CSV formulas, and path traversal.
- Enforce owner checks on every job/artifact/log/download endpoint; short-lived signed URLs must be scoped to one artifact.
- Rate-limit auth and job creation; audit login, submit, cancel, download, profile changes, and admin actions.
- Sandbox solvers, cap resources, disable unintended network access, scan uploads, redact secrets from logs, and treat solver output as untrusted text.

### Frontend/UX engineer

- Preserve form state during validation, reconnect, route changes, and failed upload; never clear files after a server error without confirmation.
- Handle keyboard-only use, focus after dialogs, reduced motion, screen-reader labels, 320px widths, long filenames, empty/loading/error states, and very large result tables.
- Disable submit while a request is in flight but allow safe retry after a timeout; show “unknown” rather than false failure.
- Explain scientific warnings in plain language and distinguish required errors from advisory warnings.

### QA/release engineer

- Contract tests for every endpoint and adapter; golden fixtures for valid/invalid CSV, CIF, UPF, mesh, MEEP, and solver outputs.
- Test duplicate submit, refresh during upload, browser close, expired token, reconnect, cancellation at every lifecycle phase, worker restart, partial output, and retry.
- Test security limits, ownership isolation, malformed archives, huge numeric values, Unicode filenames, duplicate artifact names, and content/hash mismatch.
- Test deterministic parser results, provenance completeness, schema migration, rollout/rollback, and observability (request ID through worker logs).
- Verify responsive layout at desktop/mobile and Tauri packaging separately; a green TypeScript build is not evidence that a simulation ran correctly.

## 10. Definition of done for the first release

- A user can register/login, reach only authorized routes, create one QE job, and see a stable job ID.
- Required CSV and CIF artifacts are validated client- and server-side; elemental pseudopotential coverage is explicit.
- The backend runs a real or clearly labeled fixture adapter, reports lifecycle state, survives reconnects, and supports cancellation semantics.
- Raw inputs/outputs are downloadable only by the owner; hashes, parser version, solver version, and execution profile are visible.
- Success, solver failure, validation failure, timeout, cancellation, and partial-output states are distinguishable.
- Automated tests cover the contract and the edge cases above; build/typecheck/lint are reproducible from a clean checkout.
- Every catalog entry that is not implemented is visibly marked planned/unsupported and cannot submit through a misleading placeholder.

## 11. Recommended work breakdown

1. Contract freeze and threat model.
2. Auth/session hardening and protected routing.
3. Job/artifact data model and API.
4. QE adapter plus fixture worker.
5. Frontend schema-driven uploader and job detail.
6. Status streaming, cancellation, retries, and downloads.
7. Provenance and observability.
8. ABINIT/CP2K adapters.
9. ASE/AiiDA integration.
10. MEEP and representative FEM adapter.
11. Remaining catalog adapters only when requirements and execution environments are available.

Do not start by building ten simulator forms. Establish the job contract and one trustworthy adapter first; every later solver then becomes an incremental adapter and schema rather than a new architecture.
