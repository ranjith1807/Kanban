# Full-Stack Kanban Board

A full-stack Kanban task management application featuring interactive drag-and-drop functionality, persistent state management, and a robust relational database backend. 

## 🚀 Features

* **Drag-and-Drop Interface:** Seamless task movement across columns using `@hello-pangea/dnd`.
* **RESTful API:** Structured backend endpoints for CRUD operations on tasks and board lists.
* **Database Initialization:** Automated DataSeeder ensures default columns (To Do, In Progress, Done) are pre-populated on first launch.
* **Responsive UI:** Clean, modern interface styled with Tailwind CSS.
* **Cloud Infrastructure:** Deployable to Render using the included Blueprint and Docker multi-stage backend build.

## 💻 Tech Stack

### Frontend
* **Framework:** React with TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **State & Interactions:** `@hello-pangea/dnd`
* **HTTP Client:** Axios
* **Hosting:** Render Static Site

### Backend
* **Framework:** Spring Boot 3.5.16
* **Runtime:** Java 25
* **Database:** PostgreSQL
* **ORM:** Spring Data JPA / Hibernate
* **Hosting:** Render (Dockerized)

## 🛠️ Local Development Setup

### Prerequisites
* Java JDK 25
* Node.js & npm
* Maven

### Backend Setup
Navigate to the backend directory:

```bash
cd backend
```

Ensure PostgreSQL is running, then configure `SPRING_DATASOURCE_URL`,
`SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` if you are not
using the local defaults. Start the Spring Boot application:

```bash
./mvnw spring-boot:run
```

The server will start on `http://localhost:8080`.

### Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install --legacy-peer-deps
```

Create a `.env.local` file with your local backend URL:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## 🚢 Deploy to Render

The root `render.yaml` Blueprint deploys the frontend, Dockerized backend, and PostgreSQL database together.

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint** and connect the repository.
3. Review the services defined in `render.yaml` and choose **Apply**.
4. Wait for the database and both services to finish deploying. The frontend is served at `https://kanban-frontend.onrender.com`.

The Blueprint connects the backend to the managed database, configures the backend's allowed frontend origin, and sets the frontend's `VITE_API_BASE_URL`. The backend reads Render's `PORT` automatically.

If Render reports that a service name is already taken, change the corresponding `name` in `render.yaml` and update the frontend URL in both `CORS_ALLOWED_ORIGINS` and `VITE_API_BASE_URL` to match.

For local development, set `CORS_ALLOWED_ORIGINS` to the frontend origin if it differs from `http://localhost:5173`.

The Blueprint uses Render's free plans as a starting point. Free web services can spin down when idle, and free PostgreSQL databases are temporary; choose a paid database plan for data you need to keep.