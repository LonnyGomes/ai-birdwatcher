# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Bird Watcher is an intelligent bird feeder monitoring system using OpenAI GPT-4 Vision for species identification, visual similarity matching for individual bird tracking, and automated video processing with motion detection. The system consists of a Node.js/Fastify backend with SQLite storage and a Vue 3/Vuetify frontend.

**Technology Stack:**
- Backend: Node.js 18+, TypeScript, Fastify, better-sqlite3, OpenAI API, FFmpeg
- Frontend: Vue 3, TypeScript, Vite, Pinia, Vuetify, Chart.js
- Shared: TypeScript types in monorepo workspace

## Development Commands

### Running the Application

```bash
# Start both frontend and backend concurrently
npm run dev

# Start backend only (http://localhost:3000)
npm run dev:backend

# Start frontend only (http://localhost:5174)
npm run dev:frontend
```

### Building

```bash
# Build all workspaces
npm run build

# Build individual packages
npm run build:backend
npm run build:frontend

# Production start (after build)
npm run start:backend
```

### Testing

```bash
# Run tests in all workspaces
npm test

# Run backend tests only
npm test --workspace=packages/backend

# Run frontend tests (Vitest)
npm test --workspace=packages/frontend

# Run frontend E2E tests (Playwright)
cd packages/frontend && npx playwright test

# Run Playwright UI mode (interactive)
cd packages/frontend && npx playwright test --ui
```

### Database

```bash
# Run database migrations
npm run migrate --workspace=packages/backend
```

### Linting

```bash
# Lint all workspaces
npm run lint

# Lint individual packages
npm run lint --workspace=packages/frontend
```

### Cleanup

```bash
# Remove all node_modules and dist folders
npm run clean
```

## Architecture Overview

### Backend Architecture (Layered)

```
HTTP Routes → Controllers → Services → Repositories → SQLite Database
                                    ↓
                            Utility Functions
```

**Key Components:**

1. **Job Queue Service** (`/services/jobQueue.service.ts`)
   - Polling-based queue (2s intervals) using database as backing store
   - Processes jobs: `pending` → `active` → `completed/failed`
   - Handlers registered via `registerHandler(jobType, handler)`
   - Powers the 3-stage video processing pipeline

2. **Video Processing Pipeline** (Sequential Jobs)
   - **Frame Extraction**: FFmpeg extracts frames at 1fps (or motion segments) → stores in `data/frames/{videoId}/`
   - **Bird Identification**: Batches of 10 frames sent to OpenAI → creates sighting records
   - **Similarity Matching**: Visual comparison to match/create bird profiles

3. **File Watcher** (`/services/fileWatcher.service.ts`)
   - Monitors `watch-folder/` for new video files
   - Automatically creates video record and enqueues `frame_extraction` job
   - Processes existing files on startup (recovery mechanism)

4. **Authentication**
   - JWT tokens (7-day expiry) signed with `JWT_SECRET`
   - Fastify decorator `fastify.authenticate` protects routes
   - bcrypt password hashing (10 rounds)
   - Default admin user created on first run: `admin/admin123`

5. **Repository Pattern**
   - Each repository = single entity (Videos, Sightings, Birds, Jobs, Species)
   - Prepared statements with parameterized queries
   - Semantic methods: `findById()`, `findAll()`, `create()`, `update()`, `delete()`
   - Services instantiated as singletons, export instance

6. **Frame Path Normalization**
   - DB stores absolute paths: `/Users/.../data/frames/7/frame_0001.jpg`
   - API returns relative paths: `7/frame_0001.jpg`
   - Pattern: `normalizeFramePath()` method in controllers
   - Frontend accesses via `/api/files/{relative-path}`

### Frontend Architecture (Vue 3 + Composition API)

**State Management (Pinia):**
- `auth.store`: User session, JWT token (persisted to localStorage), initialization flag
- `birds.store`: Bird profiles and visit history
- `sightings.store`: Detected bird sightings from videos
- `species.store`: Cached Wikipedia images and page URLs for species
- `statistics.store`: Dashboard analytics (overview, species distribution, hourly activity)
- `videos.store`: Video processing status

