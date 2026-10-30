# Full-Stack Kanban Board

A full-stack Kanban task management application featuring interactive drag-and-drop functionality, persistent state management, and a robust relational database backend. 

**[View Live Application](https://kanban-board.vercel.app)** 

## 🚀 Features

* **Drag-and-Drop Interface:** Seamless task movement across columns using `@hello-pangea/dnd`.
* **RESTful API:** Structured backend endpoints for CRUD operations on tasks and board lists.
* **Database Initialization:** Automated DataSeeder ensures default columns (To Do, In Progress, Done) are pre-populated on first launch.
* **Responsive UI:** Clean, modern interface styled with Tailwind CSS.
* **Cloud Infrastructure:** Fully deployed utilizing Vercel (Frontend) and Render (Backend + Database) via Docker multi-stage builds.

## 💻 Tech Stack

### Frontend
* **Framework:** React with TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **State & Interactions:** `@hello-pangea/dnd`
* **HTTP Client:** Axios
* **Hosting:** Vercel

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
1. Navigate to the backend directory:
   ```bash
   cd backend
Ensure your local or cloud PostgreSQL database is running, then configure your environment variables for DB_URL, DB_USERNAME, and DB_PASSWORD.

Start the Spring Boot application:

Bash
./mvnw spring-boot:run
The server will start on http://localhost:8080.

Frontend Setup
Open a new terminal and navigate to the frontend directory:

Bash
cd frontend
Install dependencies (bypassing legacy peer dependency conflicts if required):

Bash
npm install --legacy-peer-deps
Create a .env.local file and add your local backend URL:

Code snippet
VITE_API_BASE_URL=http://localhost:8080/api/v1
Start the Vite development server:

Bash
npm run dev
The frontend will be available at http://localhost:5173.

🚢 Deployment Configuration
Backend (Render)
Deployed as a Docker web service. The Dockerfile utilizes a multi-stage build:

eclipse-temurin:25-jdk to compile the .jar using Maven.

Lightweight execution stage exposing port 8080.
Requires DB_URL, DB_USERNAME, and DB_PASSWORD mapped to a Render PostgreSQL instance.

Frontend (Vercel)
Deployed via Vercel's GitHub integration.

Build Command: npm run build

Install Command Override: npm install --legacy-peer-deps

Environment Variable: VITE_API_BASE_URL pointing to the Render backend service.