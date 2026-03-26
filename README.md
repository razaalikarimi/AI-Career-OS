# Career OS (Workspace)

A full-stack career tracking and interview prep platform built during my free time. It's designed to act as a personal CRM for job hunting.

## Tech Stack
- Frontend: Next.js (App Router), Tailwind CSS v4, Zustand
- Backend: Express, Node.js
- DB/Cache: MySQL, Redis
- Queues: BullMQ for async resume parsing background jobs

## Setup Instructions

Make sure you have node >= 18, mysql, and redis running locally.

1. Clone the repo
2. Run database migrations:
   \`\`\`bash
   mysql -u root -p < backend/database/schema.sql
   \`\`\`
3. Setup env files (copy the .example files)
4. Start both servers:
   \`\`\`bash
   cd frontend && npm install && npm run dev
   # in another terminal
   cd backend && npm install && npm run dev
   \`\`\`

## Roadmap / TODOs
- [ ] Migrate the current Express backend to Go or Rust for better performance (maybe)
- [ ] Dockerize the whole setup to make local dev easier
- [ ] Handle refresh token rotation edge cases where Redis drops the key
- [ ] Setup CI/CD with GitHub actions

## License
MIT
