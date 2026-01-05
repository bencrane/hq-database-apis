# Database Schema

HQ Master Data Warehouse schema documentation.

## Schemas Overview

The database uses PostgreSQL with five schemas:

| Schema | Purpose |
|--------|---------|
| `public` | Default schema (unused) |
| `core` | Canonical entity tables (companies, people) |
| `reference` | Configuration and reference data |
| `raw` | Raw payloads from enrichment providers |
| `extracted` | Parsed/transformed data ready for consumption |

---

## core Schema

Canonical entity tables that establish "this entity exists in our system." These are the minimal reference tables that other schemas can link to.

### companies

Canonical company records. One row per unique domain.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| domain | text | NO | Company domain (unique identifier) |
| name | text | YES | Company name |
| linkedin_url | text | YES | LinkedIn company URL |
| created_at | timestamptz | NO | Record creation timestamp |
| updated_at | timestamptz | NO | Record update timestamp |

**Indexes:**
- `idx_core_companies_domain` on `domain`
- `idx_core_companies_name` on `name`

### people

Canonical person records. One row per unique LinkedIn URL.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| linkedin_url | text | NO | LinkedIn profile URL (unique identifier) |
| linkedin_slug | text | YES | LinkedIn profile slug |
| full_name | text | YES | Full name |
| created_at | timestamptz | NO | Record creation timestamp |
| updated_at | timestamptz | NO | Record update timestamp |

**Indexes:**
- `idx_core_people_linkedin_url` on `linkedin_url`
- `idx_core_people_linkedin_slug` on `linkedin_slug`

---

## reference Schema

### enrichment_workflow_registry

Defines available enrichment workflows.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| workflow_slug | text | NO | Unique identifier (e.g., "clay-company-firmographics") |
| provider | text | NO | Data provider (e.g., "clay", "openai") |
| platform | text | NO | Execution platform (e.g., "clay", "modal") |
| payload_type | text | NO | Type of payload (e.g., "firmographics", "profile") |
| entity_type | text | NO | Entity type (e.g., "company", "person") |
| description | text | YES | Human-readable description |
| created_at | timestamptz | YES | Record creation timestamp |

### company_icp

Ideal Customer Profile (ICP) definitions for companies. Defines what target companies and people a given company wants to reach.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| domain | text | NO | The company who owns this ICP (unique) |
| company_criteria | jsonb | YES | Criteria for target companies |
| person_criteria | jsonb | YES | Criteria for target people |
| notes | text | YES | Notes or tags |
| created_at | timestamptz | NO | Record creation timestamp |
| updated_at | timestamptz | NO | Record update timestamp |

**company_criteria structure:**
```json
{
  "industries": ["Software Development", "Technology"],
  "size_buckets": ["51-200", "201-500"],
  "employee_count_min": 50,
  "employee_count_max": 500,
  "countries": ["United States", "Canada"],
  "founded_min": 2015,
  "founded_max": null
}
```

**person_criteria structure:**
```json
{
  "title_contains_any": ["VP", "Director", "Head of", "Chief"],
  "title_contains_all": ["Marketing", "Demand Gen", "Growth"],
  "seniority": ["VP", "Director", "C-Suite"]
}
```

**Indexes:**
- `idx_company_icp_domain` on `domain`

### company_customers

Known customers of a company (for "worked at customer" signal).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| domain | text | NO | The company whose customers these are |
| customer_domain | text | NO | The customer's domain |
| customer_name | text | YES | Customer company name |
| source | text | YES | Source of data (e.g., "manual", "scraped") |
| notes | text | YES | Notes or tags |
| created_at | timestamptz | NO | Record creation timestamp |

**Indexes:**
- `idx_company_customers_domain` on `domain`
- `idx_company_customers_customer_domain` on `customer_domain`

---

## raw Schema

### company_payloads

Raw company enrichment payloads.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| workflow_id | uuid | NO | FK to enrichment_workflow_registry |
| identifier | text | NO | Company identifier (domain) |
| payload | jsonb | NO | Raw JSON payload from provider |
| created_at | timestamptz | YES | Record creation timestamp |

