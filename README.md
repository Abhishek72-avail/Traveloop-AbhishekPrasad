# Traveloop - Project Documentation

## 1. Project Proposal & Overview
**Traveloop** is an AI-powered enterprise-grade travel planning platform. It allows users to seamlessly plan trips, build day-by-day itineraries, discover cities and activities, track travel budgets, manage packing lists, and share their journeys. 

The goal of this application is to replace fragmented travel tools (spreadsheets, note apps, separate booking trackers) into one unified, highly visual, and modern dashboard.

---

## 2. Technology Stack

### **Frontend**
*   **Framework:** React (built with Vite for fast HMR)
*   **Routing:** `wouter` (lightweight, hook-based routing)
*   **Styling:** Tailwind CSS + `shadcn/ui` components for a modern, glassmorphism aesthetic.
*   **Data Fetching & State:** `@tanstack/react-query` generated via Orval.

### **Backend**
*   **Server:** Node.js with Express 5
*   **Authentication:** JWT (JSON Web Tokens) stored in localStorage.
*   **API Design:** OpenAPI-first approach. All routes are defined in an `openapi.yaml` file, which is used to automatically generate React hooks and Zod validation schemas.

### **Database**
*   **Database:** PostgreSQL
*   **ORM:** Drizzle ORM (type-safe database queries and schema definitions).

---

## 3. Architecture Diagram

Below is the high-level architecture of how the Traveloop application connects:

```mermaid
graph TD
    subgraph Frontend [Client - React SPA]
        UI[UI Components / Pages]
        RQ[React Query Hooks]
        UI <--> RQ
    end

    subgraph Backend [API Server - Express]
        Auth[JWT Middleware]
        Router[Express Routes]
        Zod[Zod Validation]
        
        Auth --> Router
        Router <--> Zod
    end

    subgraph Database Layer
        Drizzle[Drizzle ORM]
        PG[(PostgreSQL DB)]
        Drizzle <--> PG
    end

    RQ <--> |REST API / JSON| Auth
    Router <--> |SQL Queries| Drizzle
```

**Data Flow:**
1. The user interacts with the **Frontend**.
2. **React Query** triggers a fetch request using the auto-generated API hooks.
3. The request hits the **Express API**, passing the JWT token for authentication.
4. The API validates the payload using **Zod**.
5. **Drizzle ORM** translates the request into a SQL query to fetch or modify data in **PostgreSQL**.
6. The data is returned back up the chain to the user interface.

---

## 4. How to Run the Application

The project is structured as a monorepo using `pnpm` workspaces. To run the application smoothly, open separate terminal tabs and run the following commands:

1. **Start the API Backend Server:**
   ```bash
   pnpm --filter @workspace/api-server run dev
   ```
2. **Start the React Frontend:**
   ```bash
   pnpm --filter @workspace/traveloop run dev
   ```
   *(Note: The frontend runs on `http://localhost:5173`)*
3. **View the Database (Drizzle Studio):**
   ```bash
   pnpm --filter @workspace/db run studio
   ```

---

## 5. Application Screens

*(Note: Create a folder named `screens` and place your images inside it. The images below will automatically link to those files once uploaded).*

### Screen 1: Login & Registration
![Screen 1](./screens/screen-1.png)

### Screen 2: Dashboard / Home Screen
![Screen 2](./screens/screen-2.png)

### Screen 3: My Trips (Trip List)
![Screen 3](./screens/screen-3.png)

### Screen 4: Create Trip Form
![Screen 4](./screens/screen-4.png)

### Screen 5: Itinerary Builder Screen
![Screen 5](./screens/screen-5.png)

### Screen 6: Itinerary View / Timeline
![Screen 6](./screens/screen-6.png)

### Screen 7: City Discovery & Search
![Screen 7](./screens/screen-7.png)

### Screen 8: Activity Search
![Screen 8](./screens/screen-8.png)

### Screen 9: Budget Tracker Screen
![Screen 9](./screens/screen-9.png)

### Screen 10: Packing List Screen
![Screen 10](./screens/screen-10.png)

### Screen 11: Travel Notes
![Screen 11](./screens/screen-11.png)

### Screen 12: Admin Panel & Analytics
![Screen 12](./screens/screen-12.png)

### Screen 13: User Profile
![Screen 13](./screens/screen-13.png)

### Screen 14: Settings
![Screen 14](./screens/screen-14.png)
