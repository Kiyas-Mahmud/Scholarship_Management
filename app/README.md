# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## D1 Database Setup

This project expects a Cloudflare D1 binding named DB.

1. Create a D1 database in Cloudflare dashboard and copy its database ID.
2. Update the DB entry in wrangler.toml:
   - binding = "DB"
   - database_name = "scholarship_outreach_dev" (or your chosen name)
   - database_id = "<your real database id>"
3. Generate migrations after schema changes:

```bash
npm run db:generate
```

4. Apply migrations locally:

```bash
npm run db:migrate:local
```

5. Apply migrations to Cloudflare D1:

```bash
npm run db:migrate:remote
```

For Pages deployment, also add the DB binding in your Pages project settings:
Settings > Bindings > Add binding > D1 database > Variable name DB.

## API Smoke Test

Run a quick auth/profile API flow test against a running local server.

1. Start the app in one terminal:

```bash
npm run dev
```

2. Run smoke test in another terminal:

```bash
npm run test:smoke:api
```

Optional target override:

```bash
API_BASE_URL=http://127.0.0.1:3000 npm run test:smoke:api
```
