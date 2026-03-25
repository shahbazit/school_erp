# Multi-Tenant School ERP System

## Architectural Overview

This project is a complete production-ready School/Institute ERP system conforming to **Indian DPDP Act requirements** (OTP Verification, Strong Hashing, Audit fields, Lockout constraints).

### Tech Stack
- **Backend:** ASP.NET Core 8 Web API, Clean Architecture, Entity Framework Core (SQL Server), CQRS (MediatR), global exception handling, JWT Identity.
- **Frontend:** React 18 (Vite), TypeScript, Tailwind CSS, Axios, Context/Hook state management.
- **Architecture Features:** Strict SaaS multi-tenant isolation with EF Core Global Query Filters and Middleware HTTP request interceptors.

---

## Prerequisites
- .NET 8.0 SDK
- Node.js v18+ 
- SQL Server (Developer or Express edition)
- (Optional) Redis for distributed OTP cache (Currently uses memory cache sandbox)

---

## Backend Setup (ASP.NET Core API)

1. **Database Configuration**
   Open `SchoolERP.API/appsettings.json` (or `appsettings.Development.json`) and configure your SQL Server connection string:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=SchoolERP_Db;Trusted_Connection=True;MultipleActiveResultSets=true"
   }
   ```

2. **Restore Dependencies**
   ```bash
   cd e:/Work/Applications/SchoolERP
   dotnet restore SchoolERP.slnx
   ```

3. **Apply EF Core Migrations**
   ```bash
   dotnet ef migrations add InitialCreate --project SchoolERP.Infrastructure --startup-project SchoolERP.API
   dotnet ef database update --project SchoolERP.Infrastructure --startup-project SchoolERP.API
   ```

4. **Run the API**
   ```bash
   cd SchoolERP.API
   dotnet run
   ```
   *The API will typically start at `https://localhost:7123` or similar. Review the terminal output for the address. Swagger UI is available at `/swagger`.*

---

## Frontend Setup (React/Vite)

1. **Install NPM Packages**
   ```bash
   cd e:/Work/Applications/SchoolERP/SchoolERP.API/Client
   npm install
   ```

2. **Configure Environment Variables**
   Ensure your API Base URL is pointed correctly. (Check `src/api/apiClient.ts` to confirm `baseURL: 'https://localhost:<port>/api'`).

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *The React app will typically launch at `http://localhost:5173`.*

---

## Usage Guide (Testing the MVP)

1. Open the React frontend `http://localhost:5173` in your browser.
2. Click **"register your institution instead"** to create an Admin account.
3. Automatically deducts `TenantId` logically based on your email domain (e.g., admin@springville.edu registers under `springville`).
4. Enter your details and mobile number correctly.
5. The system strictly halts login until OTP validation is completed. A *Sandbox OTP code* generation is logged into your ASP.NET Core terminal console.
6. Check your terminal for the generated 6-digit OTP and enter it in the browser to sign in simultaneously.
7. Upon successful entry, the system injects `X-Tenant-Id` and `Bearer Token` into memory. You're logged in!

> **Note**: Subsequent API requests enforce Global Query Filters at the database layer ensuring absolutely no data leakage exists between different clients.