### person_payloads

Raw person enrichment payloads.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| workflow_id | uuid | NO | FK to enrichment_workflow_registry |
| identifier | text | NO | Person identifier (LinkedIn URL) |
| payload | jsonb | NO | Raw JSON payload from provider |
| created_at | timestamptz | YES | Record creation timestamp |

### icp_payloads

Raw ICP generation payloads from AI/Clay.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| domain | text | NO | Company domain this ICP is for |
| workflow_slug | text | NO | Workflow that generated this |
| provider | text | NO | Data provider |
| platform | text | NO | Execution platform |
| payload_type | text | NO | Type of payload |
| raw_payload | jsonb | NO | Raw JSON payload |
| created_at | timestamptz | NO | Record creation timestamp |

**Indexes:**
- `idx_raw_icp_payloads_domain` on `domain`

---

## extracted Schema

### company_firmographics

Enriched company data (from Clay company enrichment).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| raw_payload_id | uuid | NO | FK to raw.company_payloads |
| company_domain | text | NO | Company domain (primary identifier) |
| linkedin_url | text | YES | LinkedIn company URL |
| linkedin_slug | text | YES | LinkedIn company slug |
| linkedin_org_id | integer | YES | LinkedIn organization ID |
| clay_company_id | integer | YES | Clay internal company ID |
| name | text | YES | Company name |
| description | text | YES | Company description |
| website | text | YES | Company website URL |
| logo_url | text | YES | Company logo URL |
| company_type | text | YES | Company type (e.g., "Privately Held") |
| industry | text | YES | Primary industry |
| founded_year | integer | YES | Year founded |
| size_range | text | YES | Employee size range (e.g., "51-200") |
| employee_count | integer | YES | Exact employee count |
| follower_count | integer | YES | LinkedIn follower count |
| country | text | YES | Country code |
| locality | text | YES | City/locality |
| primary_location | jsonb | YES | Primary location details |
| all_locations | jsonb | YES | All office locations |
| specialties | text[] | YES | Company specialties/tags |
| source_last_refresh | timestamptz | YES | Last refresh from source |
| created_at | timestamptz | YES | Record creation timestamp |

### company_discovery

Lightweight company data (from Clay find-companies).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| raw_payload_id | uuid | NO | FK to raw.company_payloads |
| domain | text | NO | Company domain |
| name | text | YES | Company name |
| linkedin_url | text | YES | LinkedIn company URL |
| linkedin_company_id | integer | YES | LinkedIn company ID |
| clay_company_id | integer | YES | Clay company ID |
| size | text | YES | Size range |
| type | text | YES | Company type |
| country | text | YES | Country |
| location | text | YES | Location string |
| industry | text | YES | Industry |
| industries | jsonb | YES | Multiple industries |
| description | text | YES | Description |
| annual_revenue | text | YES | Revenue range |
| total_funding_amount_range_usd | text | YES | Funding range |
| resolved_domain | jsonb | YES | Domain resolution data |
| derived_datapoints | jsonb | YES | Clay derived datapoints |
| source_last_refresh | timestamptz | YES | Last refresh from source |
| created_at | timestamptz | YES | Record creation timestamp |
| updated_at | timestamptz | YES | Record update timestamp |

### person_profile

