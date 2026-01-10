# Views API Documentation

API endpoints for the Cold Email Command Center frontend.

## Base URL

**Production:** `https://api.revenueinfra.com`  
**Local:** `http://localhost:3004`

---

## Endpoints

### People

```
GET https://api.revenueinfra.com/api/views/people
```

Returns people profiles with company firmographics from `api.vw_people`.

#### Query Parameters

| Parameter | Type | Match | Description |
|-----------|------|-------|-------------|
| `limit` | integer | - | Results per page (1-100, default: 50) |
| `offset` | integer | - | Number of results to skip (default: 0) |
| `name` | string | partial | Filter by full name |
| `job_title` | string | partial | Filter by job title |
| `company_name` | string | partial | Filter by company name |
| `company_domain` | string | partial | Filter by company domain |
| `industry` | string | partial | Filter by industry |
| `size_range` | string | exact | Filter by company size (e.g., "51-200", "1000+") |
| `location` | string | partial | Filter by location |
| `country` | string | partial | Filter by company country |

#### Example Requests

```bash
# Get first 50 people
curl "https://api.revenueinfra.com/api/views/people"

# Filter by job title
curl "https://api.revenueinfra.com/api/views/people?job_title=CTO"

# Filter by industry and size
curl "https://api.revenueinfra.com/api/views/people?industry=SaaS&size_range=51-200"

# Paginate
curl "https://api.revenueinfra.com/api/views/people?limit=100&offset=100"
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Person ID |
| `linkedin_url` | string | LinkedIn profile URL |
| `linkedin_slug` | string | LinkedIn profile slug |
| `first_name` | string | First name |
| `last_name` | string | Last name |
| `full_name` | string | Full name |
| `initials` | string | Uppercase initials (e.g., "SC") |
| `picture_url` | string | Profile picture URL |
| `job_title` | string | Current job title |
| `headline` | string | LinkedIn headline |
| `company_name` | string | Current company name |
| `company_domain` | string | Current company domain |
| `company_linkedin_url` | string | Company LinkedIn URL |
| `location` | string | Location |
| `is_current_role` | boolean | Is this their current role |
| `industry` | string | Company industry |
| `size_range` | string | Company size range |
| `employee_count` | integer | Company employee count |
| `company_country` | string | Company country |
| `connections` | integer | LinkedIn connections |
| `followers` | integer | LinkedIn followers |
| `source_last_refresh` | timestamp | Last data refresh |
| `created_at` | timestamp | Record created |
| `updated_at` | timestamp | Record updated |

---

### Companies

```
GET https://api.revenueinfra.com/api/views/companies
```

Returns company firmographics from `api.vw_companies`.

#### Query Parameters

| Parameter | Type | Match | Description |
|-----------|------|-------|-------------|
| `limit` | integer | - | Results per page (1-100, default: 50) |
| `offset` | integer | - | Number of results to skip (default: 0) |
| `name` | string | partial | Filter by company name |
| `domain` | string | partial | Filter by domain |
| `industry` | string | partial | Filter by industry |
| `size_range` | string | exact | Filter by size range |
| `country` | string | partial | Filter by country |
| `min_employees` | integer | >= | Minimum employee count |
| `max_employees` | integer | <= | Maximum employee count |
| `founded_after` | integer | >= | Founded year minimum |
| `founded_before` | integer | <= | Founded year maximum |

#### Example Requests

```bash
# Get first 50 companies
curl "https://api.revenueinfra.com/api/views/companies"

# Filter by industry
curl "https://api.revenueinfra.com/api/views/companies?industry=Manufacturing"

# Filter by employee count range
curl "https://api.revenueinfra.com/api/views/companies?min_employees=50&max_employees=500"

# Filter by founding year
curl "https://api.revenueinfra.com/api/views/companies?founded_after=2015"

# Combine filters
curl "https://api.revenueinfra.com/api/views/companies?industry=SaaS&country=United%20States&size_range=51-200"
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Company ID |
| `domain` | string | Company domain |
| `linkedin_url` | string | LinkedIn company URL |
| `linkedin_slug` | string | LinkedIn company slug |
| `name` | string | Company name |
| `description` | string | Company description |
| `website` | string | Company website |
| `logo_url` | string | Company logo URL |
| `company_type` | string | Company type (e.g., "Privately Held") |
| `industry` | string | Industry |
| `founded_year` | integer | Year founded |
| `size_range` | string | Size range (e.g., "51-200") |
| `employee_count` | integer | Employee count |
| `country` | string | Country |
| `locality` | string | City/locality |
| `primary_location` | object | Primary location details |
| `linkedin_followers` | integer | LinkedIn follower count |
| `specialties` | array | Company specialties |
| `source_last_refresh` | timestamp | Last data refresh |
| `created_at` | timestamp | Record created |

---

## Response Format

### Success (List)

```json
{
  "data": [...],
  "pagination": {
    "total": 1234,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | INTERNAL_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
```

---

## CORS

CORS is enabled for all origins. These endpoints can be called directly from any frontend.

---

## Authentication

**None.** Endpoints are publicly accessible.

