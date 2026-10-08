# AcxiomCRM

AcxiomCRM is a CRM system with a Node.js + Express + MongoDB backend and a React + Vite frontend.

## Project Structure

- `backend/` - Express API, MongoDB models, middleware, controllers, and routes
- `frontend/` - React UI built with Vite

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a valid MongoDB connection string

## Environment Variables

Create a `.env` file in the project root with:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/acxiomcrm
JWT_SECRET=replace-with-a-long-secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

## Install

From the project root:

```bash
npm install
cd frontend
npm install
```

## Run

Start the backend from the project root:

```bash
npm run start
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and talks to the API at `/api`.

## Build

Build the frontend for production:

```bash
cd frontend
npm run build
```

## Validation

The workspace currently passes the React production build, and the backend files validate cleanly with the editor diagnostics.

## REST API Coverage

The backend implements the CRM REST surface required by the specification:

| Method | Endpoint | Purpose | Access |
| --- | --- | --- | --- |
| POST | /api/auth/login | Authenticate user | Public / rate limited |
| POST | /api/auth/logout | Logout / session termination | Authenticated |
| GET | /api/customers | List / search customers | Authorized |
| POST | /api/customers | Create customer | Authorized |
| GET | /api/customers/{id} | Get customer details | Authorized |
| PUT | /api/customers/{id} | Update customer | Authorized |
| DELETE | /api/customers/{id} | Delete / deactivate customer | Authorized |
| GET | /api/leads | List / search leads | Authorized |
| POST | /api/leads | Create lead | Authorized |
| GET | /api/leads/{id} | Get lead details | Authorized |
| PUT | /api/leads/{id} | Update lead | Authorized |
| DELETE | /api/leads/{id} | Delete / deactivate lead | Authorized |
| POST | /api/leads/{id}/convert | Convert lead to customer / opportunity | Authorized |
| GET | /api/opportunities | List / search opportunities | Authorized |
| POST | /api/opportunities | Create opportunity | Authorized |
| GET | /api/opportunities/{id} | Get opportunity details | Authorized |
| PUT | /api/opportunities/{id} | Update opportunity | Authorized |
| DELETE | /api/opportunities/{id} | Delete / deactivate opportunity | Authorized |
| GET | /api/followups | List follow-ups | Authorized |
| POST | /api/followups | Create follow-up | Authorized |
| PUT | /api/followups/{id} | Update follow-up | Authorized |
| DELETE | /api/followups/{id} | Cancel / deactivate follow-up | Authorized |
| GET | /api/activities | List activities | Authorized |
| POST | /api/activities | Create activity | Authorized |
| GET | /api/dashboard | Dashboard summary data | Authorized |
| GET | /api/reports/pipeline | Pipeline report data | Manager / Admin |
| GET | /api/reports/customers | Customer report data | Manager / Admin |
| GET | /api/reports/leads | Lead report data | Authorized |
| GET | /api/reports/followups | Follow-up report data | Authorized |
| GET | /api/reports/opportunities | Opportunity report data | Authorized |
| GET | /api/reports/users | User activity report data | Manager / Admin |
| GET | /api/reports/audit | Audit report data | Admin only |

## API Security

- Protected routes require JWT authentication.
- Role checks are enforced at the route layer with Admin, Manager, and SalesExecutive scopes.
- All write endpoints use request validation.
- Authentication endpoints are rate limited.
- Error responses are normalized and do not expose stack traces or database internals.
- Deployed environments should use HTTPS.

## Notes

- Delete operations are implemented as soft deletes or deactivations for CRM records.
- The dashboard and report endpoints are live and are consumed by the React frontend.

## Testing And Acceptance Checklist

| Area | Acceptance Criteria | Status |
| --- | --- | --- |
| Authentication | Valid login works; invalid credentials are rejected; logout works. | Implemented |
| Password Security | Password is never stored as plain text; password policy is enforced. | Implemented |
| Lockout | Repeated failed logins trigger configured lockout. | Implemented |
| Authorization | Users cannot access unauthorized pages, records, or APIs by manually changing URLs or requests. | Implemented |
| Client Validation | Required, email, phone, length, date, and numeric validation works before submission. | Implemented on core forms |
| Server Validation | Invalid or tampered requests are rejected on the server. | Implemented |
| Opportunity Rules | Amount > 0, probability 0-100, and close-date rule are enforced. | Implemented |
| Follow-Up Rules | Follow-up date cannot be earlier than today for planned items. | Implemented |
| Audit | Important security and business actions create audit entries. | Implemented |
| API | Endpoints return correct status codes and enforce authorization. | Implemented |
| Reports | Filters and role-based data visibility are respected. | Implemented |

## Security Checklist

- Password hashing enabled: implemented with bcrypt.
- Password policy enabled: implemented in validators and auth service.
- Account lockout enabled: implemented after repeated failed logins.
- Role-based authorization enabled: implemented in route guards.
- Server-side validation enabled: implemented with express-validator and controller checks.
- Anti-forgery protection for MVC forms: not applicable to this SPA because authentication uses JWT bearer tokens rather than server-rendered cookie forms.
- Sensitive information excluded from logs: implemented; errors are normalized and stack traces are not exposed in production mode.
- HTTPS used in production/deployment: required for deployment; not enforced in local development.
- API authorization and input validation enabled: implemented.
- Audit logging enabled for security-sensitive actions: implemented.
- Least-privilege access applied to roles: implemented through Admin, Manager, and SalesExecutive scopes.
- Database credentials stored securely and not hard-coded in source control: required via `.env`.

## How To Test The REST APIs

1. Start the backend and frontend.
2. Log in through the UI or call `POST /api/auth/login`.
3. Copy the returned JWT token.
4. Send the token in `Authorization: Bearer <token>` for protected requests.
5. Verify these checks:
	- `GET /api/customers` returns `401` without a token and `200` with a valid token.
	- `POST /api/leads` rejects invalid payloads and accepts valid payloads.
	- `POST /api/opportunities` rejects amount or probability violations.
	- `POST /api/followups` rejects planned follow-ups dated before today.
	- `GET /api/reports/pipeline` and `GET /api/reports/audit` respect role access.
	- Audit entries are created after login, create, update, delete, and conversion actions.
