# Cinema REST API

REST API для керування кінотеатром, створений за допомогою NestJS.

## Technologies

- Node.js
- NestJS
- TypeScript
- class-validator
- class-transformer
- Swagger

## Installation

1. Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

2. Open the project directory:

```bash
cd cinema-api
```

3. Install dependencies:

```bash
npm install
```

4. Create an `.env` file based on `.env.example`.

5. Start the development server:

```bash
npm run start:dev
```

The API will be available at:

`http://localhost:3000`

## Swagger documentation

Swagger documentation is available at:

`http://localhost:3000/docs`

## API Endpoints

### Films

| Method | Endpoint | Description |
|---|---|---|
| POST | `/films` | Create a film |
| GET | `/films` | Get all films |
| GET | `/films/:id` | Get a film by ID |
| PATCH | `/films/:id` | Update a film |
| DELETE | `/films/:id` | Delete a film |

### Halls

| Method | Endpoint | Description |
|---|---|---|
| POST | `/halls` | Create a hall |
| GET | `/halls` | Get all halls |
| GET | `/halls/:id` | Get a hall with seats |
| DELETE | `/halls/:id` | Delete a hall |

### Showings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/showings` | Create a showing |
| GET | `/showings` | Get all showings |
| GET | `/showings/:id` | Get a showing by ID |
| GET | `/showings?filmId=:id` | Filter by film |
| GET | `/showings?date=YYYY-MM-DD` | Filter by date |

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/showings/:id/bookings` | Create a booking |
| GET | `/bookings` | Get all bookings |
| GET | `/showings/:id/bookings` | Get bookings for a showing |
| DELETE | `/bookings/:id` | Cancel a booking |
| GET | `/showings/:id/seats` | Get seats and booking status |

## Data storage

Data is stored in private in-memory arrays inside services.

No database is used. Data is reset when the application restarts.

## Validation

Request data is validated using `class-validator`, `class-transformer`, and NestJS `ValidationPipe`.

UUID identifiers are validated using `ParseUUIDPipe`.