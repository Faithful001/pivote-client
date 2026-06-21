# Pivote Client

Pivote Client is the frontend application for the Pivote voting platform. It gives participants a place to join voting programs, cast their votes, and watch results update live, while also giving administrators a dedicated interface to create and manage those programs from start to finish.

The name is a blend of "pivot" and "e" for election. Voting is fundamentally about pivoting, and a good election shifts the direction of things. The name felt like a natural fit.

---

## What It Does

The client is split into two distinct surfaces that share the same codebase: a participant-facing side and an administrator-facing side. Both are protected by route-level guards that check the authenticated user's role before rendering anything.

On the participant side, users receive an email invite, follow the link to register or log in, and are enrolled into the program they were invited to. From there they can browse candidates, cast or toggle a vote, watch the live results page, and see a countdown to when voting closes. When the timer hits zero, the program is automatically expired on the server side and the countdown stream closes.

On the administrator side, admins can create and manage workspaces, set up voting programs with a deadline, add candidates, activate voting, and monitor everything from a dedicated dashboard. Vote counts update in real time over a Socket.IO connection, so leaderboard views stay current without any manual refreshing.

---

## Tech Stack

| Concern       | Technology                     |
| ------------- | ------------------------------ |
| Language      | TypeScript                     |
| Framework     | React 19                       |
| Build tool    | Vite 8                         |
| Routing       | TanStack Router v1             |
| Data fetching | TanStack Query v5              |
| UI components | Radix UI Themes                |
| Icons         | Lucide React, React Icons      |
| HTTP client   | Axios                          |
| Real-time     | Socket.IO Client v2            |
| Notifications | Sonner                         |
| Styling       | Tailwind CSS v4                |
| Linting       | ESLint with TypeScript support |

---

## Project Structure

```
src/
├── api/               # Axios instance and per-domain API functions
├── assets/            # Static assets (images, fonts, etc.)
├── components/
│   ├── admin/         # Admin-specific layout and shared components
│   └── user/          # Participant-facing layout and shared components
├── contexts/          # React context providers (auth, socket, etc.)
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and shared helpers
├── pages/
│   ├── admin/         # All admin-only pages
│   │   ├── programs/  # Program list, create, and detail views
│   │   ├── candidates/
│   │   ├── dashboard/
│   │   └── settings/
│   ├── dashboard/     # Participant dashboard
│   ├── vote/          # Voting page
│   ├── results/       # Live results page
│   ├── programs/      # Program join flow (request and confirm)
│   ├── landing/       # Public landing page
│   ├── login/
│   ├── register/
│   ├── verify/
│   ├── forgot-password/
│   └── reset-password/
├── router.tsx         # Route definitions and route tree
└── main.tsx           # Application entry point
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or any compatible package manager
- A running instance of the [Pivote API](https://github.com/your-username/pivote)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/pivote-client.git
cd pivote-client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root of the project and set the API base URL:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000
```

The `VITE_API_BASE_URL` variable should point to wherever the Pivote API is running. If you are running the backend locally using the default configuration, the values above will work without any changes.

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default. Vite's hot module replacement is enabled out of the box, so changes to source files reflect immediately without a full page reload.

---

## Key Flows

### Participant flow

1. An administrator creates a program and sends invite links.
2. The participant follows the link and lands on the request-join page, which submits their email and name to the API.
3. The API sends an invite email containing a short-lived token.
4. Clicking that link brings the participant to the join page, which exchanges the token for program enrollment.
5. After enrolling, the participant is taken to the vote page where they can select a candidate. Votes can be toggled on and off until the deadline passes.
6. The countdown on the page is a live Server-Sent Events stream from the API. When time runs out, the stream closes and the results page becomes read-only.

### Administrator flow

1. The admin registers, verifies their OTP, and creates a workspace.
2. From the admin dashboard, they create a voting program, set a deadline, and add candidates.
3. When ready, they activate the program with a single toggle. This starts the SSE countdown for all connected clients.
4. Vote counts on the admin program view update in real time over a Socket.IO connection.
5. When the deadline passes, the server automatically expires the program. The admin can review final results from the program detail view.

---

## Authentication

Authentication is OTP-based. After submitting an email and password during registration or login, the server sends a one-time code by email. The user enters that code on the verify page to receive a JWT, which is then stored in `localStorage` and attached to every subsequent API request via an Axios request interceptor.

Route guards check for a valid token and the user's role before rendering protected pages. Participants attempting to access admin routes are redirected, and vice versa.

---

## Real-Time Connections

Two distinct real-time mechanisms are used, each serving a specific purpose.

**Server-Sent Events (countdown):** The countdown timer on both the participant and admin program pages connects to the `GET /programs/:id/countdown` endpoint and holds an SSE connection open. The server pushes a tick every second with the remaining time. When the program expires, the server sends a final event and closes the stream cleanly. This is handled in a custom hook that manages the `EventSource` lifecycle and cleans up the connection when the component unmounts.

**Socket.IO (live vote updates):** A Socket.IO connection is established when a user is authenticated and maintained via a React context provider for the lifetime of the session. When a vote is cast or toggled anywhere, the server emits an event over this connection and any component subscribed to the relevant room receives the updated counts without needing to re-fetch.

---

## Building for Production

```bash
npm run build
```

The compiled output is placed in the `dist/` directory. The project includes a `vercel.json` configuration file that handles client-side routing rewrites, so it is ready to deploy to Vercel without additional configuration. For other hosting environments, make sure the server is configured to serve `index.html` for all routes.

---

## Linting

```bash
npm run lint
```

The project uses ESLint with TypeScript-aware rules. The ESLint configuration is in `eslint.config.js`.

---

## Contributing

Contributions are welcome. If you find a bug or want to suggest a change, please open an issue first so the approach can be discussed before any code is written. Pull requests without an associated issue may be closed without review.

When submitting a pull request:

- Keep commits focused. One logical change per commit is easier to review and revert if something goes wrong.
- Match the existing code style. Components follow a consistent structure and naming convention throughout the project.
- Write a clear PR description that explains what changed, why the change was necessary, and how it was tested.

---

## License

Pivote Client is released under the MIT License. See below for the full license text.

```
MIT License

Copyright (c) 2026 Pivote Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
