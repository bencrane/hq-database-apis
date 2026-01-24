# HQ Admin API Reference

Base URL: `https://api.revenueinfra.com`

All endpoints return JSON and include CORS headers. All error responses follow a standard format.

---

## Table of Contents

1. [Authentication & Access](#authentication--access)
2. [User Context](#user-context)
3. [Email Accounts](#email-accounts)
4. [LinkedIn Accounts](#linkedin-accounts)
5. [Automations](#automations)
6. [CRM Connections](#crm-connections)
7. [Slack Integration](#slack-integration)
8. [Organization Members](#organization-members)
9. [Leads](#leads)
10. [Error Responses](#error-responses)

---

## Authentication & Access

### POST /api/hq/request-access

Request access to an organization based on email domain.

**Request Body:**
```json
{
  "email": "user@company.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |

**Response (Domain Matched - 200):**
```json
{
  "status": "approved",
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "org_name": "Acme Corp"
}
```

**Response (No Match - 200):**
```json
{
  "status": "pending",
  "message": "We'll review your request and be in touch"
}
```

---

## User Context

### GET /api/hq/me

Get the current user's organization membership and role.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID | Yes | The user's ID |

**Example:** `GET /api/hq/me?user_id=550e8400-e29b-41d4-a716-446655440000`

**Response (200):**
```json
{
  "org": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "services_enabled": {
      "intent": true,
      "inbound": false,
      "outbound": true
    },
    "status": "active"
  },
  "role": "admin"
}
```

---

## Email Accounts

### GET /api/hq/accounts/email

List email accounts for an organization.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |
| limit | number | No | Max 100, default 50 |
| offset | number | No | Default 0 |

**Example:** `GET /api/hq/accounts/email?org_id=550e8400-e29b-41d4-a716-446655440000`

**Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "org_id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "sales@company.com",
      "provider": "google",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/hq/accounts/email

Create a new email account.

**Request Body:**
```json
{
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "sales@company.com",
  "provider": "google",
  "credentials_encrypted": "encrypted_string",
  "smartlead_account_id": "sl_12345"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |
| email | string | Yes | Valid email address |
| provider | enum | Yes | `google`, `microsoft`, or `other` |
| credentials_encrypted | string | No | Encrypted credentials |
| smartlead_account_id | string | No | Smartlead integration ID |

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "sales@company.com",
  "provider": "google",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### DELETE /api/hq/accounts/email/[id]

Delete an email account.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Email account ID |

**Example:** `DELETE /api/hq/accounts/email/550e8400-e29b-41d4-a716-446655440000`

**Response (200):**
```json
{
  "success": true,
  "deleted": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "sales@company.com"
  }
}
```

---

## LinkedIn Accounts

### GET /api/hq/accounts/linkedin

List LinkedIn accounts for an organization.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |
| limit | number | No | Max 100, default 50 |
| offset | number | No | Default 0 |

**Example:** `GET /api/hq/accounts/linkedin?org_id=550e8400-e29b-41d4-a716-446655440000`

**Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "org_id": "550e8400-e29b-41d4-a716-446655440000",
      "profile_url": "https://linkedin.com/in/johndoe",
      "display_name": "John Doe",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/hq/accounts/linkedin

Create a new LinkedIn account.

**Request Body:**
```json
{
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "session_cookie_encrypted": "encrypted_string"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |
| linkedin_url | string | Yes | Valid LinkedIn profile URL |
| session_cookie_encrypted | string | No | Encrypted session cookie |

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "profile_url": "https://linkedin.com/in/johndoe",
  "display_name": null,
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### DELETE /api/hq/accounts/linkedin/[id]

Delete a LinkedIn account.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | LinkedIn account ID |

**Example:** `DELETE /api/hq/accounts/linkedin/550e8400-e29b-41d4-a716-446655440000`

**Response (200):**
```json
{
  "success": true,
  "deleted": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "profile_url": "https://linkedin.com/in/johndoe"
  }
}
```

---

## Automations

### GET /api/hq/automations

List automation rules for an organization.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |
| limit | number | No | Max 100, default 50 |
| offset | number | No | Default 0 |

**Example:** `GET /api/hq/automations?org_id=550e8400-e29b-41d4-a716-446655440000`

**Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "org_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "New Lead Notification",
      "trigger_type": "new_lead",
      "trigger_config": {},
      "actions": [
        {
          "type": "send_slack",
          "config": { "channel": "#sales" }
        }
      ],
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/hq/automations

Create a new automation rule.

**Request Body:**
```json
{
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "New Lead Notification",
  "trigger_type": "new_lead",
  "trigger_config": {
    "source": "website"
  },
  "actions": [
    {
      "type": "send_slack",
      "config": { "channel": "#sales" }
    }
  ],
  "is_active": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |
| name | string | Yes | Automation name |
| trigger_type | enum | Yes | `new_lead`, `lead_status_change`, `scheduled`, or `manual` |
| trigger_config | object | No | Trigger-specific configuration |
| actions | array | Yes | Array of action objects |
| actions[].type | string | Yes | Action type identifier |
| actions[].config | object | No | Action-specific configuration |
| is_active | boolean | No | Default: true |

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "New Lead Notification",
  "trigger_type": "new_lead",
  "trigger_config": { "source": "website" },
  "actions": [
    { "type": "send_slack", "config": { "channel": "#sales" } }
  ],
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### GET /api/hq/automations/[id]

Get a single automation rule.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Automation ID |

**Example:** `GET /api/hq/automations/550e8400-e29b-41d4-a716-446655440000`

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "New Lead Notification",
  "trigger_type": "new_lead",
  "trigger_config": {},
  "actions": [],
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### PATCH /api/hq/automations/[id]

Update an automation rule.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Automation ID |

**Request Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "trigger_type": "scheduled",
  "trigger_config": { "cron": "0 9 * * *" },
  "actions": [
    { "type": "send_email", "config": {} }
  ],
  "is_active": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Automation name |
| trigger_type | enum | No | `new_lead`, `lead_status_change`, `scheduled`, or `manual` |
| trigger_config | object | No | Trigger-specific configuration |
| actions | array | No | Array of action objects |
| is_active | boolean | No | Enable/disable automation |

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Name",
  "trigger_type": "scheduled",
  "trigger_config": { "cron": "0 9 * * *" },
  "actions": [
    { "type": "send_email", "config": {} }
  ],
  "is_active": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-16T14:00:00Z"
}
```

### DELETE /api/hq/automations/[id]

Delete an automation rule.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Automation ID |

**Example:** `DELETE /api/hq/automations/550e8400-e29b-41d4-a716-446655440000`

**Response (200):**
```json
{
  "success": true,
  "deleted": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "New Lead Notification"
  }
}
```

---

## CRM Connections

### GET /api/hq/crm/connections

List CRM connections for an organization.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |

**Example:** `GET /api/hq/crm/connections?org_id=550e8400-e29b-41d4-a716-446655440000`

**Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "org_id": "550e8400-e29b-41d4-a716-446655440000",
      "provider": "salesforce",
      "instance_url": "https://company.salesforce.com",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/hq/crm/connect

Connect a CRM to an organization.

**Request Body:**
```json
{
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "provider": "salesforce",
  "credentials_encrypted": "encrypted_string",
  "access_token_encrypted": "encrypted_string",
  "refresh_token_encrypted": "encrypted_string",
  "instance_url": "https://company.salesforce.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |
| provider | enum | Yes | `salesforce`, `hubspot`, `pipedrive`, `zoho`, or `other` |
| credentials_encrypted | string | No | Encrypted credentials |
| access_token_encrypted | string | No | Encrypted OAuth access token |
| refresh_token_encrypted | string | No | Encrypted OAuth refresh token |
| instance_url | string | No | CRM instance URL |

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "provider": "salesforce",
  "instance_url": "https://company.salesforce.com",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### POST /api/hq/crm/test

Test a CRM connection.

**Request Body:**
```json
{
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "connection_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |
| connection_id | UUID | Yes | CRM connection ID |

**Response (200):**
```json
{
  "success": true,
  "connection_id": "550e8400-e29b-41d4-a716-446655440000",
  "provider": "salesforce",
  "message": "Connection test successful"
}
```

### DELETE /api/hq/crm/disconnect

Disconnect a CRM from an organization.

**Request Body:**
```json
{
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "connection_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |
| connection_id | UUID | Yes | CRM connection ID |

**Response (200):**
```json
{
  "success": true,
  "deleted": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "provider": "salesforce"
  }
}
```

---

## Slack Integration

### GET /api/hq/slack/connection

Get Slack connection for an organization.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |

**Example:** `GET /api/hq/slack/connection?org_id=550e8400-e29b-41d4-a716-446655440000`

**Response (200 - Connected):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "org_id": "550e8400-e29b-41d4-a716-446655440000",
    "team_id": "T12345678",
    "team_name": "Acme Corp",
    "channel_id": "C12345678",
    "channel_name": "sales-notifications",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (200 - Not Connected):**
```json
{
  "data": null
}
```

### POST /api/hq/slack/connect

Connect Slack to an organization.

**Request Body:**
```json
{
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "access_token_encrypted": "encrypted_string",
  "team_id": "T12345678",
  "team_name": "Acme Corp",
  "channel_id": "C12345678",
  "channel_name": "sales-notifications"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |
| access_token_encrypted | string | Yes | Encrypted Slack access token |
| team_id | string | Yes | Slack workspace ID |
| team_name | string | Yes | Slack workspace name |
| channel_id | string | No | Default channel ID |
| channel_name | string | No | Default channel name |

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "team_id": "T12345678",
  "team_name": "Acme Corp",
  "channel_id": "C12345678",
  "channel_name": "sales-notifications",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### DELETE /api/hq/slack/disconnect

Disconnect Slack from an organization.

**Request Body:**
```json
{
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "connection_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |
| connection_id | UUID | Yes | Slack connection ID |

**Response (200):**
```json
{
  "success": true,
  "deleted": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "team_name": "Acme Corp"
  }
}
```

---

## Organization Members

### GET /api/hq/org/members

List members of an organization.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |

**Example:** `GET /api/hq/org/members?org_id=550e8400-e29b-41d4-a716-446655440000`

**Response (200):**
```json
{
  "data": [
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "role": "admin",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "user_id": "660e8400-e29b-41d4-a716-446655440000",
      "role": "member",
      "created_at": "2024-01-16T14:00:00Z"
    }
  ]
}
```

### POST /api/hq/org/invite

Invite a new member to an organization.

**Request Body:**
```json
{
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "newuser@company.com",
  "role": "member"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |
| email | string | Yes | Email address to invite |
| role | enum | No | `admin`, `member`, or `viewer`. Default: `member` |

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "newuser@company.com",
  "role": "member",
  "expires_at": "2024-01-22T10:30:00Z",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### DELETE /api/hq/org/members/[user_id]

Remove a member from an organization.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID | Yes | User ID to remove |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |

**Example:** `DELETE /api/hq/org/members/550e8400-e29b-41d4-a716-446655440000?org_id=660e8400-e29b-41d4-a716-446655440000`

**Response (200):**
```json
{
  "success": true,
  "deleted": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "member"
  }
}
```

---

## Leads

### GET /api/hq/leads

List leads for an organization.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| org_id | UUID | Yes | Organization ID |
| limit | number | No | Max 100, default 50 |
| offset | number | No | Default 0 |

**Example:** `GET /api/hq/leads?org_id=550e8400-e29b-41d4-a716-446655440000`

**Response (200):**
```json
{
  "data": []
}
```

*Note: This endpoint currently returns an empty array as a stub.*

### GET /api/hq/leads/[id]

Get a single lead.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Lead ID |

**Example:** `GET /api/hq/leads/550e8400-e29b-41d4-a716-446655440000`

**Response (404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Lead not found"
  }
}
```

*Note: This endpoint currently returns 404 for all requests as a stub.*

---

## Error Responses

All endpoints return errors in a consistent format.

### Validation Error (400)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid data",
    "details": [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "undefined",
        "path": ["org_id"],
        "message": "Required"
      }
    ]
  }
}
```

### Not Found (404)
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### Conflict (409)
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Resource already exists"
  }
}
```

### Internal Error (500)
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## CORS

All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

All endpoints respond to `OPTIONS` requests with a `204 No Content` status.
