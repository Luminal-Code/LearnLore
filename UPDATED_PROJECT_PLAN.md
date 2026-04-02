# LearnLore Project Plan Rewrite: Outcome-Driven Study OS

## Summary

Rewrite [PROJECT_PLAN.md](/home/maxum/projects/personal/javascript/learnlore/PROJECT_PLAN.md) from a narrow "notes to stories" roadmap into a product and architecture spec for a student-first, institution-ready study operating system.

The new plan should define LearnLore as:

- A college-student study platform optimized for retention and measurable study outcomes.
- Student-subscription first for go-to-market.
- Institution-ready by design so colleges can be added later without a data-model rewrite.
- Built around evidence-backed learning behaviors, not just AI content generation.

The central product promise should be:

> LearnLore turns any topic or notes into a complete study loop: understand, encode, practice, review, track, and improve.

This replaces the old promise:

> "AI-powered stories for memorization"

with:

> "AI-powered study OS for effective learning and durable retention"

## Why This Rewrite Is Necessary

The current plan is stale relative to the repo and too weak for the ambition you described.

Current document issues:

- It presents LearnLore as mainly a story generator.
- It does not define the sticky study loop needed for retention.
- It lacks a clear user, buyer, KPI, and go-to-market decision.
- It does not distinguish current implementation from future scope.
- It does not specify the system needed for quizzes, flashcards, review scheduling, planning, and progress analytics.
- It does not address AI governance, privacy, or institution-readiness.

Repo reality as of March 27, 2026:

- Foundation exists for Next.js, Prisma, Neon/Postgres, auth, and a basic story-oriented schema.
- The learning product is mostly not implemented yet.
- The revised `PROJECT_PLAN.md` therefore needs to be a real product/technical spec, not a lightweight checklist.

## Research-Grounded Product Direction

Use the following evidence to justify the plan:

- Students already use AI heavily, so AI itself is not the moat.
  - OECD reports that student use of generative AI is very high, including three-quarters of students aged 16+ in 2025 and rapidly rising usage in education contexts.
  - Source: https://www.oecd.org/en/topics/generative-ai.html
- U.S. teens are increasingly using ChatGPT for schoolwork, especially for research/help, which means the opportunity is guided study workflows, not generic chat.
  - Source: https://www.pewresearch.org/short-reads/2025/01/15/about-a-quarter-of-us-teens-have-used-chatgpt-for-schoolwork-double-the-share-in-2023/
- Effective studying depends on retrieval practice, spacing, cueing, and self-regulation, but students often do not naturally use those methods.
  - Sources:
  - https://ies.ed.gov/use-work/awards/retrieval-oriented-learning-strategies
  - https://ies.ed.gov/use-work/awards/improving-metacomprehension-and-self-regulated-learning-scientific-texts
  - https://files.eric.ed.gov/fulltext/EJ1303358.pdf
- Institutions increasingly care about AI governance and student data privacy, so institution-readiness must be part of the architecture from the start.
  - Sources:
  - https://www.cosn.org/cosn-news/cosn-releases-first-of-its-kind-national-student-data-privacy-report/
  - https://tytonpartners.com/listening-to-learners-2024/

Inference from these sources:

- The moat should be orchestration of effective study behavior plus measurement, not raw generation.
- LearnLore should guide students into high-retention study loops automatically.
- Institution-readiness should focus on privacy, policy, role separation, analytics, and exportability, but not dominate v1 roadmap.

## Product Definition

### Primary User

Individual college students.

### Secondary Future User

Institutional stakeholders at colleges and universities:

- instructors
- advisors
- learning support staff
- administrators

### Go-To-Market

Student-first paid subscriptions.

### Institution Strategy

Institution-ready later, not institution-first now.

### Success Metric

Primary KPI pair:

- weekly retained engagement
- measurable study outcome improvement

Initial success definition:

- Students return because LearnLore becomes their default place to capture, practice, and review.
- Students can demonstrate improved retention and preparedness through internal metrics.

## Core Product Thesis

LearnLore should combine four layers into one system:

1. Capture Layer  
   Students can start from notes, syllabus, lecture text, PDFs, images, pasted prompts, or a topic they type manually.

2. Encoding Layer  
   AI transforms source material into multiple memory-friendly representations:
   - stories
   - structured notes
   - concept maps
   - memory hooks
   - flashcards
   - quiz questions
   - summaries
   - likely exam questions

3. Active Learning Layer
   The system drives effective learning through:
   - retrieval practice
   - spaced repetition
   - mixed quiz modes
   - weak-area drilling
   - confidence checks
   - explain-in-your-own-words prompts
   - adaptive review queues

