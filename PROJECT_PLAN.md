# LearnLore - Project Plan

## Overview

**LearnLore** is an AI-powered study tool that converts academic notes into short fictional stories to make memorization easier. The platform transforms dry academic content into memorable narrative units using the pipeline: Notes → Concepts → Story → Memory Hook.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Database | PostgreSQL |
| ORM | Prisma |
| AI | DeepSeek v3 via Groq API |
| Auth | Custom (ported from merzah Rust project) |

---

## Database Schema

### Models

```
User → Document → Concept → Story
         ↓
       Session
         ↓
    UserProgress
```

### Auto-Migration

- **Development**: `npx prisma db push` - syncs schema instantly
- **Production**: `npx prisma migrate deploy`

```bash
# Database commands
pnpm db:push    # Push schema changes (dev)
pnpm db:migrate # Create migrations
pnpm db:studio  # Open Prisma Studio
```

---

## Core Features

### 1. Authentication (Ported from Merzah)

- Email/password registration & login
- Session-based auth with cookies (`__Host-session`)
- Password hashing with bcrypt
- Session token management

### 2. Document Upload

- Accept: PDF, DOCX, TXT
- Text extraction using pdf-parse & mammoth

### 3. AI Processing Pipeline

- **Concept Extraction**: Identify formulas, laws, definitions, terms
- **Story Generation**: 2-4 sentence fictional stories
- **Memory Hooks**: One-line mnemonics

### 4. Story Display

- View concepts with generated stories
- Memory hooks for quick recall

### 5. Progress Tracking

- Track mastery level (1-5)
- Review history

---

## Project Structure

```
learnlore/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Optional seed data
├── src/
│   ├── app/
│   │   ├── (auth)/        # Auth pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/   # Protected pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── documents/
│   │   │   └── review/
│   │   ├── api/           # API routes
│   │   │   ├── auth/
│   │   │   ├── documents/
│   │   │   └── stories/
│   │   ├── layout.tsx
│   │   └── page.tsx       # Landing
│   ├── components/
│   │   ├── ui/           # Reusable components
│   │   ├── auth/         # Auth forms
│   │   └── stories/       # Story components
│   └── lib/
│       ├── auth/         # Auth utilities
│       ├── db.ts         # Prisma client
│       ├── groq.ts       # AI client
│       └── extractors.ts  # File text extraction
├── .env.example
├── package.json
└── tailwind.config.ts
```

---

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register + create session |
| `/api/auth/login` | POST | Login + create session |
| `/api/auth/logout` | DELETE | Clear session |
| `/api/auth/me` | GET | Get current user |
| `/api/documents` | GET | List user documents |
| `/api/documents` | POST | Upload document |
| `/api/documents/[id]` | GET | Get document + stories |
| `/api/documents/[id]/process` | POST | Trigger AI processing |
| `/api/stories/[id]` | GET | Get single story |

---

## Development Phases

### Phase 1: Foundation
- [x] Project setup (Next.js + TS + Tailwind)
- [x] Prisma setup with schema
- [ ] Environment configuration
- [ ] Database connection

### Phase 2: Authentication
- [ ] Port auth logic from merzah
- [ ] Login/register pages
- [ ] Session management

### Phase 3: Document Management
- [ ] File upload component
- [ ] Text extraction
- [ ] Document listing

### Phase 4: AI Pipeline
- [ ] Groq integration
- [ ] Concept extraction
- [ ] Story generation

### Phase 5: UI/UX
- [ ] Dashboard
- [ ] Story display
- [ ] Progress tracking

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/learnlore"

# Groq API (DeepSeek)
GROQ_API_KEY="your-groq-api-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Example Transformation

**Input (Notes)**:
> Ohm's Law states that voltage equals current multiplied by resistance.

**Output (Story)**:
> In a small kingdom, King Volt tries to push villagers through a narrow gate. The guard named Resistance blocks the path, slowing the flow. When the king pushes harder, more villagers pass through.

**Memory Hook**: "Voltage pushes current through resistance"

---

## References

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://prisma.io/docs)
- [Groq API](https://console.groq.com/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
