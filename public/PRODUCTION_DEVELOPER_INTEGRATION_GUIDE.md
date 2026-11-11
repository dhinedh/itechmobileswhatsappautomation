# iTechnic Mobiles WhatsApp Business API & CRM Platform
## Production Developer Integration Manual & API Reference Guide
**Version:** `1.0.0 (Production Live)`  
**Protocol:** REST / JSON over HTTPS  
**Cloud Infrastructure:** Meta WhatsApp Cloud API v20.0 · Node.js/Express · MongoDB Cluster  
**Base Production URL:** `https://whatapp-automation-kxml.onrender.com`  
**Official Website:** `https://itechnicmobiles.com`  
**Store / Support Hotline:** `+91 9361863063`  

---

## Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Production Environment & Authentication](#2-production-environment--authentication)
3. [Quick Start: 5-Minute Integration](#3-quick-start-5-minute-integration)
4. [CRM Automated Workflow Endpoints](#4-crm-automated-workflow-endpoints)
   - [4.1 Repair Booking Confirmation](#41-repair-booking-confirmation)
   - [4.2 Live Repair Status Update](#42-live-repair-status-update)
   - [4.3 Device Ready for Pickup & Billing](#43-device-ready-for-pickup--billing)
   - [4.4 Doorstep Pickup Scheduled](#44-doorstep-pickup-scheduled)
   - [4.5 Service Quotation Estimate](#45-service-quotation-estimate)
   - [4.6 Admin Instant WhatsApp Alert](#46-admin-instant-whatsapp-alert)
   - [4.7 Welcome Customer Greeting](#47-welcome-customer-greeting)
   - [4.8 Feedback & Google Review Request](#48-feedback--google-review-request)
   - [4.9 Promotional & Festival Broadcasts](#49-promotional--festival-broadcasts)
5. [Universal Messaging API](#5-universal-messaging-api)
   - [5.1 Send Any Meta Template](#51-send-any-meta-template)
   - [5.2 Send Direct WhatsApp Text (24h Window)](#52-send-direct-whatsapp-text-24h-window)
6. [Meta Message Templates Management API](#6-meta-message-templates-management-api)
   - [6.1 List Live Templates & Status](#61-list-live-templates--status)
   - [6.2 Submit New Template to Meta](#62-submit-new-template-to-meta)
   - [6.3 Delete Template from Meta](#63-delete-template-from-meta)
7. [Customer Web APIs (Public Endpoints)](#7-customer-web-apis-public-endpoints)
   - [7.1 Submit Repair Booking (Web Form)](#71-submit-repair-booking-web-form)
   - [7.2 Live Repair Status Tracking (Widget API)](#72-live-repair-status-tracking-widget-api)
8. [Webhook Ingestion & Real-Time Events](#8-webhook-ingestion--real-time-events)
   - [8.1 Webhook Verification](#81-webhook-verification)
   - [8.2 Inbound Message Payload](#82-inbound-message-payload)
   - [8.3 Message Delivery Receipts](#83-message-delivery-receipts)
9. [SDK & Multi-Language Code Snippets](#9-sdk--multi-language-code-snippets)
   - [Node.js (Axios / Fetch)](#nodejs-axios--fetch)
   - [Python 3 (Requests)](#python-3-requests)
   - [PHP (cURL)](#php-curl)
   - [C# / .NET (HttpClient)](#c--net-httpclient)
   - [cURL Command Line](#curl-command-line)
10. [Error Handling, Meta Error Codes & Rate Limits](#10-error-handling-meta-error-codes--rate-limits)
11. [Compliance, 24-Hour Session Rules & Best Practices](#11-compliance-24-hour-session-rules--best-practices)
12. [Postman Collection & Download Links](#12-postman-collection--download-links)

---

## 1. Overview & Architecture

The **iTechnic Mobiles WhatsApp API Platform** is an enterprise-grade middleware linking any external CRM, ERP, POS, or billing software directly with Meta's official **WhatsApp Cloud API (Graph API v20.0)**.

```
+-------------------------------------------------------------------------+
|                  External Enterprise Client Systems                     |
|        (Your Billing Software / CRM / Mobile App / Web Portal)           |
+-------------------------------------------------------------------------+
                                    |
                                    | REST HTTPS (API Key Auth: x-api-key)
                                    v
+-------------------------------------------------------------------------+
|        iTechnic Mobiles Gateway (Express.js / Node.js Engine)          |
|  - API Key Security Middleware                                          |
|  - Workflow Orchestrator & Auto Template Parameter Mapper               |
|  - MongoDB CRM Ledger (Customer history, repairs, warranty, tickets)    |
|  - Webhook Dispatcher & Interactive Chatbot Fallback Engine             |
|  - Node-Cron Scheduled Reminders (Pickup alerts, 90-day warranty, CRM)  |
+-------------------------------------------------------------------------+
                                    |
                                    | Meta Graph API v20.0 HTTPS
                                    v
+-------------------------------------------------------------------------+
|                   Meta WhatsApp Cloud Infrastructure                     |
|  WABA ID: 1758570912097342  |  Official WhatsApp Business Number       |
+-------------------------------------------------------------------------+
                                    |
                                    v
                         Customer WhatsApp Device
```

### Key Capabilities
- **Zero-Config Template Mapping**: You don't need to craft complicated Meta components payload. Pre-mapped endpoints take simple JSON fields (`customerName`, `jobId`, `device`, `status`) and build Meta Cloud API components automatically.
- **24/7 Out-of-Session Delivery**: Uses pre-approved Meta Utility & Marketing templates to deliver messages anytime, even if the customer hasn't messaged within 24 hours.
- **Built-in Inbound Webhook Support**: Handles inbound customer queries, button clicks, and media inspections.
- **Bi-Directional Sync**: Logs all interactions into MongoDB and provides a live CRM dashboard.

---

## 2. Production Environment & Authentication

### Production Endpoints
- **Base URL:** `https://whatapp-automation-kxml.onrender.com`
- **API Version Route:** `/api/v1`
- **Full API Root:** `https://whatapp-automation-kxml.onrender.com/api/v1`

### Authentication Model
All requests to `/api/v1/*` (except public documentation endpoints) require authentication via the **API Secret Key**.

Pass the API key using either of the following HTTP headers:

#### Option A: Dedicated API Key Header (Recommended)
```http
x-api-key: itech_live_sec_7f9984e1b9384e9d9a1f
```

#### Option B: Authorization Bearer Header
```http
Authorization: Bearer itech_live_sec_7f9984e1b9384e9d9a1f
```

> **Security Note:** Never expose the API Key in client-side front-end code (such as public browser JavaScript). Always call the WhatsApp API Gateway from your secure backend services.

---

## 3. Quick Start: 5-Minute Integration

### Check Credentials & WABA Configuration
To verify your API connectivity, send a `GET` request:

```bash
curl -X GET "https://whatapp-automation-kxml.onrender.com/api/v1/auth/key" \
  -H "x-api-key: itech_live_sec_7f9984e1b9384e9d9a1f"
```

**Response (200 OK):**
```json
{
  "success": true,
  "apiKey": "itech_live_sec_7f9984e1b9384e9d9a1f",
  "wabaId": "1758570912097342",
  "phoneNumberId": "your_meta_phone_number_id",
  "baseUrl": "https://whatapp-automation-kxml.onrender.com/api/v1"
}
```

---

## 4. CRM Automated Workflow Endpoints

All CRM endpoints accept a `POST` request with a JSON body and automatically dispatch the designated Meta-approved template to the customer's WhatsApp number.

### Phone Number Format
Phone numbers can be provided with country code (e.g., `919342400879`) or 10 digits (`9342400879`). The gateway automatically normalizes Indian mobile numbers by prepending `91`.

---

### 4.1 Repair Booking Confirmation
Triggers an immediate confirmation notification when a new repair order or job ticket is created in your CRM/ERP.

- **Method:** `POST`
- **Path:** `/api/v1/crm/repair-booking-confirmed`
- **Meta Template:** `repair_booking_confirmed` (Category: UTILITY)

#### Request Headers
```http
Content-Type: application/json
x-api-key: itech_live_sec_7f9984e1b9384e9d9a1f
```

#### Request Body (JSON)
| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `phone` | `string` | **Yes** | Customer phone number | `"919342400879"` |
| `customerName` | `string` | **Yes** | Customer full name | `"Murali"` |
| `jobId` | `string` | **Yes** | Unique repair ticket ID | `"REP-1024"` |
| `device` | `string` | **Yes** | Phone brand & model | `"Apple iPhone 13"` |
| `service` | `string` | **Yes** | Service requested | `"Screen Replacement"` |
| `turnaround` | `string` | No | Estimated turnaround | `"Same Day (60 mins)"` |

#### Example Request (cURL)
```bash
curl -X POST "https://whatapp-automation-kxml.onrender.com/api/v1/crm/repair-booking-confirmed" \
  -H "Content-Type: application/json" \
  -H "x-api-key: itech_live_sec_7f9984e1b9384e9d9a1f" \
  -d '{
    "phone": "919342400879",
    "customerName": "Murali",
    "jobId": "REP-1024",
    "device": "Apple iPhone 13",
    "service": "Screen Replacement",
    "turnaround": "Same Day"
  }'
```

#### Example Response (200 OK)
```json
{
  "success": true,
  "data": {
    "messaging_product": "whatsapp",
    "contacts": [{ "input": "919342400879", "wa_id": "919342400879" }],
    "messages": [{ "id": "wamid.HBgMOTE5MzQyNDAwODc5FQIAERgSQTJBM0Q3OTk4NkE2NzFDMkYA" }]
  }
}
```

---

### 4.2 Live Repair Status Update
Keeps customer updated as their device progresses through diagnostic stages: `Diagnosing`, `In Repair`, `Testing`, or `Completed`.

- **Method:** `POST`
- **Path:** `/api/v1/crm/repair-status-update`
- **Meta Template:** `repair_status_update` (Category: UTILITY)

#### Request Body (JSON)
```json
{
  "phone": "919342400879",
  "customerName": "Murali",
  "jobId": "REP-1024",
  "device": "Apple iPhone 13",
  "status": "In Repair (Technician replacing display panel)"
}
```

---

### 4.3 Device Ready for Pickup & Billing
Alerts the customer that the repair has passed quality assurance and is ready for pickup at the store, displaying the total invoice amount.

- **Method:** `POST`
- **Path:** `/api/v1/crm/device-ready-pickup`
- **Meta Template:** `repair_ready_pickup` (Category: UTILITY)

#### Request Body (JSON)
```json
{
  "phone": "919342400879",
  "customerName": "Murali",
  "device": "Apple iPhone 13",
  "jobId": "REP-1024",
  "totalAmount": "3500"
}
```

---

### 4.4 Doorstep Pickup Scheduled
Confirms an appointment for home or office pickup by a service executive, including date, time slot, and address.

- **Method:** `POST`
- **Path:** `/api/v1/crm/doorstep-pickup`
- **Meta Template:** `doorstep_pickup_confirmed` (Category: UTILITY)

#### Request Body (JSON)
```json
{
  "phone": "919342400879",
  "customerName": "Murali",
  "requestId": "PU-502",
  "device": "OnePlus 11",
  "slot": "Today, 3:00 PM – 5:00 PM",
  "address": "No. 12, Main Road, Tirukannur, Pondicherry"
}
```

---

### 4.5 Service Quotation Estimate
Sends a formal diagnostic report and price quotation to the customer. When received on WhatsApp, the customer can review the cost and respond to approve or decline the repair.

- **Method:** `POST`
- **Path:** `/api/v1/crm/service-quotation`
- **Meta Template:** `service_quotation_estimate` (Category: UTILITY)

#### Request Body (JSON)
```json
{
  "phone": "919342400879",
  "customerName": "Murali",
  "device": "Samsung Galaxy S21",
  "jobId": "REP-1024",
  "issue": "Display Touch Panel Replacement",
  "quotedCost": "4500"
}
```

---

### 4.6 Admin Instant WhatsApp Alert
Notifies store managers and technicians on their WhatsApp numbers when an urgent job or high-priority booking is submitted in the CRM.

- **Method:** `POST`
- **Path:** `/api/v1/crm/admin-alert`
- **Meta Template:** `admin_service_alert` (Category: UTILITY)

#### Request Body (JSON)
```json
{
  "phone": "919342400879",
  "customerName": "Karthik Raja",
  "customerPhone": "919876543210",
  "device": "iPhone 14 Pro Max",
  "service": "Water Damage Board Diagnostics",
  "id": "REP-8492"
}
```
*(Note: If `phone` is omitted, the alert defaults to the `ADMIN_PHONE` environment variable).*

---

### 4.7 Welcome Customer Greeting
Welcomes a new customer to the iTechnic Mobiles ecosystem, sharing brand trust metrics and store operating hours.

- **Method:** `POST`
- **Path:** `/api/v1/crm/welcome-greeting`
- **Meta Template:** `itechnic_welcome_greeting` (Category: UTILITY / MARKETING)

#### Request Body (JSON)
```json
{
  "phone": "919342400879",
  "customerName": "Murali"
}
```

---

### 4.8 Feedback & Google Review Request
Triggers an automated review request after a device is delivered, inviting the customer to rate their experience on Google.

- **Method:** `POST`
- **Path:** `/api/v1/crm/feedback-review`
- **Meta Template:** `customer_feedback_review` (Category: UTILITY)

#### Request Body (JSON)
```json
{
  "phone": "919342400879",
  "customerName": "Murali",
  "device": "Apple iPhone 13",
  "jobId": "REP-1024"
}
```

---

### 4.9 Promotional & Festival Broadcasts
Allows marketing systems to send pre-approved offers to opted-in customer segments.

#### Endpoint 1: Promotional Offer Broadcast
- **Path:** `/api/v1/crm/promotional-broadcast`
- **Meta Template:** `promotional_offer_broadcast` (Category: MARKETING)
```json
{
  "phone": "919342400879",
  "customerName": "Murali",
  "offerTitle": "Screen Protection Mega Deal",
  "discountPercent": "20% OFF",
  "validUntil": "Sunday 8:00 PM"
}
```

#### Endpoint 2: Festival Discount Promo
- **Path:** `/api/v1/crm/festival-promo`
- **Meta Template:** `festival_discount_promo` (Category: MARKETING)
```json
{
  "phone": "919342400879",
  "customerName": "Murali",
  "discountDesc": "Special Festival Bonus on all Battery & Screen Replacements",
  "promoCode": "FESTIVAL2026",
  "validUntil": "15th November"
}
```

#### Endpoint 3: Service Discount Promo
- **Path:** `/api/v1/crm/service-discount-promo`
- **Meta Template:** `service_discount_broadcast` (Category: MARKETING)
```json
{
  "phone": "919342400879",
  "customerName": "Murali",
  "startingPrice": "₹499",
  "offerDetail": "Free Ultrasonic Cleaning with any Charging Port Repair"
}
```

---

## 5. Universal Messaging API

If you have created custom Meta templates or need to send direct text messages within an active customer chat window, use the Universal Messaging API.

### 5.1 Send Any Meta Template
Dispatches any template approved in your Meta WhatsApp Business Manager with variable replacement.

- **Method:** `POST`
- **Path:** `/api/v1/messages/send-template`

#### Request Body (JSON)
```json
{
  "to": "919342400879",
  "templateName": "repair_booking_confirmed",
  "languageCode": "en_US",
  "bodyVariables": [
    "Murali",
    "REP-1024",
    "Apple iPhone 13",
    "Screen Replacement",
    "Same Day"
  ]
}
```

#### Explanation of `bodyVariables`:
The items in `bodyVariables` map positionally to the template's placeholders:
- `bodyVariables[0]` replaces `{{1}}` (e.g., Customer Name)
- `bodyVariables[1]` replaces `{{2}}` (e.g., Job ID)
- `bodyVariables[2]` replaces `{{3}}` (e.g., Device)
- etc.

---

### 5.2 Send Direct WhatsApp Text (24h Window)
Sends a free-form text message to the customer.

> **Important Meta Rule:** Direct text messages can only be sent within **24 hours** of the customer's last incoming message to your WhatsApp number. Outside of this 24-hour window, you must use a Meta-approved template (Section 4 or 5.1).

- **Method:** `POST`
- **Path:** `/api/v1/messages/send-text`

#### Request Body (JSON)
```json
{
  "to": "919342400879",
  "text": "Hello Murali, our technician is reviewing your device. We will call you within 15 minutes."
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "messageId": "wamid.HBgMOTE5MzQyNDAwODc5FQIAERgSQTJBM0Q3OTk4NkE2NzFDMkYA",
  "metaResponse": {
    "messaging_product": "whatsapp",
    "contacts": [{ "input": "919342400879", "wa_id": "919342400879" }],
    "messages": [{ "id": "wamid.HBgMOTE5MzQyNDAwODc5FQIAERgSQTJBM0Q3OTk4NkE2NzFDMkYA" }]
  }
}
```

---

## 6. Meta Message Templates Management API

Manage your Meta WhatsApp templates programmatically without logging into the Meta Business Manager.

### 6.1 List Live Templates & Status
Fetches all templates registered under your WABA account with their real-time approval status (`APPROVED`, `PENDING`, `REJECTED`).

- **Method:** `GET`
- **Path:** `/api/v1/templates`

#### Example Response (200 OK)
```json
{
  "success": true,
  "count": 12,
  "wabaId": "1758570912097342",
  "templates": [
    {
      "name": "repair_booking_confirmed",
      "status": "APPROVED",
      "category": "UTILITY",
      "language": "en_US",
      "id": "108392019482910"
    },
    {
      "name": "repair_status_update",
      "status": "APPROVED",
      "category": "UTILITY",
      "language": "en_US",
      "id": "108392019482911"
    }
  ]
}
```

---

### 6.2 Submit New Template to Meta
Creates and registers a new template with Meta Graph API for automated approval.

- **Method:** `POST`
- **Path:** `/api/v1/templates`

#### Request Body (JSON)
```json
{
  "name": "express_device_reception",
  "category": "UTILITY",
  "language": "en_US",
  "headerType": "TEXT",
  "headerText": "Device Inward Receipt",
  "bodyText": "Hello {{1}}, our technician has received your {{2}} (Job ID: {{3}}). Diagnosis will begin shortly.",
  "footerText": "iTechnic Mobiles · Quality You Can Trust",
  "buttons": [
    { "type": "QUICK_REPLY", "text": "Track Status" },
    { "type": "PHONE_NUMBER", "text": "Call Support", "phone_number": "+919361863063" }
  ],
  "sampleValues": ["Murali", "iPhone 13", "REP-1024"]
}
```

---

### 6.3 Delete Template from Meta
Deletes an obsolete or rejected template by name.

- **Method:** `DELETE`
- **Path:** `/api/v1/templates/:name`

```bash
curl -X DELETE "https://whatapp-automation-kxml.onrender.com/api/v1/templates/old_template_name" \
  -H "x-api-key: itech_live_sec_7f9984e1b9384e9d9a1f"
```

---

## 7. Customer Web APIs (Public Endpoints)

These endpoints are designed for public-facing website widgets, booking forms, and tracking pages. They do not require an `x-api-key` header.

### 7.1 Submit Repair Booking (Web Form)
Allows website visitors to submit a booking form from `https://itechnicmobiles.com`. It creates the customer record, initializes a repair job, and sends an automated WhatsApp confirmation.

- **Method:** `POST`
- **Path:** `/api/book-repair`

#### Request Body (JSON)
```json
{
  "name": "Murali",
  "phone": "9342400879",
  "deviceBrand": "Apple",
  "deviceModel": "iPhone 13",
  "serviceName": "Screen Replacement",
  "issueDescription": "Screen flickering and cracked outer glass"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Repair booked successfully",
  "jobId": "REP-8491",
  "trackingUrl": "https://itechnicmobiles.com/track-repair/?id=REP-8491"
}
```

---

### 7.2 Live Repair Status Tracking (Widget API)
Returns the live diagnostic state, quote details, and estimated completion time for any repair job or phone number.

- **Method:** `GET`
- **Path:** `/api/track-repair/:id` (where `:id` is the Job ID, e.g., `REP-1024`, or customer phone number)

#### Response (200 OK)
```json
{
  "success": true,
  "repair": {
    "repairId": "REP-1024",
    "serviceName": "Screen Replacement",
    "deviceBrand": "Apple",
    "deviceModel": "iPhone 13",
    "status": "In Repair",
    "estimatedCost": 4500,
    "quotedCost": 4500,
    "turnaroundTime": "Same Day (60 mins)",
    "createdAt": "2026-11-09T05:30:00.000Z"
  }
}
```

---

## 8. Webhook Ingestion & Real-Time Events

The gateway listens for real-time events sent by Meta's WhatsApp Cloud API (inbound messages, button responses, location pins, photos, and delivery receipts).

### 8.1 Webhook Verification (GET /webhook)
When setting up or updating your webhook in the Meta Developer Portal:
- **Callback URL:** `https://whatapp-automation-kxml.onrender.com/webhook`
- **Verify Token:** Set to match your `VERIFY_TOKEN` environment variable.

The server handles Meta's verification handshake automatically:
```javascript
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});
```

### 8.2 Inbound Message Payload (POST /webhook)
When a customer sends a message or taps a button, Meta sends a `POST` payload:

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "1758570912097342",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "919361863063",
          "phone_number_id": "100293847291029"
        },
        "contacts": [{
          "profile": { "name": "Murali" },
          "wa_id": "919342400879"
        }],
        "messages": [{
          "from": "919342400879",
          "id": "wamid.HBgMOTE5MzQyNDAwODc5...",
          "timestamp": "1773049102",
          "text": { "body": "Track REP-1024" },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}
```

---

## 9. SDK & Multi-Language Code Snippets

### Node.js (Axios / Fetch)
```javascript
const axios = require('axios');

const BASE_URL = 'https://whatapp-automation-kxml.onrender.com/api/v1';
const API_KEY = 'itech_live_sec_7f9984e1b9384e9d9a1f';

async function sendRepairConfirmation(booking) {
  try {
    const response = await axios.post(
      `${BASE_URL}/crm/repair-booking-confirmed`,
      {
        phone: booking.phone,
        customerName: booking.customerName,
        jobId: booking.jobId,
        device: booking.device,
        service: booking.service,
        turnaround: booking.turnaround || 'Same Day'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      }
    );

    console.log('WhatsApp notification sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Example Execution
sendRepairConfirmation({
  phone: '919342400879',
  customerName: 'Murali',
  jobId: 'REP-1024',
  device: 'Apple iPhone 13',
  service: 'Screen Replacement',
  turnaround: '60 mins'
});
```

---

### Python 3 (Requests)
```python
import requests

BASE_URL = "https://whatapp-automation-kxml.onrender.com/api/v1"
API_KEY = "itech_live_sec_7f9984e1b9384e9d9a1f"

def send_status_update(phone, customer_name, job_id, device, status):
    url = f"{BASE_URL}/crm/repair-status-update"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    payload = {
        "phone": phone,
        "customerName": customer_name,
        "jobId": job_id,
        "device": device,
        "status": status
    }
    
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        print("Success:", response.json())
        return response.json()
    else:
        print(f"Error {response.status_code}: {response.text}")
        response.raise_for_status()

# Example Execution
send_status_update(
    phone="919342400879",
    customer_name="Murali",
    job_id="REP-1024",
    device="Apple iPhone 13",
    status="Testing (Quality Control Passed)"
)
```

---

### PHP (cURL)
```php
<?php
$baseUrl = 'https://whatapp-automation-kxml.onrender.com/api/v1';
$apiKey = 'itech_live_sec_7f9984e1b9384e9d9a1f';

$payload = [
    'phone' => '919342400879',
    'customerName' => 'Murali',
    'device' => 'Apple iPhone 13',
    'jobId' => 'REP-1024',
    'totalAmount' => '3500'
];

$ch = curl_init("$baseUrl/crm/device-ready-pickup");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    "x-api-key: $apiKey"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "WhatsApp alert dispatched: " . $response;
} else {
    echo "Error [$httpCode]: " . $response;
}
?>
```

---

### C# / .NET (HttpClient)
```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class WhatsAppClient
{
    private static readonly HttpClient client = new HttpClient();
    private const string BaseUrl = "https://whatapp-automation-kxml.onrender.com/api/v1";
    private const string ApiKey = "itech_live_sec_7f9984e1b9384e9d9a1f";

    public static async Task SendBookingConfirmationAsync()
    {
        var endpoint = $"{BaseUrl}/crm/repair-booking-confirmed";
        
        var body = new
        {
            phone = "919342400879",
            customerName = "Murali",
            jobId = "REP-1024",
            device = "Apple iPhone 13",
            service = "Screen Replacement",
            turnaround = "Same Day"
        };

        var request = new HttpRequestMessage(HttpMethod.Post, endpoint);
        request.Headers.Add("x-api-key", ApiKey);
        request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

        var response = await client.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();
        
        Console.WriteLine($"Status: {response.StatusCode}, Response: {content}");
    }
}
```

---

## 10. Error Handling, Meta Error Codes & Rate Limits

### HTTP Status Codes
| HTTP Status | Meaning | Solution |
| :--- | :--- | :--- |
| `200 OK` | Message successfully accepted by Meta Cloud API | The message is queued or delivered. |
| `400 Bad Request` | Missing required parameters or invalid JSON body | Check field names (e.g. `phone`, `jobId`). |
| `401 Unauthorized` | Missing or invalid API key | Verify `x-api-key` header matches your production secret. |
| `403 Forbidden` | Access to this resource or WABA is denied | Check Meta WABA permissions. |
| `404 Not Found` | Endpoint path or repair job record not found | Verify endpoint URL. |
| `429 Too Many Requests` | Rate limit exceeded | Back off and retry with exponential jitter. |
| `500 Server Error` | Meta Cloud API error or downstream failure | Inspect `error` details in response payload. |

### Common Meta WhatsApp Cloud API Error Codes
- **`131026` (Message Undeliverable)**: The destination phone number is not registered on WhatsApp or has opted out.
- **`132000` (Template Does Not Exist)**: The template specified does not exist in the requested language or has been modified.
- **`131047` (Re-engagement Message)**: Attempted to send a plain text message outside the 24-hour window. Use a template endpoint instead.
- **`133010` (Phone Number Rate Limit Reached)**: Meta sending limit reached. Scale your WABA tier via Business Manager.

---

## 11. Compliance, 24-Hour Session Rules & Best Practices

1. **24-Hour Customer Care Window:**
   - When a user sends a message to your WhatsApp number, a **24-hour customer service window** opens.
   - During this window, you can send free-form text, interactive buttons, or media messages using `/api/v1/messages/send-text`.
   - Once 24 hours have elapsed without user activity, **only pre-approved Meta message templates** can be sent.
2. **Opt-in Compliance:**
   - Always ensure customers have agreed to receive transactional and repair updates via WhatsApp (e.g., during store intake or web booking).
   - Customers can reply `STOP` or `UNSUBSCRIBE` at any time to opt out.
3. **Template Categorization:**
   - Keep transactional updates (status, invoice, booking) classified under the **UTILITY** category. Utility templates enjoy higher throughput and lower Meta delivery costs.
   - Reserve the **MARKETING** category for promotional campaigns, discounts, and festival greetings.

---

## 12. Postman Collection & Download Links

| Resource | Description | Format / URL |
| :--- | :--- | :--- |
| **Complete Developer Manual (HTML)** | Interactive manual with syntax highlighting and print-to-PDF support | [developer-docs.html](https://whatapp-automation-kxml.onrender.com/developer-docs.html) |
| **Postman Collection v2.1** | Ready-to-import Postman workspace with pre-configured requests | [itechnic-whatsapp-postman-collection.json](https://whatapp-automation-kxml.onrender.com/itechnic-whatsapp-postman-collection.json) |
| **OpenAPI / JSON Reference** | Machine-readable API schema endpoint | [GET /api/v1/docs](https://whatapp-automation-kxml.onrender.com/api/v1/docs) |
| **Live Interactive CRM & API Portal** | Browser test console with live cURL code generation | [Open Developer Hub](https://whatapp-automation-kxml.onrender.com) |

---
*Document maintained by iTechnic Mobiles Engineering Team. For technical integration assistance, contact `itechnicmobiles2@gmail.com` or call `+91 9361863063`.*