4. Control Layer
   The platform manages:
   - study plans
   - deadlines
   - session recommendations
   - progress analytics
   - exam readiness
   - streaks and accountability
   - study interventions when a learner is slipping

## Non-Negotiable Product Principles

The revised plan should lock these principles explicitly:

- Stories are a differentiator, not the whole product.
- Every generated artifact must feed at least one downstream study action.
- AI should reduce friction, but the app must push students toward effective study behaviors.
- The system should prefer durable retention over impressive-looking generation.
- Student trust matters: transparent source linkage, editability, and confidence signaling are required.
- Institution-readiness means role separation, exportability, auditability, and privacy-conscious design.
- Avoid dark-pattern framing in the document; define stickiness as superior outcomes plus workflow centrality.

## In-Scope Product Modules

The new `PROJECT_PLAN.md` should define these modules as the target system.

### 1. Universal Study Intake

Inputs:

- typed topic prompt
- pasted notes
- PDF
- DOCX
- TXT
- image upload for handwritten/printed notes
- later: URL/import integrations

Required behavior:

- intake creates a `StudySource`
- system extracts text and metadata
- AI asks clarifying questions when the source is incomplete
- student can choose target outcome:
  - understand topic
  - memorize topic
  - prepare for exam
  - generate study pack
  - build review plan

### 2. Knowledge Distillation Engine

Transform source content into:

- concepts
- definitions
- formulas
- key facts
- misconceptions
- story-based memory representations
- concise notes
- flashcards
- practice questions
- review priorities

Requirement:

- every generated item must preserve source traceability
- each item stores confidence and provenance metadata

### 3. Story and Memory Engine

Keep this as LearnLore’s signature feature.

Outputs:

- short fictional story
- metaphor or analogy
- mnemonic hook
- emotional/visual anchor
- "why this helps remember" explanation

Constraint:

- stories must remain optional and editable
- stories should be generated only when they improve memorability, not for every concept blindly

### 4. Flashcards and Spaced Repetition

Support:

- AI-generated flashcards
- student-edited flashcards
- bidirectional cards where useful
- confidence rating after recall
- spaced scheduling
- overdue queue
- weak-card resurfacing
- cram mode for upcoming exams

### 5. Quiz and Retrieval Practice System

Question types:

- multiple choice
- short answer
- fill in the blank
- true/false
- explain the concept
- formula application
- scenario-based question

Modes:

- concept-level quiz
- source-level quiz
- exam-pack quiz
- weak-area drill
- timed mode
- adaptive mode

### 6. Smart Notes

Generated note views:

- concise summary
- layered notes
- exam cheat-sheet style summary
- detailed explanation
- compare-and-contrast view

Constraint:

- notes are editable
- generated notes and user notes should coexist

### 7. Study Planner

Planner outputs:

- daily session suggestions
- weekly plan
- exam countdown plan
- review schedule
- backlog prioritization

Inputs:

- exam date
- available study time
- course load
- confidence by topic
- target grade or performance goal

### 8. Progress and Readiness System

Track:

- concept mastery
- recall confidence
- review completion
- question accuracy
- time spent
- streaks
- readiness by exam/course
- at-risk topics

The system should tell students:

- what to study now
- what they are forgetting
- what is exam-critical
- what is improving
- what is being neglected

### 9. AI Study Coach

Functions:

- ask clarifying questions before generating a study pack
- recommend the next best study action
- explain quiz mistakes
- suggest review intensity
- detect overconfidence
- propose alternate encoding methods when one method fails

Constraint:

- coach is guidance-oriented, not just a chat box

### 10. Institution-Ready Foundation

Design for future support of:

- student, instructor, admin roles
- course/cohort association
- assignment/course imports
- reporting dashboards
- privacy controls
- export and deletion workflows
- policy-aware AI usage

Not in first product wave:

- procurement workflows
- LMS integrations
- faculty authoring tools
- classroom administration panels

## Explicit Out of Scope for This Plan Version

State these as deliberate exclusions from the first major product wave:

- social feed/community product
- marketplace for tutors
- live classes/video tutoring
- broad K-12 compliance-first workflow
- full LMS integration
- institutional billing workflows
- multi-tenant enterprise admin console
- generalized "do everything" assistant outside study context

## Required Changes to Public APIs, Interfaces, and Types

The rewritten plan should explicitly replace the old API section with an architecture-facing interface section.

### Data Model Direction

Current schema is too narrow. Plan a migration from:

- `Document`
- `Concept`
- `Story`
- `UserProgress`

to a richer learning model.

Add or redefine the following entities:

