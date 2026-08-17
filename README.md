CSE5006 Assessment 3 — Data-Driven RSS Application with Observability

A data-driven RSS system extending the Assessment 1 frontend and Assessment 2 backend. Feed content is stored in PostgreSQL, served through a REST API, and presented through an RSS Client and an operations dashboard. Operational metrics are persisted to the database and surfaced as live indicators and alerts. The whole stack runs in Docker.

Author: Erdi Erden Kekec — Student Number 22555388 Repository: https://github.com/eek22555388/cse5006-assignment3

Architecture

Three containers, orchestrated with Docker Compose:

Service	Role	Tech	Port
frontend	RSS Client and dashboard UI	Next.js, React, Tailwind	80 → 3000
api	RSS Server — REST API and RSS XML	Next.js API routes, Prisma	4080 → 3000
postgres	Data persistence	PostgreSQL 15	5432

The frontend calls the API over HTTP; the API reaches Postgres by service name on Compose's private network. The API base URL is injected as an environment variable rather than hardcoded, so the same images run unchanged locally or on EC2.

Database schema

Four models, defined in api/prisma/schema.prisma and managed with Prisma migrations.

Feed — an RSS channel (title, generated slug, description, site URL)
FeedItem — one post within a channel (title, summary, content, link, image, category, published date, GUID)
Author — a content contributor
RequestLog — per-request operational metrics (path, method, client IP, user agent, feed, status code)

Design decisions worth noting:

Feed → FeedItem is one-to-many with onDelete: Cascade — an item cannot exist without its channel.
Author → FeedItem uses onDelete: Restrict — deleting an author who still has items is refused, and the API returns a 409 explaining what to do instead.
Both FeedItem and Author carry an isActive flag for soft deletion. Withdrawing content hides it from every public read path without destroying it, and is reversible.
Slugs are generated from titles rather than supplied by the client, so title and identifier cannot drift apart. The unique constraint on slug also rejects duplicate feed titles.
RequestLog.feedId is deliberately a plain column, not a foreign key — log entries must survive deletion of the records they reference.
API endpoints

