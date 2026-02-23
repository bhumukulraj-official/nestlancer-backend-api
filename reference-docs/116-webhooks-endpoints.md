# Outbound Webhooks Service Endpoints

## 17. Outbound Webhooks Service

**Base Path**: `/api/v1/admin/webhooks`

### 17.1 Overview
Webhook management service for **outbound** event subscriptions (allowing clients to receive events from our system). Note: Inbound webhooks from third-party services (like Razorpay, GitHub) are handled centrally by the **Webhook Ingestion Service** (`120-webhooks-inbound-endpoints.md`).

### 17.2 Webhook Management Endpoints (Admin Endpoints)

| Method | Endpoint | Description | Rate Limit | Role |
|--------|----------|-------------|------------|------|
| `GET` | `/health` | Health check (Simplified response) | 1000/hour | Yes |
| `GET` | `/` | List webhooks | 1000/hour | admin |
| `POST` | `/` | Create webhook | 100/hour | admin |
| `GET` | `/{id}` | Get webhook details | 1000/hour | admin |
| `PATCH` | `/{id}` | Update webhook | 200/hour | admin |
| `DELETE` | `/{id}` | Delete webhook | 100/hour | admin |
| `POST` | `/{id}/enable` | Enable webhook | 200/hour | admin |
| `POST` | `/{id}/disable` | Disable webhook | 200/hour | admin |
| `GET` | `/{id}/deliveries` | Delivery history | 2000/hour | admin |
| `GET` | `/{id}/deliveries/{deliveryId}` | Delivery details | 1000/hour | admin |
| `POST` | `/{id}/test` | Send test event | 50/hour | admin |
| `POST` | `/{id}/deliveries/{deliveryId}/retry` | Retry delivery | 100/hour | admin |
| `GET` | `/{id}/stats` | Webhook stats | 1000/hour | admin |
| `GET` | `/events` | List available events | 500/hour | admin |

### 17.3 Request/Response Examples


> **Note:** For brevity, `X-CSRF-Token` is omitted from state-changing examples unless specifically highlighted. It is only required when using cookie-based authentication. Rate limit headers are shown in the first example as a reference for all responses.

#### POST /
```json
// Request
POST /api/v1/admin/webhooks
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "CRM Integration",
  "description": "Sync new projects and payments with CRM",
  "url": "https://crm.example.com/webhooks/yourdomain",
  "events": [
    "project.created",
    "project.completed",
    "payment.completed",
    "quote.accepted"
  ],
  "headers": {
    "X-API-Key": "crmApiKeyXxx"
  },
  "secret": "webhookSecretXxx",
  "enabled": true,
  "retryPolicy": {
    "maxRetries": 5,
    "retryInterval": "exponential"
  }
}

// Response (201 Created)
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705323000
X-API-Version: v1
X-Request-ID: reqAbc123

{
  "status": "success",
  "message": "Webhook created successfully",
  "data": {
    "id": "whkAbc123",
    "name": "CRM Integration",
    "url": "https://crm.example.com/webhooks/yourdomain",
    "events": [
      "project.created",
      "project.completed",
      "payment.completed",
      "quote.accepted"
    ],
    "enabled": true,
    "signingSecret": "whsecXxxxxxxxxxxxxxxx",
    "createdAt": "2024-02-18T10:30:00.000Z"
  },
  "metadata": {
    "timestamp": "2024-02-18T10:30:00.000Z",
    "requestId": "reqAbc123",
    "version": "v1"
  }
}
```

#### POST /{id}/test
```json
// Request
POST /api/v1/admin/webhooks/whkAbc123/test
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "event": "project.created"
}

// Response (200 OK)
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705323000
X-API-Version: v1
X-Request-ID: reqAbc123

{
  "status": "success",
  "message": "Test webhook sent successfully",
  "data": {
    "deliveryId": "delTestXyz789",
    "event": "project.created",
    "response": {
      "statusCode": 200,
      "body": "{\"received\":true}",
      "headers": {
        "content-type": "application/json"
      },
      "duration": 245
    },
    "success": true,
    "sentAt": "2024-02-18T10:30:00.000Z"
  },
  "metadata": {
    "timestamp": "2024-02-18T10:30:00.000Z",
    "requestId": "reqAbc123",
    "version": "v1"
  }
}
```

### 17.4 Error Codes

| Code | HTTP Status | Description | Retryable |
|------|-------------|-------------|-----------|
| `WHK_001` | 404 | Webhook not found | No |
| `WHK_002` | 502 | Webhook delivery failed | Yes |
| `WHK_003` | 422 | Invalid webhook configuration | No |
