# HQ Master Data API Reference

## Base URL

**Local development:** `http://localhost:3003` (or `3000` if available)

---

## Endpoints

### Companies

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/companies` | Canonical records (core.companies) |
| GET | `/api/companies/firmo` | Enriched firmographics |
| GET | `/api/companies/firmo/{domain}` | Single enriched company by domain |
| GET | `/api/companies/discovery` | Lightweight discovery records |
| GET | `/api/companies/discovery/{domain}` | Single discovery company |

### People

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/people` | Canonical records (core.people) |
| GET | `/api/people/background` | Enriched profiles |
| GET | `/api/people/background/{slug}` | Single profile with experience + education |
| GET | `/api/people/background/{slug}/experience` | Experience only |
| GET | `/api/people/background/{slug}/education` | Education only |
| GET | `/api/people/discovery` | Lightweight discovery records |
| GET | `/api/people/discovery/{slug}` | Single discovery person |
| GET | `/api/people/by-past-company` | Find by past employer |

### Other

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leads/{slug}` | Leads matching company's ICP |
| GET | `/api/workflows` | List workflows |
| GET | `/api/workflows/{slug}` | Get workflow by slug |
| GET | `/api/openapi` | OpenAPI specification |

---

## HTTP Methods

All endpoints are **GET only**. No POST, PUT, DELETE, or PATCH handlers exist.

---

## Authentication

**None.** All endpoints are publicly accessible.

---

## CORS

**No CORS headers configured.** Cross-origin browser requests will fail.

---

## Response Structures

### Paginated Response (list endpoints)

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

### Single Object Response

```json
{
  "id": "uuid",
  "field": "value"
}
```

### Error Response

```json
{
  "error": {
    "code": "NOT_FOUND | VALIDATION_ERROR | BAD_REQUEST | INTERNAL_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
```

---

## Schemas

### CoreCompany

```typescript
{
  id: string;           // UUID
  domain: string;       // e.g., "acme.com"
  name: string | null;
  linkedin_url: string | null;
  created_at: string;   // ISO timestamp
  updated_at: string;
}
```

### CorePerson

```typescript
{
  id: string;
  linkedin_url: string;
  linkedin_slug: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}
```

### CompanyFirmographics

```typescript
{
  id: string;
  raw_payload_id: string;
  company_domain: string;
  linkedin_url: string | null;
  linkedin_slug: string | null;
  linkedin_org_id: number | null;
  clay_company_id: number | null;
  name: string | null;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  company_type: string | null;
  industry: string | null;
  founded_year: number | null;
  size_range: string | null;
  employee_count: number | null;
  follower_count: number | null;
  country: string | null;
  locality: string | null;
  primary_location: object | null;
  all_locations: object | null;
  specialties: string[] | null;
  source_last_refresh: string | null;
  created_at: string | null;
}
```

### PersonProfile

```typescript
{
  id: string;
  raw_payload_id: string;
  linkedin_url: string;
  linkedin_slug: string | null;
  linkedin_profile_id: number | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  headline: string | null;
  summary: string | null;
  country: string | null;
  location_name: string | null;
  connections: number | null;
  num_followers: number | null;
  picture_url: string | null;
  jobs_count: number | null;
  latest_title: string | null;
  latest_company: string | null;
  latest_company_domain: string | null;
  latest_company_linkedin_url: string | null;
  latest_company_org_id: number | null;
  latest_locality: string | null;
  latest_start_date: string | null;
  latest_end_date: string | null;
  latest_is_current: boolean | null;
  certifications: object[] | null;
  languages: object[] | null;
  courses: object[] | null;
  patents: object[] | null;
  projects: object[] | null;
  publications: object[] | null;
  volunteering: object[] | null;
  awards: object[] | null;
  source_last_refresh: string | null;
  created_at: string | null;
  updated_at: string | null;
}
```

### PersonWithDetails

PersonProfile plus:

```typescript
{
  experience: PersonExperience[];
  education: PersonEducation[];
}
```

### PersonExperience

```typescript
{
  id: string;
  raw_payload_id: string;
  linkedin_url: string;
  company: string | null;
  company_domain: string | null;
  company_linkedin_url: string | null;
  company_org_id: number | null;
  title: string | null;
  summary: string | null;
  locality: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean | null;
  experience_order: number | null;
  created_at: string | null;
}
```

### PersonEducation

```typescript
{
  id: string;
  raw_payload_id: string;
  linkedin_url: string;
  school_name: string | null;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  grade: string | null;
  activities: string | null;
  education_order: number | null;
  created_at: string | null;
}
```

---

## Query Parameters

### Pagination (all list endpoints)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Results per page (1-100) |
| `offset` | integer | 0 | Number of results to skip |

### Company Filters

#### /api/companies

| Parameter | Type | Match | Description |
|-----------|------|-------|-------------|
| `domain` | string | partial | Filter by domain |
| `name` | string | partial | Filter by name |

#### /api/companies/firmo

| Parameter | Type | Match | Description |
|-----------|------|-------|-------------|
| `domain` | string | partial | Filter by domain |
| `name` | string | partial | Filter by name |
| `industry` | string | partial | Filter by industry |
| `country` | string | partial | Filter by country |
| `size_range` | string | exact | Filter by size range (e.g., "201-500") |
| `min_employees` | integer | >= | Minimum employee count |
| `max_employees` | integer | <= | Maximum employee count |
| `founded_after` | integer | >= | Minimum founding year |
| `founded_before` | integer | <= | Maximum founding year |

#### /api/companies/discovery

| Parameter | Type | Match | Description |
|-----------|------|-------|-------------|
| `domain` | string | partial | Filter by domain |
| `name` | string | partial | Filter by name |
| `industry` | string | exact | Filter by industry |
| `country` | string | exact | Filter by country |
| `size` | string | exact | Filter by size bucket |

### People Filters

#### /api/people

| Parameter | Type | Match | Description |
|-----------|------|-------|-------------|
| `linkedin_url` | string | exact | Filter by LinkedIn URL |
| `linkedin_slug` | string | exact | Filter by LinkedIn slug |
| `full_name` | string | partial | Filter by name |

#### /api/people/background

| Parameter | Type | Match | Description |
|-----------|------|-------|-------------|
| `linkedin_url` | string | partial | Filter by LinkedIn URL |
| `slug` | string | partial | Filter by LinkedIn slug |
| `name` | string | partial | Filter by name |
| `title` | string | partial | Filter by current title |
| `company` | string | partial | Filter by current company |
| `company_domain` | string | partial | Filter by company domain |
| `location` | string | partial | Filter by location |
| `country` | string | partial | Filter by country |

#### /api/people/discovery

| Parameter | Type | Match | Description |
|-----------|------|-------|-------------|
| `linkedin_url` | string | partial | Filter by LinkedIn URL |
| `name` | string | partial | Filter by name |
| `title` | string | partial | Filter by title |
| `company` | string | partial | Filter by company |
| `company_domain` | string | partial | Filter by company domain |
| `location` | string | partial | Filter by location |

#### /api/people/by-past-company

At least one parameter required:

| Parameter | Type | Match | Description |
|-----------|------|-------|-------------|
| `company_domain` | string | exact | Past company domain |
| `company_linkedin_url` | string | exact | Past company LinkedIn URL |
| `company_name` | string | partial | Past company name |

---

## Field Selection

No field selection parameter exists. All fields are returned.