All /api/* endpoints send CORS headers and log requests to the database.

Method	Endpoint	Purpose
GET	/api/feeds	All feeds, with item counts
GET	/api/feeds?id=	One feed with its active items
POST	/api/feeds	Create a feed (slug auto-generated)
PATCH	/api/feeds?id=	Update a feed
DELETE	/api/feeds?id=	Delete a feed and cascade its items
GET	/api/items	Active items, newest first
GET	/api/items?feedId=	Items filtered by feed
GET	/api/items?id=	One item with feed and author
POST	/api/items	Publish an item
PATCH	/api/items?id=	Partial update
DELETE	/api/items?id=	Soft delete (sets isActive false)
GET	/api/authors	All authors with item counts
POST	/api/authors	Create an author
PATCH	/api/authors?id=	Update or deactivate
DELETE	/api/authors?id=	Delete, refused if items exist
GET	/api/rss?slug=	RSS 2.0 XML feed
GET	/health	Liveness/readiness probe — returns 200
GET	/api/health	Healthcheck — verifies the database
GET	/api/count	Request and content counts
GET	/api/metrics	Aggregated dashboard metrics

Responses use meaningful status codes: 201 on create, 204 on hard delete, 400 for invalid input, 404 for missing records, 409 for conflicts, 503 when the database is unreachable.

Metrics and observability

/health sits at the top level, not under /api, and returns 200 with database latency when healthy or 503 when Postgres is unreachable — the distinction between liveness (the process is up) and readiness (it can serve traffic).

/api/metrics aggregates entirely in SQL using Prisma groupBy, returning total requests, requests in the last hour and day, unique clients, error rate, requests per endpoint, per client and per feed, plus content counts and per-feed status. Counting in the database rather than fetching rows into Node keeps the endpoint viable as RequestLog grows — it held over 12,500 rows after load testing without degradation.

Neither /health nor /api/metrics writes to RequestLog. Both are polled frequently, and logging them would inflate the very numbers they report.

Feed status

Feed has no status column. Status is derived at query time from item history in api/lib/feed-status.ts:

Status	Rule
healthy	Has active items, most recent within 30 days
stale	Has items, but nothing published for over 30 days
empty	No active items

Deriving rather than storing avoids a migration and prevents the stored value drifting out of sync with reality. The trade-off is a per-feed count query, which is acceptable at this scale but would need a materialised view if feed numbers grew.

Alerts

The dashboard raises visible warnings for empty feeds, stale feeds, an error rate above 5%, and an unreachable or degraded server. Client-side errors distinguish network failure (no response at all) from HTTP failure (404, 500), because the two require different responses from the user.

Frontend pages
Route	Purpose
/	Overview and entry points
/dashboard	Operations dashboard — live metrics, alerts, feed status
/feeds	RSS Client — live items, filterable by feed
/feeds/[id]	Item detail with stored content and optional source link
/manage	Create and remove feeds, authors and items
/about	Project background
/settings	Theme and display preferences (carried over from A1)
Shared frontend layer

Assessment 2 feedback identified duplicated API logic and repeated TypeScript shapes across pages. Assessment 3 extracts these into a single layer under frontend/lib/:

Module	Responsibility
types.ts	One definition of Feed, FeedItem, Author, metrics
api-client.ts	All API calls, URL construction and error normalisation
useApi.ts	Loading, error, status and refresh state for any call
useManageData.ts	Combined load and mutate cycle for the manage page
ui.ts	Shared Tailwind class strings

manage/page.tsx was reduced from 284 lines to roughly 40 by splitting it into FeedSection, AuthorSection and ItemSection, each owning only its own form state. Extracting the shared layer also exposed a bug: /feeds had two useEffect hooks that both fired on mount, causing every page load to request /api/items twice and inflating request metrics.

Database seeding

api/prisma/seed.ts creates three authors, five feeds and 34 items:

bash
sudo docker-compose exec api npx prisma db seed

The seeder is idempotent — it upserts on stable natural keys (email for authors, generated slug for feeds, seed-<slug>-<n> for items), so repeated runs produce the same data rather than duplicates.

It deliberately creates unhealthy states as well as healthy ones: one feed with no items, one feed whose newest post is 200 days old, and several withdrawn items. Without these, the dashboard's alert paths could not be demonstrated.

Testing
Playwright

Six end-to-end tests in tests/, run from the project root:

bash
npx playwright test
npx playwright show-report

server-crud.spec.ts exercises the server use case — a full create, read, update, delete lifecycle for a feed and its items, plus input validation and the health probe. client-view.spec.ts covers the client use case — browsing the feed list, opening an item, filtering by feed, and loading the dashboard.

Tests select elements by ARIA role and label rather than CSS class, so they fail if the page's accessible structure breaks. Testability and accessibility reinforce each other.

The host defaults to localhost because an EC2 instance cannot reach its own public DNS; override with TEST_HOST and TEST_API to run from elsewhere.

JMeter

Load test plan and analysis in jmeter/. Staged tiers of 1, 10, 100, 1,000 and 10,000 simulated clients against /api/items. Full results and interpretation in jmeter/RESULTS.md.

Summary: sustained throughput of 82.8 requests/second at approximately 700ms mean latency with a 0.01% error rate at the highest tier. The lower tiers under-reported capacity because ramp-up rate, not server capacity, was the limiting factor — an artefact of the test configuration rather than a property of the system.

Accessibility

Lighthouse accessibility audits, Chrome 151, desktop, incognito:

Page	Before	After	Issue
/dashboard	96	100	<dl> grouping — <dt>/<dd> structure
/feeds	100	100	—
/manage	96	100	Amber button text below 4.5:1 contrast

The dashboard failure was a malformed definition list: stat hints were <p> elements inside the <dl>, which breaks how screen readers pair terms with definitions. The manage failure was text-amber-600 on white at roughly 3.3:1, below WCAG AA; raising it to amber-700 reaches 4.9:1.

Reviewing the report also confirmed decisions made while building: feed status badges pair colour with a text label so they do not rely on colour alone, and the CSS bar charts carry role="meter" with aria-label, which is why the ARIA meter audit passes.

One limitation worth naming — a second contrast defect on the same amber class existed on the "inactive" author label but was not flagged, because no author was in that state when the audit ran. Lighthouse tests the rendered DOM, not every reachable state.

Running the project

Requires Docker and Docker Compose.

bash
git clone git@github.com:eek22555388/cse5006-assignment3.git
cd cse5006-assignment3

Set the public API URL in docker-compose.yml under the frontend service:

yaml
- NEXT_PUBLIC_API_URL=http://<your-host>:4080

In development, add the host to allowedDevOrigins in both frontend/next.config.ts and api/next.config.ts. Next.js blocks dev assets from unrecognised origins; production builds do not require this.

Then:

bash
sudo docker-compose build
sudo docker-compose up
sudo docker-compose exec api npx prisma db seed
RSS Client: http://<your-host>
Dashboard: http://<your-host>/dashboard
RSS Server: http://<your-host>:4080
Health probe: http://<your-host>:4080/health
Metrics: http://<your-host>:4080/api/metrics
RSS XML: http://<your-host>:4080/api/rss?slug=<feed-slug>

Migrations are applied automatically on API container startup via prisma migrate deploy, so a fresh database builds its own schema.

NEXT_PUBLIC_API_URL is inlined at build time, so changing it requires docker-compose up --build, not merely a restart.

Development notes
Built on EC2 (Amazon Linux 2023, t2.medium) with Docker Compose.
Each major feature was developed on its own branch and merged into a clean main: shared API layer refactor, observability and metrics, seeding, and end-to-end testing.
node_modules, .env files, Prisma's generated client and JMeter .jtl result files are excluded from the repository.
Known limitations and future work
The Docker Compose setup is development-oriented: both application containers run with NODE_ENV=development, bind-mount the source tree and use npm run dev. A production deployment would use multi-stage builds with next build/next start and no source mounts.
Request validation is performed manually inside each route rather than through a shared schema layer. A validation library such as Zod would make this consistent and self-documenting.
CORS is open to all origins, which suits a lab deployment but would be restricted to the frontend origin in production.
Client identification uses IP address, which cannot distinguish users behind shared NAT and is trivially spoofable via x-forwarded-for. Acceptable for metrics; unsuitable for access control.
RequestLog grows without bound and has no retention policy. A production system would archive or downsample older rows.
Feed status is computed with one count query per feed, an N+1 pattern that is fine at current scale but would need a single aggregate query or materialised view if feed numbers grew significantly.
Theme and layout preferences are stored in localStorage rather than cookies, so the server cannot render the correct theme on first paint.
There is no authentication; the management interface is open.