**API Integration:**
- Axios client in `services/api.service.ts`
- Request interceptor: Auto-adds JWT from localStorage to Authorization header
- Response interceptor: Detects 401, clears token, redirects to login
- Service layer (`services/*.service.ts`) wraps API calls with type safety

**Router Guards:**
- `authGuard`: Protects authenticated routes, waits for auth initialization
- `guestGuard`: Prevents logged-in users from accessing login/register pages
- Routes under `/auth` use `AuthLayout`, others use `DefaultLayout`

**Vuetify Theming:**
- Nature-inspired palette: Forest Green primary (`#1B4332`), Earthy Brown secondary, Sunset Orange accent
- Custom colors: `forest-mist`, `golden-hour`, `bark`, `moss`, `dawn`, `dusk`
- Dual themes (light/dark) with semantic color mappings
- Poppins font family globally

**Component Patterns:**
- **Bird Cards**: Fallback cascade for images (Wikipedia → representative → placeholder)
- **Stagger Animations**: CSS `--stagger-delay` variable for sequential entrance
- **Glass-morphism**: `backdrop-filter: blur(8px)` with semi-transparent backgrounds
- **Accessibility**: Respects `prefers-reduced-motion` for animations

## Critical Development Patterns

### Backend: Adding a New API Endpoint

1. Create types in `packages/shared/src/types/` if needed
2. Add repository method in `packages/backend/src/repositories/`
3. Add service method in `packages/backend/src/services/` (orchestrates repos)
4. Add controller in `packages/backend/src/api/controllers/`
5. Register route in `packages/backend/src/api/routes/`
6. Add authentication: `onRequest: [fastify.authenticate]` to route options

### Backend: Frame Path Handling

Always normalize absolute frame paths to relative paths before returning to frontend:

```typescript
private normalizeFramePath(framePath: string | null): string | null {
  if (!framePath) return null;
  const framesIndex = framePath.indexOf('frames/');
  if (framesIndex !== -1) {
    return framePath.substring(framesIndex + 'frames/'.length);
  }
  return framePath;
}
```

Apply in controller methods before sending response:
```typescript
return {
  ...sighting,
  frame_path: this.normalizeFramePath(sighting.frame_path),
};
```

### Frontend: Adding a New Page

1. Create view component in `packages/frontend/src/views/`
2. Add route to `packages/frontend/src/router/index.ts`
3. Add navigation link in `DefaultLayout.vue` sidebar
4. If requires auth, ensure route has `meta: { requiresAuth: true }`

### Frontend: Fetching Species Data

Use the caching pattern to avoid duplicate API calls:

```typescript
// In component setup
const speciesStore = useSpeciesStore();

// Watch birds list
watch(() => birdsStore.birds, async (birds) => {
  const uniqueSpecies = [...new Set(birds.map(b => b.species))];
  await speciesStore.fetchSpeciesData(uniqueSpecies);
}, { immediate: true });

// Access cached data in template
const imageUrl = speciesStore.getSpeciesImage(bird.species);
```

### Frontend: Image Display with Fallback

```vue
<v-img
  :src="speciesImageUrl || bird.representative_image_path || '/placeholder.png'"
  cover
>
  <template #placeholder>
    <div class="image-placeholder">
      <v-icon color="primary">mdi-bird</v-icon>
    </div>
  </template>
</v-img>
```

## Database Schema Key Relationships

```sql
videos (id) ──< sightings (video_id)
               └── sightings (bird_profile_id) >── bird_profiles (id)

bird_profiles (id) ──< bird_representative_images (bird_profile_id)
                      └── bird_representative_images (sighting_id) >── sightings (id)

processing_jobs (video_id) >── videos (id)

species_info (species) ← Referenced by sightings.species (no FK)
```

**Important Tables:**
- `videos`: Processing status (`pending`, `processing`, `completed`, `failed`)
- `sightings`: Stores `frame_path` (absolute), `detected_at` (calculated from `recorded_at` + `timestamp_in_video`)
- `bird_profiles`: Individual birds with `unique_identifier` (e.g., `CARDINAL_001`)
- `processing_jobs`: Queue with `status`, `job_type`, `progress_percentage`
- `species_info`: Wikipedia images and page URLs keyed by species name

