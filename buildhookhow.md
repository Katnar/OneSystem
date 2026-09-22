# Enable the pre-push build hook

After cloning the repository, run these commands from the repository root:

ONLY NEEDED ONCE DONT CRY ABT IT

```bash
git config core.hooksPath .githooks
npm install --prefix Frontend
npm install --prefix Backend
```

To verify the setup manually, run:

```bash
.githooks/pre-push
```

Git hook configuration is local to each clone, so every contributor must run the `git config` command once.

If your clone already uses `core.hooksPath .githooks`, no configuration change is needed. The build checks now run before pushing instead of committing.
