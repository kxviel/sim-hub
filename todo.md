# TODO

## Lifecycle and results

Recommendation only. Implement this after the backend response contract is stable.

### 1. Make the submission lifecycle explicit

Keep one small lifecycle model shared by every simulator:

- [ ] Support `idle`, `uploading`, `queued`, `running`, `completed`, `failed`, and `cancelled`.
- [ ] Store the backend run ID, project name, simulator, current stage, message, submitted time, started time, and completed time.
- [x] Treat submission acceptance and simulation completion as separate events.
- [ ] Preserve the active run when the setup panel is collapsed or the user switches tabs.
- [x] Ignore late responses from an older submission after a new run starts.
- [x] Never show a fake percentage. Use an indeterminate progress indicator unless the backend supplies real progress.

### 2. Improve lifecycle presentation

- [ ] Replace the single status box with a compact timeline: `Uploading -> Queued -> Running -> Complete`.
- [ ] Show the current stage, elapsed time, project name, and simulator without making users inspect logs.
- [ ] Keep the result panel stable while status changes so the layout does not jump.
- [ ] Show clear actions for each terminal state: retry after failure, download after completion, and start another run.
- [ ] Put technical details such as the run ID and raw backend message in a collapsible details area.
- [x] Keep status updates accessible with `aria-live="polite"`; announce failures assertively.

### 3. Prefer server-sent events, retain polling as fallback

- [ ] Prefer Server-Sent Events for one-way lifecycle updates from the backend.
- [ ] Use WebSockets only if the product later needs interactive bidirectional control, such as pause, resume, or live terminal input.
- [ ] Add progressive backoff after the backend defines expected queue durations. Current polling stops on terminal states and can be refreshed manually.
- [ ] Pause fallback polling while the app is offline and resume when connectivity returns.
- [ ] Show a subtle reconnecting state instead of changing the simulation to failed after one network error.

### 4. Use a structured result contract

Ask the backend to return one predictable result shape instead of simulator-specific loose objects:

```ts
type SimulationResult = {
	runId: string;
	status: "completed" | "failed";
	summary: ResultValue[];
	sections: ResultSection[];
	artifacts: ResultArtifact[];
	warnings: string[];
};
```

- [ ] Let `summary` contain the few values most users need first.
- [ ] Let `sections` represent grouped tables, key-value values, text, or chart-ready series.
- [ ] Let `artifacts` contain a stable ID, filename, content type, size, and download URL.
- [x] Keep a generic key-value/JSON fallback so a new simulator can return useful results before it gets a custom renderer.
- [ ] Add subtype-specific result renderers only when a simulator genuinely needs one.

### 5. Present results progressively

- [ ] Lead with a concise result summary: outcome, duration, primary values, and warnings.
- [ ] Group secondary values into named sections instead of one long flat list.
- [x] Format values with units supplied by the backend; do not hard-code scientific units in the UI.
- [ ] Add tables or charts only when the returned data benefits from them.
- [ ] Provide an expandable raw-result view for developers and advanced users.
- [ ] Distinguish `no result yet`, `completed with no metrics`, `partial result`, and `failed` states.

### 6. Improve result downloads

- [ ] List downloadable artifacts individually with filename, type, and size.
- [x] Keep one primary result-download action when the backend provides an archive.
- [x] Show download preparation and failure states instead of silently opening a URL.
- [ ] Request a fresh download URL when temporary URLs expire.
- [x] Do not mark the simulation message as `download started`; download state should be separate from run state.

### 7. Keep the frontend boundaries simple

- [x] Keep request/response parsing in `home.api.ts`.
- [x] Keep lifecycle orchestration in `useHome.ts`, or extract one `useSimulationRun` hook if `useHome` becomes difficult to scan.
- [x] Keep `SimulationResults.tsx` focused on presentation.
- [ ] Put shared result types in one small module only when both the API and UI need them.
- [x] Avoid a generic renderer framework until at least two simulators require the same extension point.

### 8. Edge cases to cover

- [x] Duplicate submit clicks and accidental double runs.
- [ ] Submission succeeds but the first status request fails.
- [ ] The app restarts while a simulation is running.
- [ ] The backend returns an unknown lifecycle status.
- [ ] Result data is partial, empty, malformed, or contains unknown fields.
- [ ] The run completes after the user changes simulator subtype.
- [ ] The network goes offline and later reconnects.
- [ ] A run remains queued or running beyond the expected time.
- [ ] A result artifact is missing, expired, or too large to download comfortably.
- [ ] One simulator finishes immediately while another runs for hours.

### Definition of done

- [ ] Users can always tell whether a run was accepted, queued, running, completed, or failed.
- [ ] Refreshing or reopening the app can restore an active run when the backend supports lookup by run ID.
- [ ] Lifecycle updates stop cleanly on completion, failure, cancellation, or unmount.
- [ ] Every completed run has a readable summary or an honest empty-result state.
- [ ] Downloads expose progress/errors independently from simulation status.
- [ ] A new simulator can use the generic lifecycle and result UI without editing existing subtype components.

## Deferred frontend work

### CSV examples and starter templates

- [x] Add validated downloadable examples for CP2K, GPAW, Octopus, and Siesta from source's `sample_inputs`.
- [x] Keep backend validation schemas in `reference-data/csv_partial_templates`, separate from downloadable examples and `test-inputs`.
- [ ] Add user-owned starter files for the remaining CSV-based simulators when complete runnable examples become available; do not publish partial validation schemas as uploads.