## Environment Configuration

Backend requires `.env` file:
```env
OPENAI_API_KEY=sk-your-api-key-here
JWT_SECRET=your-secure-random-secret-key-here
NODE_ENV=development
PORT=3000
```

Frontend reads from `VITE_API_URL` (defaults to `http://localhost:3000`).

## Testing Strategy

**Backend:**
- Jest for unit tests
- Test repositories with in-memory SQLite databases
- Mock OpenAI API calls in service tests

**Frontend:**
- Vitest for unit tests (components, stores)
- Playwright for E2E tests (located in `packages/frontend/tests/e2e/`)
- Test authentication flows, data display, image loading

**E2E Test Patterns:**
```typescript
// Navigate and verify
await page.goto('http://localhost:5174/sightings/36');
await expect(page.locator('h2')).toContainText('Mourning Dove');

// Check image loaded
const img = page.locator('img[src*="/api/files/"]');
await expect(img).toBeVisible();

// Test auth
await page.fill('[data-testid="username"]', 'admin');
await page.fill('[data-testid="password"]', 'admin123');
await page.click('button[type="submit"]');
await expect(page).toHaveURL(/.*dashboard/);
```

## Common Development Scenarios

### Processing a Test Video

1. Place video file in `watch-folder/` directory
2. Backend auto-detects and creates `frame_extraction` job
3. Monitor processing: `GET /api/videos/:id/status`
4. View sightings: `GET /api/sightings?video_id=:id`

### Debugging Job Queue

Check job status in database:
```sql
SELECT * FROM processing_jobs WHERE status = 'failed' ORDER BY created_at DESC;
```

View logs:
```bash
tail -f logs/combined.log
```

### Manually Trigger Video Processing

```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@path/to/bird-video.mp4"
```

### Reset Database

```bash
# Delete database (backend recreates on next start)
rm packages/backend/data/database.sqlite

# Migrations run automatically on startup
npm run dev:backend
```

## Cost Optimization Notes

The system includes aggressive cost optimization for OpenAI API calls:

- **Motion Detection**: Only processes frames with bird activity (60-70% reduction)
- **Perceptual Hashing**: Pre-filters duplicate frames before AI calls
- **Response Caching**: 1-hour cache for AI responses
- **Batch Processing**: Groups frames in batches of 10
- **Quality Assessment**: Skips low-quality/blurry frames

Estimated cost per 1-minute video at 1fps:
- Without optimization: $0.60-1.80
- With optimization: $0.18-0.54

## Troubleshooting

**FFmpeg not found:**
- macOS: `brew install ffmpeg`
- Ubuntu: `sudo apt-get install ffmpeg`

**OpenAI API errors:**
- Verify API key in `.env`
- Check rate limits (system has automatic retry with exponential backoff)

**Database locked:**
- SQLite uses WAL mode for concurrency
- Check for zombie processes: `ps aux | grep node`

**Frontend can't connect to backend:**
- Ensure backend is running on port 3000
- Check CORS configuration in `packages/backend/src/api/server.ts`
- Verify `VITE_API_URL` environment variable

**No birds detected:**
- Ensure video has clear, well-lit bird footage
- Check OpenAI API logs in `logs/combined.log`
- Try test video with known good detections

## File Paths Reference

- **Watch folder**: `watch-folder/` (auto-monitored)
- **Uploaded videos**: `packages/backend/data/uploads/`
- **Extracted frames**: `packages/backend/data/frames/{videoId}/frame_NNNN.jpg`
- **Database**: `packages/backend/data/database.sqlite`
- **Logs**: `packages/backend/logs/`
- **Frontend builds**: `packages/frontend/dist/`
- **Shared types**: `packages/shared/src/types/`

## Application Startup Sequence

1. Database initialization (singleton connection)
2. Run migrations automatically
3. Ensure default admin user exists
4. Start job queue polling service
5. Start file watcher on `watch-folder/`
6. Start Fastify HTTP server

The application gracefully shuts down on SIGTERM/SIGINT, stopping the job queue and file watcher before closing the server.
