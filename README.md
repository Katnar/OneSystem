# OneSystem

hello :)
One system for the win!!

Development setup lives on `dev`; `main` contains only this project's README.

Prerequisites:

- Node.js and npm.
- A running MongoDB instance or cluster.
- An SSO verification key and a valid SSO token for testing authentication.

Run these commands from the repository root on `dev`:

```sh
npm --prefix Frontend install
npm --prefix Backend install
```

Copy the environment templates, then replace their placeholders. If you already have `.env` files, merge the example settings into them instead of overwriting your values.

```sh
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
```

Backend settings:

| Variable                   | Purpose                                                                        |
| -------------------------- | ------------------------------------------------------------------------------ |
| `MONGO_URL`                | MongoDB connection string. The server waits for a connection before listening. |
| `PORT`                     | API port; defaults to `3000`.                                                  |
| `SSO_DECRYPT_KEY_JWT`      | Key used to verify tokens from your SSO provider.                              |
| `ONESYSTEM_SECRET_KEY_JWT` | Secret used to sign and verify application JWTs.                               |
| `IS_DEBUGGING_WINDOWS`     | Set to `true` only for the optional DNS workaround. Defaults to disabled.      |

Generate an application JWT secret locally and paste the result into `ONESYSTEM_SECRET_KEY_JWT`:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

In `Frontend/.env`, set `VITE_API_URL` to the backend base URL, such as `http://localhost:3000`, without `/auth`. Keep secrets in the backend environment; `VITE_` values are exposed to the browser. Real `.env` files are ignored by Git.

Start the apps in separate terminals:

```sh
npm --prefix Backend run dev
```

```sh
npm --prefix Frontend run dev
```

Use the frontend URL printed by Vite. Restart the relevant dev server after editing its environment file.

To check both builds:

```sh
npm --prefix Backend run build
npm --prefix Frontend run build
```

The backend `prepare` script installs Husky automatically. To reactivate the hooks manually if you disabled them for some reason (mean..😒):

```sh
npm --prefix Backend run hooks:install
```

The pre-commit hook runs Prettier on staged files using `.prettierrc` and includes the formatting in the commit.
The pre-push hook builds both projects.
Husky is already enabled forcing you to write good code!
😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸
