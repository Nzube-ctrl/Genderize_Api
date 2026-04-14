# Genderize API — Stage 0 Assessment

A single Express endpoint that integrates with [Genderize.io](https://genderize.io) to classify names by gender, with processing logic on top.

## Stack

- **Runtime:** Node.js
- **Framework:** Express
- **HTTP client:** Axios

## Setup

```bash
npm install
npm start
```

Server starts on port `3000` by default. Override with:

```bash
PORT=8080 npm start
```

## Endpoint

### `GET /api/classify?name={name}`

Classifies a name and returns gender prediction with confidence metadata.

**Query Parameters**

| Param | Type   | Required | Description       |
|-------|--------|----------|-------------------|
| name  | string | Yes      | The name to classify |

**Success Response — 200**

```json
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 1234,
    "is_confident": true,
    "processed_at": "2026-04-01T12:00:00.000Z"
  }
}
```

**`is_confident` logic:** `true` when `probability >= 0.7` AND `sample_size >= 100`. Both conditions must pass.

---

**Error Responses**

| Status | Condition |
|--------|-----------|
| 400    | Missing or empty `name` parameter |
| 422    | `name` is not a string |
| 502    | Upstream Genderize.io returned an error |
| 504    | Upstream Genderize.io timed out |
| 500    | Unexpected server error |

All errors follow this shape:

```json
{ "status": "error", "message": "<reason>" }
```

**Edge case — no prediction available:**

```json
{ "status": "error", "message": "No prediction available for the provided name" }
```

Returned when Genderize responds with `gender: null` or `count: 0`.

---

## Project Structure

```
.
├── index.js        # Entry point — starts the server
├── src/
│   └── app.js      # Express app + route logic
├── package.json
└── README.md
```

## Deployment Notes

- Compatible with **Vercel, Railway, Heroku, AWS, PXXL App**
- `PORT` env variable is respected for all platforms
- CORS is open (`Access-Control-Allow-Origin: *`)