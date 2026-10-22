# Kitchen Kiosk Constitution

## Document status

- **Status:** Adopted project working agreement.
- **Version:** 1.0.
- **Established / last reviewed:** 2026-10-22.
- **Audience:** Maintainers, contributing developers, and coding assistants.
- **Scope:** This repository's development, documentation, and delivery practices.
- **Companion:** [Application specification](app.spec.md).

This is an ordinary Markdown project document; no special constitution parser or
framework is assumed. Its initial content is grounded in the current repository,
Git history, and the available 2026-10-22 conversation. It is not a transcript of
every prior discussion. Older conversations were not retrievable during creation;
additional decisions must be supplied or recovered from verifiable evidence.

## 1. Purpose and product boundaries

Kitchen Kiosk is a self-hosted recipe-management application. It provides a
browser UI and REST API backed by MySQL. Preserve its straightforward operation:
one application service serves the API and built frontend; MySQL is a separate
service. A reverse proxy is optional for HTTPS and external access.

Treat the [application specification](app.spec.md) as the record of current
capabilities, constraints, decisions, and known validation gaps. Do not present a
wishlist or an untested deployment as completed functionality.

## 2. Sources of truth

Use each source for its intended purpose:

| Source | Responsibility |
| --- | --- |
| This constitution | Shared engineering and documentation principles |
| [Application specification](app.spec.md) | Agreed application behavior and implementation status |
| Source, manifests, configuration, tests | Evidence of actual implementation and executable constraints |
| [Main README](../README.md) | Entry point, native installation, and developer workflow |
| [API guide](../Kiosk.Api/README.md) | Detailed API and configuration contracts |
| [Web guide](../Kiosk.Web/README.md) | User workflows and frontend development |
| [Docker quickstart](../quickstart.md) | Container operations, persistence, backup, and acceptance checks |
| Git history and reviewed changes | Traceability of delivered changes |

If these disagree, report the conflict. Inspect the implementation, clarify intent
where necessary, and update the affected sources together. Documentation alone
does not prove a feature works, and an accidental implementation detail is not
automatically a new product requirement.

## 3. Start-of-work protocol

For every future project conversation or task:

1. Read this document and the application specification before making project
   recommendations or changes.
2. Read the task-relevant linked documentation and implementation.
3. Check the worktree and preserve unrelated or in-progress changes.
4. Identify compatibility, data, deployment, and authorization effects.
5. Clarify materially ambiguous scope or behavior before implementing it.

The standard [Copilot instructions](../.github/copilot-instructions.md) request
this startup behavior. Arbitrary files under `.copilot/` are not automatically
loaded simply because of their names. Other assistants and developers must adopt
the same protocol explicitly. Instruction discovery depends on client support
and settings; this is guidance, not a deterministic execution hook.

## 4. Architecture and compatibility principles

- Preserve same-origin production hosting of the UI and API unless a separate
  architecture change is explicitly agreed.
- Keep controllers, repository/data access, domain models, and UI responsibilities
  aligned with the existing project boundaries.
- Keep project target frameworks, SDK selection, debugger paths, container images,
  publishing settings, and documentation consistent.
- Check provider compatibility before upgrading framework-dependent packages.
  A .NET runtime upgrade does not require an incompatible EF Core upgrade.
- Reuse existing abstractions and patterns. Prefer the simplest complete solution
  over speculative infrastructure or broad refactoring.
- Make intentional API or UX changes explicit; preserve existing clients and user
  workflows unless a breaking change has been approved.

## 5. Data, identity, and secrets

- Protect recipes, user accounts, favorites, and photo files during upgrades.
- Never commit real passwords, signing keys, environment files, tokens, private
  recipe data, or database exports. Use placeholders and ignored local settings.
- Preserve authorization at the API boundary; frontend visibility is not access
  control. Preserve recipe ownership and administrator rules.
- Treat schema changes as explicit migrations with backup and recovery guidance.
  Do not rely on first-run Docker initialization to upgrade an existing database.
- Never reset persistent volumes, replace secrets, or alter production data as a
  routine troubleshooting step.
- Change bootstrap administrator credentials immediately after initial setup.
- Document operational limitations honestly, including logging that may expose
  sensitive values. Do not describe the application as security-audited without
  evidence of such a review.

## 6. Implementation and validation

- Make focused, complete changes. Do not fix unrelated legacy issues silently.
- Preserve type safety and use existing formatting and naming conventions.
- Surface failures rather than masking them with success-shaped fallback results.
- Update directly related specifications and operational guidance in the same work.
- Run the smallest relevant checks; expand when compatibility or failures require
  it. For runtime migrations, validate the solution build, regression tests,
  publishing, and application startup.
- Record commands, results, and limitations accurately. Distinguish a successful
  HTTP smoke check from an interactive debugger or full end-to-end validation.
- Investigate test failures against a baseline when necessary. Do not call a
  failing suite green, suppress failures, or mislabel existing failures as new.
- Do not claim Docker, browser, ARM, proxy, or production verification merely
  because a configuration exists or a build succeeds.

## 7. Documentation and decision maintenance

Use readable Markdown headings, fenced code blocks with language labels, relative
links, and tables where they improve clarity. Keep secrets out of examples.
Prefer a concise summary plus a link over duplicate endpoint or deployment manuals.

When behavior or architecture changes, update the application specification's
relevant section and decision ledger. Each substantial decision should record:

| Field | Required content |
| --- | --- |
| ID and date | Stable identifier and decision date |
| Status | Accepted, superseded, proposed, or rejected |
| Decision | What was chosen and why |
| Impact | Affected behavior, compatibility, or operational constraints |
| Evidence | Source paths, commit/PR when available, and validation |

Do not invent original decision dates or rationales. Label history inferred from
code or commit messages as reconstructed. Use Git for detailed change history;
do not turn these documents into a log of every edit.

### Intake of new Markdown notes

Weekend notes, proposals, and developer documents can be added under `.copilot/`
or another clearly named project documentation location.

1. Read the new document and establish its author-provided purpose and status.
2. Identify implemented facts, decisions, proposals, and open questions separately.
3. Compare claims with the current specification and implementation.
4. Resolve contradictions with the maintainer before changing established behavior.
5. Incorporate agreed decisions and confirmed implementation into the application
   specification, linking the original note as supporting evidence.
6. Keep unapproved ideas explicitly proposed; never infer completion from a note.
7. Update the specification's supporting-document index when a note is accepted.

Recommended metadata for a new note:

```markdown
# Descriptive document title

- Status: Draft | Proposed | Accepted | Superseded
- Author: Name or team
- Date: YYYY-MM-DD
- Related specification: [Application specification](app.spec.md)

## Context
## Proposal or decision
## Implementation status
## Validation
## Open questions
```

Adjust relative links to the note's actual location. This template is optional;
status, evidence, and clarity matter more than rigid formatting.

## 8. Change control and definition of done

A change is complete when the requested behavior is implemented, relevant checks
have been run and reported, directly affected documentation is current, and known
limitations are explicit. For docs-only changes, check Markdown structure and
links; application builds are unnecessary unless executable content changes.

Constitution amendments require explicit maintainer agreement. Update its version,
review date, and the amendment record. Routine factual updates to the application
specification do not require a constitutional amendment.

### Amendment record

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-10-22 | Established shared governance, startup reading protocol, evidence standards, and Markdown document intake at the maintainer's request. |