Enriched person data (from Clay person enrichment).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| raw_payload_id | uuid | NO | FK to raw.person_payloads |
| linkedin_url | text | NO | LinkedIn profile URL (primary identifier) |
| linkedin_slug | text | YES | LinkedIn profile slug |
| linkedin_profile_id | integer | YES | LinkedIn profile ID |
| first_name | text | YES | First name |
| last_name | text | YES | Last name |
| full_name | text | YES | Full name |
| headline | text | YES | LinkedIn headline |
| summary | text | YES | Profile summary |
| country | text | YES | Country |
| location_name | text | YES | Location string |
| connections | integer | YES | Connection count |
| num_followers | integer | YES | Follower count |
| picture_url | text | YES | Profile picture URL |
| jobs_count | integer | YES | Number of jobs |
| latest_title | text | YES | Current job title |
| latest_company | text | YES | Current company name |
| latest_company_domain | text | YES | Current company domain |
| latest_company_linkedin_url | text | YES | Current company LinkedIn URL |
| latest_company_org_id | integer | YES | Current company org ID |
| latest_locality | text | YES | Current job location |
| latest_start_date | date | YES | Current job start date |
| latest_end_date | date | YES | Current job end date |
| latest_is_current | boolean | YES | Is current job |
| certifications | jsonb | YES | Certifications array |
| languages | jsonb | YES | Languages array |
| courses | jsonb | YES | Courses array |
| patents | jsonb | YES | Patents array |
| projects | jsonb | YES | Projects array |
| publications | jsonb | YES | Publications array |
| volunteering | jsonb | YES | Volunteering array |
| awards | jsonb | YES | Awards array |
| source_last_refresh | timestamptz | YES | Last refresh from source |
| created_at | timestamptz | YES | Record creation timestamp |
| updated_at | timestamptz | YES | Record update timestamp |

### person_experience

Work experience records (extracted from person_profile).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| raw_payload_id | uuid | NO | FK to raw.person_payloads |
| linkedin_url | text | NO | Person's LinkedIn URL |
| company | text | YES | Company name |
| company_domain | text | YES | Company domain |
| company_linkedin_url | text | YES | Company LinkedIn URL |
| company_org_id | integer | YES | Company org ID |
| title | text | YES | Job title |
| summary | text | YES | Role description |
| locality | text | YES | Job location |
| start_date | date | YES | Start date |
| end_date | date | YES | End date (null if current) |
| is_current | boolean | YES | Is current role |
| experience_order | integer | YES | Order (0 = most recent) |
| created_at | timestamptz | YES | Record creation timestamp |

### person_education

Education records (extracted from person_profile).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| raw_payload_id | uuid | NO | FK to raw.person_payloads |
| linkedin_url | text | NO | Person's LinkedIn URL |
| school_name | text | YES | School name |
| degree | text | YES | Degree type |
| field_of_study | text | YES | Field of study |
| start_date | date | YES | Start date |
| end_date | date | YES | End date |
| grade | text | YES | Grade/GPA |
| activities | text | YES | Activities |
| education_order | integer | YES | Order |
| created_at | timestamptz | YES | Record creation timestamp |

### person_discovery

Lightweight person data (from Clay find-people).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| raw_payload_id | uuid | NO | FK to raw.person_payloads |
| linkedin_url | text | NO | LinkedIn profile URL |
| first_name | text | YES | First name |
| last_name | text | YES | Last name |
| full_name | text | YES | Full name |
| location_name | text | YES | Location |
| company_domain | text | YES | Current company domain |
| latest_title | text | YES | Current title |
| latest_company | text | YES | Current company |
| latest_start_date | date | YES | Current role start date |
| clay_company_table_id | text | YES | Clay table ID |
| clay_company_record_id | text | YES | Clay record ID |
| created_at | timestamptz | YES | Record creation timestamp |
| updated_at | timestamptz | YES | Record update timestamp |

---

## Data Flow

```
                    ┌─────────────────┐
                    │   Clay / Modal  │
                    │   (enrichment)  │
                    └────────┬────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────┐
│                    reference                         │
│  enrichment_workflow_registry                        │
└─────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────┐
│                       raw                            │
│  company_payloads    person_payloads                 │
│  (raw JSON)          (raw JSON)                      │
└─────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────┐
│                    extracted                         │
│  company_firmographics   person_profile              │
│  company_discovery       person_experience           │
│                          person_education            │
│                          person_discovery            │
└─────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────┐
│                       core                           │
│  companies (canonical)   people (canonical)          │
│  Deduplicated entities with stable IDs               │
└─────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────┐
│                   HQ Database API                    │
│               (this application)                     │
└─────────────────────────────────────────────────────┘
```

