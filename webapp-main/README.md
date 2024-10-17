# Node.js - Postgres - Sequelize

## Description

This is a Node.js application that implements a health check endpoint (`/healthz`) using the **MVC** architecture. It checks the health of the connected PostgreSQL database and ensures correct handling of incoming HTTP requests.

The application includes:
- An endpoint for checking the health of the server and database (`/healthz`).
- An endpoint to create a new user (`/v1/user`).
- An endpoint to update an existing user with basic authentication (`/v1/user`).
- An endpoint to retrieve relevant user information with basic authentication (`/v1/user`).
- Request validation for `GET` requests with body data, query parameters, or form data that returns a `400 Bad Request`.
- A robust logging mechanism using **Winston** for monitoring incoming requests and system events.
- MVC (Model-View-Controller) design pattern to keep the code well-organized and modular.
- Error handling for improved robustness and user feedback.
- Basic authentication for securing certain endpoints.
- Bcrypt algorithm to store passwords securely

## Technologies

- **Programming Language Used**: Node.js
- **Database Used**: PostgreSQL
- **Logging Library Used**: Winston
- **Architecture**: MVC Architecture
- **ORM Used**: Sequelize

## Working

- **Health Check Endpoint (`/healthz`)**: Returns the health of the application and connected database.
- **Request Validations**: Returns `400 Bad Request` if the request contains:
  - Query parameters
  - Body 
  - Form-data
- **Logging**: All requests and system events are logged using **Winston**.
- **Environment configuration**: App configuration using `.env` file.
- **Basic Authentication**: Certain endpoints require basic authentication for access, ensuring only authorized users can perform actions.
- **User Data Endpoints (`POST - /v1/user`) (`GET - /v1/user`) (`PUT - /v1/user`)**: API endpoints that allow users to create, update and retrieve their data. PUT and GET are authenticated requests.

## Project Setup

### Prerequisites

Before running this project, ensure you have:
1. **Node.js** installed.
2. **PostgreSQL** set up and running.
3. **pgAdmin** or any PostgreSQL management tool to interact with the database.

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo.git
   cd your-repo
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables in a `.env` file:
   ```bash
   PORT=3000
   DB_HOST=your_db_host
   DB_PORT=your_db_port
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   ```

4. Set up and configure PostgreSQL. Create a new database using `pgAdmin` or any other tool.

5. Run the application:
   ```bash
   npm start
   ```

## API Documentation

### Health Check API - `/healthz`

This endpoint checks the health of the application, primarily the database connectivity, and returns the appropriate HTTP status codes.

- **URL**: `/healthz`
- **Method**: `GET`
- **Response**:
  - **200 OK**: When the application is healthy and the database connection is successful.
  - **400 Bad Request**: If the request contains a body, query parameters, or form-data.
  - **503 Service Unavailable**: If the database connection fails.

### Example Request

```bash
GET /healthz
```

### Example Response

- **200 OK**:
  ```bash
  Status: 200 OK
  ```
  
- **400 Bad Request**:
  ```bash
  Status: 400 Bad Request
  ```

- **503 Service Unavailable**:
  ```bash
  Status: 503 Service Unavailable
  ```

```bash
POST /v1/user
```

### Example Response

- **201 Created**:
  ```bash
  Status: 201 Created
  ```
  
- **400 Bad Request**:
  ```bash
  Status: 400 Bad Request
  ```

- **503 Service Unavailable**:
  ```bash
  Status: 503 Service Unavailable
  ```

```bash
Authenticated GET /v1/user
```

### Example Response

- **201 Created**:
  ```bash
  Status: 200 OK
  ```
  
- **400 Bad Request**:
  ```bash
  Status: 400 Bad Request
  ```

- **401 Unauthorized Request**:
  ```bash
  Status: 401 Unauthorized
  ```

- **503 Service Unavailable**:
  ```bash
  Status: 503 Service Unavailable
  ```


```bash
Authenticated PUT /v1/user
```

### Example Response

- **204 No Content**:
  ```bash
  Status: 204 No Content
  ```
  
- **400 Bad Request**:
  ```bash
  Status: 400 Bad Request
  ```

- **503 Service Unavailable**:
  ```bash
  Status: 503 Service Unavailable
  ```


## Logs

- **Winston** is used for logging the requests and system activities.
- Logs will capture:
  - Health check hits.
  - Errors and exceptions during the health check.
  - Denied requests (with payloads or restricted methods).
  