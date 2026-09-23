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
npm install
npm install
```

| Backend settings:          |
| -------------------------- |
| `MONGO_URL`                | MongoDB connection string.                                      |
| `SSO_DECRYPT_KEY_JWT`      | Key used to verify tokens from your SSO                         |
| `ONESYSTEM_SECRET_KEY_JWT` | Secret used to sign and verify application                      |
| `IS_DEBUGGING_WINDOWS`     | Set to `true` only for the optional DNS workaround. Defaults to |

Generate an application JWT secret locally and paste the result into `ONESYSTEM_SECRET_KEY_JWT`:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

DONT USE OUR REAL PROD KEY FF

Start the apps in **separate** (use ctrl shift 5 to seprate) terminals:

```sh
npm run dev
```

```sh
npm run dev
```

The backend `prepare` script installs Husky automatically. To reactivate the hooks manually if you disabled them for some reason (mean..😒):

```sh
npm --prefix Backend run hooks:install
```

The pre-commit hook runs Prettier on staged files using `.prettierrc` and includes the formatting in the commit.
The pre-push hook builds both projects.
Husky is already enabled forcing you to write good code!
😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸😸
