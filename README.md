# HQ Database API

Central API layer for the HQ Master Data Warehouse. Provides read-only access to company firmographics, person profiles, experience, education, and discovery data.

## Overview

This is an **API-only Next.js application** that serves as the single source of truth for all data access to the HQ Master Data Warehouse. Data ingestion happens via Modal functions — this API is read-only.

**Tech Stack:**
- Next.js 15 (App Router)
- Supabase (PostgreSQL)
- Zod (schema validation)
- OpenAPI 3.0 (auto-generated spec)

## Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# API available at http://localhost:3000
```

## API Endpoints

### Companies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | Search enriched company firmographics |
| GET | `/api/companies/{domain}` | Get company by domain |
| GET | `/api/companies/discovery` | Search lightweight company discovery data |
| GET | `/api/companies/discovery/{domain}` | Get discovery company by domain |

### People

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/people` | Search enriched person profiles |
| GET | `/api/people/{slug}` | Get person with experience & education |
| GET | `/api/people/{slug}/experience` | Get person's work history |
| GET | `/api/people/{slug}/education` | Get person's education |
| GET | `/api/people/discovery` | Search lightweight person discovery data |
| GET | `/api/people/discovery/{slug}` | Get discovery person by slug |
| GET | `/api/people/by-past-company` | Find people who worked at a company |

### Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workflows` | List enrichment workflow definitions |
| GET | `/api/workflows/{slug}` | Get workflow by slug |

### OpenAPI

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/openapi` | OpenAPI 3.0 specification |

## Example Requests

### Search companies by industry

```bash
curl "http://localhost:3000/api/companies?industry=Software&limit=10"
```

### Get a specific company

```bash
curl "http://localhost:3000/api/companies/stripe.com"
```

### Search people by current company

```bash
curl "http://localhost:3000/api/people?company=Stripe&limit=10"
```

### Get person profile with full details

```bash
curl "http://localhost:3000/api/people/johndoe"
```

Response includes profile, experience array, and education array.

### Find ex-employees of a company

```bash
curl "http://localhost:3000/api/people/by-past-company?company_domain=stripe.com"
```

Returns people who previously worked at Stripe (not currently employed there).

### Get OpenAPI spec

```bash
curl "http://localhost:3000/api/openapi" | jq .
```

## Query Parameters

### Pagination

All list endpoints support:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Results per page (1-100) |
| `offset` | integer | 0 | Number of results to skip |

### Company Filters

| Parameter | Description |
|-----------|-------------|
| `domain` | Filter by domain (partial match) |
| `name` | Filter by company name (partial match) |
| `industry` | Filter by industry (partial match) |
| `country` | Filter by country (partial match) |
| `size_range` | Filter by size range (exact match) |
| `min_employees` | Minimum employee count |
| `max_employees` | Maximum employee count |
| `founded_after` | Founded year >= value |
| `founded_before` | Founded year <= value |

### People Filters

| Parameter | Description |
|-----------|-------------|
| `name` | Filter by full name (partial match) |
| `title` | Filter by current title (partial match) |
| `company` | Filter by current company (partial match) |
| `company_domain` | Filter by current company domain (partial match) |
| `location` | Filter by location (partial match) |
| `country` | Filter by country (partial match) |

### By Past Company Filters

At least one required:

| Parameter | Priority | Description |
|-----------|----------|-------------|
| `company_domain` | 1 (highest) | Exact domain match |
| `company_linkedin_url` | 2 | Exact LinkedIn URL match |
| `company_name` | 3 (lowest) | Partial name match |

## Response Format

### Success (list)

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Success (single)

```json
{
  "id": "...",
  "name": "...",
  ...
}
```

### Error

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Company not found"
  }
}
```

## Database Schema

See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for full schema documentation.

## OpenAPI / Swagger

The OpenAPI 3.0 spec is available at `/api/openapi`. You can use it with:

- [Swagger UI](https://petstore.swagger.io/) — paste the spec URL
- [Postman](https://www.postman.com/) — import from URL
- Code generators — generate typed clients
