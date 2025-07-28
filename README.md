# tourTide-server

A backend server for managing tour packages and bookings for the TourTide platform.

## Overview

This project provides a RESTful API built with Node.js and Express to support operations for a tour booking application. It integrates with MongoDB for data persistence and uses Firebase for authentication. The server offers endpoints for:

- Managing tour packages (CRUD operations)
- Handling bookings (create, update, list)
- Searching and filtering packages
- JWT-based authentication and authorization

## Features

- **Tour Packages:** Add, update, delete, and retrieve tour packages. Includes endpoints for listing all packages, searching by name/destination, and fetching package details.
- **Bookings:** Create new bookings, update booking status, list all bookings, and filter bookings by user email.
- **Authentication:** Uses Firebase Admin SDK for verifying tokens and issues JWT tokens for client sessions.
- **Security:** Protected routes require valid JWTs for sensitive actions (like managing packages or viewing user-specific bookings).
- **CORS and Environment Configuration:** Supports environment-specific configurations for deployment and development.

## API Endpoints (Sample)

- `POST /jwt` – Authenticate and receive a JWT.
- `GET /tour-card-data` – Retrieve 6 packages for the homepage.
- `GET /tour-card-data/details/:id` – Get details of a specific tour package.
- `GET /all-packages` – List all packages.
- `GET /all-packages/search?text=` – Search packages by name or destination.
- `POST /add-tour-packages` – Add a new tour package (authenticated).
- `PATCH /package/:id` – Update a tour package (authenticated).
- `DELETE /package/:id` – Remove a tour package.
- `POST /bookings` – Create a new booking.
- `GET /my-bookings?email=` – List bookings for a specific user.
- `PATCH /bookings/:id` – Update booking status.

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/arjsabbir88/tourTide-server.git
   cd tourTide-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables:**
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```
     PORT=3000
     DB_USER=your_db_user
     DB_PASSWORD=your_db_password
     JWT_SECRET_KEY=your_jwt_secret
     BASE_URL=your_production_url
     LOCAL_URL=http://localhost:3000
     ```
   - Place your Firebase Admin credentials in `firebaseAdmin.json`.

4. **Run the server:**
   ```bash
   npm start
   ```
   The server will be available at `http://localhost:3000`.

## Dependencies

- Node.js
- Express
- MongoDB (with official Node.js driver)
- Firebase Admin SDK
- jsonwebtoken
- dotenv
- cors

## License

*Specify your license here.*

---

For more details, see the code and endpoints in [`index.js`](./index.js).