- `User`
- `StudyWorkspace`
- `Course`
- `ExamGoal`
- `StudySource`
- `SourceChunk`
- `Concept`
- `LearningAsset`
- `StoryAsset`
- `NoteAsset`
- `FlashcardAsset`
- `QuestionAsset`
- `StudyPlan`
- `StudySession`
- `ReviewItem`
- `ReviewEvent`
- `QuizAttempt`
- `ConceptMastery`
- `InterventionSignal`

Suggested design rules:

- `LearningAsset` is the polymorphic parent for generated study artifacts.
- Assets keep provenance back to source chunks and concepts.
- Review scheduling is driven by `ReviewItem`.
- Performance events write to append-only history tables where possible.
- `ConceptMastery` is derived and cached, not treated as the only source of truth.

### API Surface

Define these route groups for the plan:

- `/api/auth/*`
- `/api/study-sources/*`
- `/api/courses/*`
- `/api/concepts/*`
- `/api/assets/*`
- `/api/review/*`
- `/api/quizzes/*`
- `/api/plans/*`
- `/api/progress/*`
- `/api/coach/*`

Representative endpoints to specify:

- `POST /api/study-sources`
- `POST /api/study-sources/:id/process`
- `POST /api/study-sources/:id/clarify`
- `GET /api/courses/:id/dashboard`
- `POST /api/assets/:id/regenerate`
- `PATCH /api/assets/:id`
- `POST /api/review/next`
- `POST /api/review/:id/grade`
- `POST /api/quizzes/generate`
- `POST /api/quizzes/:id/submit`
- `POST /api/plans/generate`
- `GET /api/progress/overview`
- `POST /api/coach/respond`

### Type Contracts

The plan should require shared TS types for:

- `StudyGoal`
- `StudySourceKind`
- `LearningAssetKind`
- `ReviewGrade`
- `MasteryBand`
- `ExamReadinessBand`
- `GenerationProvenance`
- `GenerationConfidence`
- `InterventionReason`

## UX and Workflow Spec

The new plan should define one canonical student loop:

1. Student creates a course or exam goal.
2. Student adds notes, files, or a topic prompt.
3. System asks missing clarifying questions if needed.
4. System generates a study pack.
5. Student chooses a mode:
   - understand
   - memorize
   - practice
   - review
6. System records behavior and outcomes.
7. Review queue and planner adapt automatically.
8. Dashboard shows what to do next and why.

Core screens to define:

- Landing page
- Auth
- Student home dashboard
- Course page
- Source ingestion flow
- Study pack page
- Flashcard review page
- Quiz practice page
- Planner page
- Progress/readiness page
- Coach panel

## Technical Architecture Decisions

The revised plan should lock these defaults:

- Framework: Next.js App Router with TypeScript
- Database: Postgres on Neon via Prisma
- Runtime: Node.js for AI/file-processing routes
- Auth: existing custom auth foundation, extended rather than replaced
- Background jobs: required for ingestion/generation pipelines
- Storage: object storage required for uploaded source files
- AI architecture: provider-abstraction layer, not single-vendor coupling
- Generation pipeline: chunk, extract, classify, generate, validate, persist
- Validation: generation outputs should pass schema validation before persistence
- Observability: structured logs and job/event tracing required

AI-provider stance:

- Keep provider-agnostic in the plan.
- Do not anchor the product plan to one model vendor.
- Define model selection by task:
  - extraction
  - structuring
  - mnemonic/story generation
  - quiz generation
  - coaching

## Delivery Phases

### Phase 0: Plan and Foundation Cleanup

- Rewrite `PROJECT_PLAN.md` to match this spec.
- Update `README.md` to describe the actual product.
- Audit schema gaps against target learning model.
- Document environment, storage, AI, and job dependencies.

### Phase 1: Student Core Foundation

- Introduce courses, exam goals, and study sources.
- Build source ingestion for typed prompt, paste, PDF, DOCX, TXT, and image.
- Add processing pipeline skeleton with status tracking.
- Create student dashboard shell.
- Preserve existing auth and session behavior.

Exit criteria:

- Student can create a course and add a source.
- System can track source-processing lifecycle.
- Dashboard can list courses and sources.

### Phase 2: Study Pack Generation

- Generate concepts from source material.
- Create story assets, note assets, flashcards, and question assets.
- Add provenance and confidence metadata.
- Build study pack UI.

Exit criteria:

- One source can generate a complete study pack.
- Student can edit generated artifacts.
- Assets remain linked to source/concepts.

### Phase 3: Retrieval and Review Engine

- Implement flashcard reviews and review scheduling.
- Implement quiz attempts and grading flows.
- Add weak-area detection.
- Add review queue APIs and UI.

Exit criteria:

