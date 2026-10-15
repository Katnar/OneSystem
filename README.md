# OneSystem

hello :)
One system for the win!!

Development setup lives on `dev`; `main` contains only this project's README.

Prerequisites:

- Node.js and npm.
- A running MongoDB instance or cluster.

Run this command from the repository root on `dev` to install entire project:

```sh
npm ci
```

| Backend settings:      |
| ---------------------- |
| `MONGO_URL`            | MongoDB connection string.                                      |
| `IS_DEBUGGING_WINDOWS` | Set to `true` only for the optional DNS workaround. Defaults to |

Start the app in a single command with `npm run dev` from project root, or do it manually:

**Before running the apps**, build the shared files by running `npm run build` from `/sharedFiles`
Start the apps in **separate** (use ctrl shift 5 to seprate) terminals:

**back**

```sh
cd Backend
npm run dev
```

**front**

```sh
cd Frontend
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