- Student can complete review sessions.
- System adapts future reviews based on performance.
- Progress state updates reliably.

### Phase 4: Planner and Readiness

- Add exam goals, deadlines, and availability inputs.
- Generate study plans and next-session recommendations.
- Compute readiness and at-risk topic indicators.

Exit criteria:

- Student sees what to study next.
- Plan adapts to performance and deadlines.
- Dashboard surfaces meaningful interventions.

### Phase 5: AI Coach and Retention Loop

- Add coach flows for clarifying questions, mistake explanation, and next-step guidance.
- Add accountability nudges, streaks, and intervention triggers.
- Add session-end summaries and recovery flows for missed plans.

Exit criteria:

- Coach increases study continuity.
- Student can recover from falling behind.
- Product has a strong repeat-use loop.

### Phase 6: Institution-Ready Layer

- Add roles, cohorts, and reporting-ready data model extensions.
- Add privacy/export/deletion controls.
- Add audit/event history suitable for institutional use.

Exit criteria:

- Architecture supports pilot institutional overlays without core rewrite.
- Data model and events are ready for reporting surfaces.

## Acceptance Criteria for the Rewritten Document

The new `PROJECT_PLAN.md` should be considered complete only if it:

- clearly defines LearnLore as a study OS, not only a story app
- names the primary user, buyer, KPI, and go-to-market
- distinguishes current repo reality from future roadmap
- specifies modules, workflows, and architecture boundaries
- lists explicit public API and schema directions
- includes phased delivery with exit criteria
- includes out-of-scope items
- includes testing and validation expectations
- includes research-backed rationale with links

## Test Cases and Scenarios

The revised plan should include these test categories.

### Product Flow Tests

- Student creates a course and exam goal.
- Student pastes a topic prompt with minimal context and receives clarifying questions.
- Student uploads source material and gets a study pack.
- Student edits generated notes, flashcards, and stories.
- Student completes a review session and sees updated priorities.
- Student takes a quiz and receives targeted mistake explanations.
- Student misses study sessions and receives an adjusted recovery plan.

### Data/Logic Tests

- All generated assets retain provenance to source chunks.
- Review scheduling updates correctly after different grades.
- Mastery/readiness calculations are deterministic.
- Weak-topic interventions trigger only on defined conditions.
- Regeneration does not orphan prior user edits.

### Safety/Quality Tests

- Invalid or low-confidence AI outputs are blocked or flagged.
- Hallucinated facts can be traced and corrected.
- File ingestion failures preserve partial status cleanly.
- Auth boundaries prevent cross-user source access.
- Deletion removes or tombstones user-owned generated artifacts appropriately.

### Institution-Ready Tests

- Role boundaries support future instructor/admin access without changing student tables fundamentally.
- Export and audit events are available for future pilots.
- Privacy-sensitive data is separable from learning analytics.

## Assumptions and Defaults

The document should state these defaults explicitly:

- Student-first roadmap wins over institution-first complexity.
- Colleges/universities are the first institutional target later, not now.
- Subscription revenue is the first commercial path.
- Stories remain core differentiation, but not the product center of gravity.
- Effective studying means retrieval practice, spaced review, and metacognitive support are built into the product.
- The app should guide, not merely generate.
- Institution-readiness is architectural in v1, operational in later phases.
- Mobile-native apps are not required in the first major version; responsive web is sufficient.
- Human tutoring and social/community features are deferred.

## Recommended Document Structure for the New `PROJECT_PLAN.md`

Use this exact section order:

1. Product Vision
2. User and Market Positioning
3. Research Insights and Strategic Implications
4. Core Product Thesis
5. In-Scope Modules
6. Out-of-Scope Items
7. Current Repo State
8. Target Architecture
9. Data Model Direction
10. API and Type Contracts
11. Canonical Student Workflows
12. Delivery Phases and Exit Criteria
13. Testing and Acceptance Criteria
14. Risks and Mitigations
15. Assumptions and Defaults
16. References

## Risks to Call Out in the Document

- AI-generated breadth can dilute product focus if not tied to learning loops.
- Poor provenance/confidence handling will damage trust.
- Planner/review logic can become noisy if interventions are too aggressive.
- Supporting institutions too early will slow core product-market fit.
- Story generation can become novelty instead of value if not tied to retention outcomes.
- Schema shortcuts now will create migration pain later.

## Implementation Defaults for the Future Writer/Implementer

When this plan is later turned into code work:

- Prefer extending current auth instead of replacing it.
- Treat current schema as transitional.
- Build the ingestion and asset pipeline before advanced UI polish.
- Prioritize canonical student workflows over feature count.
- Instrument events early so retention and learning outcomes can actually be measured.
