# Hyperhive Monorepo Setup Guide

> **Interactive Setup Document**: This document guides you through setting up the Hyperhive monorepo step-by-step. It will prompt you for information and track your progress through each phase.

## Nomenclature

Hyperhive uses bee-inspired naming throughout the codebase:

| Concept          | Bee Term     | Description                                                            |
| ---------------- | ------------ | ---------------------------------------------------------------------- |
| Main Entry Point | **AIColony** | The colony controller - manages all drones across providers            |
| LLM Session      | **Drone**    | Autonomous agent that executes tasks (e.g., `claudeDrone`, `gptDrone`) |
| Send Prompt      | **buzz()**   | How drones communicate - sending prompts to the LLM                    |
| Configuration    | **Comb**     | Honeycomb structure for organized configuration storage                |
| Events           | **Waggle**   | Waggle dance - how bees communicate information                        |
| Plugins          | **Propolis** | Substance bees use to extend/seal the hive                             |

## Overview

| Aspect                 | Choice                   | Rationale                                                      |
| ---------------------- | ------------------------ | -------------------------------------------------------------- |
| **Build Orchestrator** | Turborepo                | Native Changesets support, simpler than NX, excellent caching  |
| **Package Manager**    | pnpm                     | Faster, disk-efficient, great monorepo support                 |
| **Versioning**         | Changesets (independent) | Each package versions separately                               |
| **Remote Cache**       | Vercel                   | Zero infrastructure, free tier, seamless Turborepo integration |
| **Release Auth**       | GitHub App               | Can trigger workflows, better security                         |
| **Publishing**         | npm OIDC                 | Trusted publishing without storing tokens                      |

### Package Groups

Packages are organized into functional groups (folders are plural, package prefixes are singular):

```
packages/
├── colony/              # @hyperhive/colony - Main library (AIColony + Drone)
├── plugins/             # Framework plugins
│   ├── fastify/         # @hyperhive/plugin-fastify
│   ├── express/         # @hyperhive/plugin-express
│   ├── nextjs/          # @hyperhive/plugin-nextjs
│   ├── trpc/            # @hyperhive/plugin-trpc
│   ├── nestjs/          # @hyperhive/plugin-nestjs
│   └── hono/            # @hyperhive/plugin-hono
├── storages/            # Persistence adapters
│   ├── redis/           # @hyperhive/storage-redis
│   ├── postgres/        # @hyperhive/storage-postgres
│   └── sqlite/          # @hyperhive/storage-sqlite
├── observability/       # Monitoring & tracing
│   ├── prometheus/      # @hyperhive/observability-prometheus
│   └── otel/            # @hyperhive/observability-otel
├── security/            # Isolation & sandboxing
│   ├── executor/        # @hyperhive/security-executor
│   ├── sandbox-docker/  # @hyperhive/security-sandbox-docker
│   └── sandbox-e2b/     # @hyperhive/security-sandbox-e2b
├── orchestration/       # Multi-agent & workflows
│   ├── swarm/           # @hyperhive/orchestration-swarm
│   └── workflows/       # @hyperhive/orchestration-workflows
├── ai/                  # Advanced AI features
│   ├── context/         # @hyperhive/ai-context
│   ├── memory/          # @hyperhive/ai-memory
│   ├── chains/          # @hyperhive/ai-chains
│   └── learning/        # @hyperhive/ai-learning
├── tools/               # Development tools
│   ├── testing/         # @hyperhive/tool-testing
│   └── cli/             # @hyperhive/tool-cli
└── configs/             # Shared configurations
    ├── eslint/          # @hyperhive/config-eslint
    └── typescript/      # @hyperhive/config-typescript
```

### Initial Packages (MVP)

- `@hyperhive/colony` - Main library with `AIColony` and `Drone` classes
- `@hyperhive/plugin-fastify` - Fastify plugin

---

## Setup Data Collection

> **Instructions**: Fill in the values below as you complete each setup step. These values will be referenced throughout the guide.

### Your Configuration Values

```yaml
# GitHub Configuration
GITHUB_ORG: ________________ # Your GitHub organization name
GITHUB_REPO: ________________ # Repository name (e.g., "Hyperhive")
GITHUB_REPO_URL: ________________ # Full URL (e.g., "github.com/YourOrg/YourRepo")

# npm Configuration
NPM_ORG: ________________ # npm organization name (e.g., "hyperhive")
NPM_SCOPE: ________________ # npm scope with @ (e.g., "@hyperhive")

# Vercel Configuration (for Turborepo Remote Cache)
TURBO_TEAM: ________________ # Vercel team slug
TURBO_TOKEN: ________________ # Vercel access token (keep secret!)

# GitHub App Configuration (for Releases)
RELEASE_APP_ID: ________________ # GitHub App ID number
RELEASE_APP_NAME: ________________ # GitHub App name you chose
# Note: Private key will be stored as GitHub secret, not here
```

---

## Phase 1: Account & Service Setup (Manual)

> **Important**: Complete ALL steps in Phase 1 before proceeding to Phase 2.

### 1.1 npm Organization Setup

#### Step 1: Create npm Organization

1. Go to [npmjs.com](https://www.npmjs.com) and log in (or create an account)
2. Navigate to [npmjs.com/org/create](https://www.npmjs.com/org/create)
3. Enter your organization name

   > **Prompt**: What npm organization name do you want to use?
   >
   > Recommendation: Use a short, memorable name that matches your project
   >
   > **Your choice**: `________________`
   >
   > Record this as `NPM_ORG` above

4. Select plan: **"Unlimited public packages"** (free tier)
5. Click **Create**

- [ ] npm organization created

#### Step 2: Configure OIDC Trusted Publishing

1. Go to your organization page: `npmjs.com/org/[YOUR_NPM_ORG]`
2. Click **Settings** (gear icon)
3. Navigate to **Publishing** section
4. Under **Trusted Publishers**, click **Add trusted publisher**
5. Fill in the form:

   > **Prompt**: Enter the values you'll use for GitHub:

   | Field                 | Value to Enter                       |
   | --------------------- | ------------------------------------ |
   | **Provider**          | GitHub Actions                       |
   | **Owner**             | `________________` (your GitHub org) |
   | **Repository**        | `________________` (your repo name)  |
   | **Workflow filename** | `release.yml`                        |
   | **Environment**       | `npm-publish`                        |

6. Click **Add**
7. Optionally enable **"Require provenance statements"** for enhanced security

- [ ] OIDC trusted publisher configured on npm

> **Note**: The OIDC setup allows GitHub Actions to publish packages without storing npm tokens. The workflow must run in the `npm-publish` environment.

### 1.2 Vercel Account Setup (for Turborepo Remote Cache)

#### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com) and sign up/log in
2. You can use personal account or create a team

- [ ] Vercel account ready

#### Step 2: Create Access Token

1. Click your avatar (top-right) → **Settings**
2. Navigate to **Tokens** in the left sidebar
3. Click **Create** button
4. Configure token:
   - **Name**: `turborepo-cache`
   - **Scope**: Select your team/personal account
   - **Expiration**: No expiration (or set as preferred)
5. Click **Create Token**
6. **IMPORTANT**: Copy the token immediately - you won't see it again!

   > **Prompt**: Paste your Vercel token here (for your records, keep secure!):
   >
   > **TURBO_TOKEN**: `________________`

- [ ] Vercel token created and saved

#### Step 3: Get Team Slug

1. Your team slug is in the URL when you're on the dashboard
2. URL format: `vercel.com/<TEAM_SLUG>`
3. For personal accounts, use your username

   > **Prompt**: What is your Vercel team slug?
   >
   > **TURBO_TEAM**: `________________`

- [ ] Vercel team slug recorded

### 1.3 GitHub Repository Setup

#### Step 1: Create Repository

1. Go to `github.com/organizations/[YOUR_ORG]/repositories/new`

   > **Prompt**: Confirm your GitHub details:
   >
   > **Organization**: `________________`
   > **Repository name**: `________________`

2. Configure:
   - **Repository name**: Your chosen name
   - **Description**: `Hyperhive - LLM Agent SDK wrapper library`
   - **Visibility**: Public
   - **Initialize with README**: **Unchecked** (we'll push our own)
   - **Add .gitignore**: None
   - **License**: MIT
3. Click **Create repository**

- [ ] GitHub repository created

#### Step 2: Configure Repository Settings

Navigate to `github.com/[YOUR_ORG]/[YOUR_REPO]/settings`:

**General Settings:**

1. Scroll to **Pull Requests** section
2. Configure:
   - [x] Allow squash merging
   - [x] Automatically delete head branches
   - [ ] Allow merge commits (uncheck if you prefer only squash)
   - [ ] Allow rebase merging (optional)

- [ ] Pull request settings configured

**Branch Protection Rules:**

1. Go to **Settings → Branches**
2. Click **Add branch protection rule**
3. Configure:
   - **Branch name pattern**: `main`
   - [x] Require a pull request before merging
     - [x] Require approvals: 1 (or 0 for solo projects)
   - [x] Require status checks to pass before merging
     - [x] Require branches to be up to date before merging
     - Add required checks after first CI run: `CI / ci (22)`, `CI / ci (24)`
   - [x] Do not allow bypassing the above settings
4. Click **Create**

- [ ] Branch protection rules configured

### 1.4 GitHub App Setup (for Releases)

> **Why GitHub App?** Unlike GITHUB_TOKEN, a GitHub App token can trigger other workflows when it creates commits (like the release commit).

#### Step 1: Create GitHub App

1. Go to `github.com/organizations/[YOUR_ORG]/settings/apps/new`

   > **Prompt**: What do you want to name your GitHub App?
   >
   > Recommendation: `[Your Project] Release Bot`
   >
   > **RELEASE_APP_NAME**: `________________`

2. Fill in:
   - **GitHub App name**: Your chosen name
   - **Description**: `Automated releases for [Your Project] monorepo`
   - **Homepage URL**: `https://github.com/[YOUR_ORG]/[YOUR_REPO]`

3. **Webhook** section:
   - **Active**: **Unchecked** (we don't need webhooks)

4. **Permissions** section - Repository permissions:
   - **Contents**: Read and write
   - **Pull requests**: Read and write
   - **Metadata**: Read-only (auto-selected)

5. **Where can this GitHub App be installed?**
   - Select: **Only on this account**

6. Click **Create GitHub App**

- [ ] GitHub App created

#### Step 2: Get App Credentials

After creation, you'll be on the app settings page:

1. **App ID**: Note the number at the top

   > **Prompt**: What is your App ID number?
   >
   > **RELEASE_APP_ID**: `________________`

2. **Generate Private Key**:
   - Scroll to **Private keys** section
   - Click **Generate a private key**
   - A `.pem` file will download automatically
   - Open the file and copy the entire contents (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)
   - **Keep this file secure!**

- [ ] App ID recorded
- [ ] Private key downloaded and secured

#### Step 3: Install App on Repository

1. In the left sidebar, click **Install App**
2. Click **Install** next to your organization
3. Select **Only select repositories**
4. Choose your repository
5. Click **Install**

- [ ] GitHub App installed on repository

### 1.5 GitHub Secrets & Variables

Navigate to `github.com/[YOUR_ORG]/[YOUR_REPO]/settings/secrets/actions`:

#### Secrets (Settings → Secrets and variables → Actions → Secrets)

Click **New repository secret** for each:

| Name                      | Value                          | Status    |
| ------------------------- | ------------------------------ | --------- |
| `TURBO_TOKEN`             | Your Vercel token              | [ ] Added |
| `RELEASE_APP_PRIVATE_KEY` | Full contents of the .pem file | [ ] Added |

#### Variables (Settings → Secrets and variables → Actions → Variables)

Click **New repository variable** for each:

| Name             | Value                     | Status    |
| ---------------- | ------------------------- | --------- |
| `TURBO_TEAM`     | Your Vercel team slug     | [ ] Added |
| `RELEASE_APP_ID` | Your GitHub App ID number | [ ] Added |

### 1.6 GitHub Environment Setup

1. Go to `github.com/[YOUR_ORG]/[YOUR_REPO]/settings/environments`
2. Click **New environment**
3. Enter name: `npm-publish`
4. Click **Configure environment**
5. Optional: Add deployment protection rules if desired
6. Click **Save protection rules** (or just leave as is)

- [ ] Environment `npm-publish` created

> **Note**: This environment name must match exactly what's in the OIDC trusted publisher configuration on npm.

### Phase 1 Checklist

Before proceeding, verify you have completed:

- [ ] npm organization created
- [ ] OIDC trusted publisher configured on npm
- [ ] Vercel account with token and team slug
- [ ] GitHub repository created
- [ ] Repository settings configured (squash merge, branch protection)
- [ ] GitHub App created and installed
- [ ] All secrets added: `TURBO_TOKEN`, `RELEASE_APP_PRIVATE_KEY`
- [ ] All variables added: `TURBO_TEAM`, `RELEASE_APP_ID`
- [ ] Environment `npm-publish` created

---

## Phase 2: Repository Initialization (Claude Code)

### Directory Structure

```
hyperhive/
├── .changeset/
│   ├── config.json
│   └── README.md
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── ci.yml
│       ├── release.yml
│       ├── pr-validation.yml
│       ├── codeql.yml
│       └── dependency-review.yml
├── .husky/
│   ├── commit-msg
│   └── pre-commit
├── packages/
│   ├── colony/                     # @hyperhive/colony
│   │   ├── src/
│   │   │   ├── colony.ts           # Main AIColony class
│   │   │   ├── drone.ts            # Drone (LLM session) class
│   │   │   ├── types.ts            # TypeScript interfaces
│   │   │   └── index.ts
│   │   ├── tests/
│   │   │   ├── colony.test.ts
│   │   │   └── drone.test.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   ├── vitest.config.ts
│   │   └── README.md
│   ├── plugins/
│   │   └── fastify/                # @hyperhive/plugin-fastify
│   │       ├── src/
│   │       │   ├── plugin.ts
│   │       │   └── index.ts
│   │       ├── tests/
│   │       │   └── plugin.test.ts
│   │       ├── package.json
│   │       ├── tsconfig.json
│   │       ├── tsup.config.ts
│   │       ├── vitest.config.ts
│   │       └── README.md
│   └── configs/
│       ├── eslint/
│       │   ├── base.js
│       │   └── package.json
│       └── typescript/
│           ├── base.json
│           ├── library.json
│           └── package.json
├── eslint.config.js
├── .gitignore
├── .npmrc
├── .nvmrc
├── .prettierrc
├── .prettierignore
├── commitlint.config.js
├── lint-staged.config.js
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
└── README.md
```

---

## Phase 2 File Contents

### Root Configuration Files

#### `package.json`

```json
{
  "name": "hyperhive-monorepo",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@9.15.1",
  "engines": {
    "node": ">=22.0.0"
  },
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "test:watch": "turbo run test:watch",
    "test:coverage": "turbo run test:coverage",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build && changeset publish",
    "prepare": "husky"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.10",
    "@commitlint/cli": "^19.6.1",
    "@commitlint/config-conventional": "^19.6.0",
    "husky": "^9.1.7",
    "lint-staged": "^15.2.11",
    "prettier": "^3.4.2",
    "turbo": "^2.3.3",
    "typescript": "^5.7.2"
  }
}
```

#### `pnpm-workspace.yaml`

```yaml
packages:
  - "packages/colony"
  - "packages/plugins/*"
  - "packages/storages/*"
  - "packages/observability/*"
  - "packages/security/*"
  - "packages/orchestration/*"
  - "packages/ai/*"
  - "packages/tools/*"
  - "packages/configs/*"

catalog:
  # TypeScript
  typescript: ^5.7.2

  # Build
  tsup: ^8.3.5

  # Testing
  vitest: ^2.1.8
  "@vitest/coverage-v8": ^2.1.8

  # Linting
  eslint: ^9.17.0
  "@eslint/js": ^9.17.0
  typescript-eslint: ^8.18.1
  globals: ^15.14.0

  # Types
  "@types/node": ^22.10.2
```

#### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "inputs": ["src/**", "tsconfig.json", "tsup.config.ts", "package.json"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": [],
      "inputs": ["src/**", "tests/**", "vitest.config.ts"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    },
    "test:coverage": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": [],
      "inputs": ["src/**", "tests/**", "eslint.config.js", "package.json"]
    },
    "lint:fix": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": false
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": [],
      "inputs": ["src/**", "tests/**", "tsconfig.json"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

#### `.npmrc`

```ini
# pnpm settings
auto-install-peers=true
strict-peer-dependencies=false

# npm publishing settings
access=public
provenance=true
```

#### `.nvmrc`

```
22
```

#### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true
  },
  "exclude": ["node_modules", "dist", "coverage"]
}
```

#### `eslint.config.js`

```javascript
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/*.config.js",
      "**/*.config.ts",
    ],
  }
);
```

#### `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

#### `.prettierignore`

```
# Dependencies
node_modules/

# Build outputs
dist/
coverage/

# Package manager
pnpm-lock.yaml

# Turborepo
.turbo/

# Changesets
.changeset/*.md
!.changeset/README.md

# IDE
.idea/
.vscode/

# OS
.DS_Store
```

#### `.gitignore`

```
# Dependencies
node_modules/

# Build outputs
dist/
*.tsbuildinfo

# Coverage
coverage/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Turborepo
.turbo/

# Debug
*.log
npm-debug.log*
pnpm-debug.log*

# Testing
*.lcov
```

#### `commitlint.config.js`

```javascript
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "scope-enum": [1, "always", ["colony", "plugin-fastify", "config", "ci", "deps", "release"]],
    "subject-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
  },
};
```

#### `lint-staged.config.js`

```javascript
export default {
  "*.{js,ts,jsx,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
};
```

---

### Changesets Configuration

#### `.changeset/config.json`

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.5/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@hyperhive/config-eslint", "@hyperhive/config-typescript"],
  "privatePackages": {
    "version": false,
    "tag": false
  }
}
```

#### `.changeset/README.md`

````markdown
# Changesets

Hello and welcome! This folder has been automatically generated by `@changesets/cli`, a build tool that works with multi-package repos, or single-package repos to help you version and publish your code.

## Adding a Changeset

To add a changeset, run:

```bash
pnpm changeset
```
````

This will prompt you to:

1. Select which packages have changed
2. Choose the bump type (major/minor/patch)
3. Write a summary of the changes

## Releasing

When changesets are merged to main, the release workflow will:

1. Create a "Version Packages" PR with version bumps
2. When merged, publish packages to npm

## More Information

See [the changesets documentation](https://github.com/changesets/changesets) for more details.

````

---

### Husky Git Hooks

#### `.husky/pre-commit`

```bash
pnpm lint-staged
````

#### `.husky/commit-msg`

```bash
pnpm commitlint --edit $1
```

> **Note**: These files must be executable. After creating them, run: `chmod +x .husky/pre-commit .husky/commit-msg`

---

### Shared Configuration Packages

#### `packages/configs/typescript/package.json`

```json
{
  "name": "@hyperhive/config-typescript",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./base.json": "./base.json",
    "./library.json": "./library.json"
  },
  "files": ["base.json", "library.json"]
}
```

#### `packages/configs/typescript/base.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
```

#### `packages/configs/typescript/library.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  }
}
```

#### `packages/configs/eslint/package.json`

```json
{
  "name": "@hyperhive/config-eslint",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./base.js"
  },
  "files": ["base.js"],
  "dependencies": {
    "@eslint/js": "catalog:",
    "eslint": "catalog:",
    "globals": "catalog:",
    "typescript-eslint": "catalog:"
  }
}
```

#### `packages/configs/eslint/base.js`

```javascript
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

/**
 * Creates ESLint configuration for a package.
 * @param {string} tsconfigRootDir - The root directory for tsconfig
 * @returns {import('typescript-eslint').ConfigWithExtends[]}
 */
export function createConfig(tsconfigRootDir) {
  return tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        globals: {
          ...globals.node,
        },
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
    },
    {
      files: ["**/*.js"],
      ...tseslint.configs.disableTypeChecked,
    },
    {
      ignores: ["dist/**", "node_modules/**", "coverage/**", "*.config.js", "*.config.ts"],
    }
  );
}

export default createConfig;
```

---

### Colony Package (@hyperhive/colony)

#### `packages/colony/package.json`

```json
{
  "name": "@hyperhive/colony",
  "version": "0.1.0",
  "description": "Hyperhive Colony - LLM Agent SDK wrapper library",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "license": "MIT",
  "author": "Hypergamed",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Hypergamed/Hyperhive.git",
    "directory": "packages/colony"
  },
  "bugs": {
    "url": "https://github.com/Hypergamed/Hyperhive/issues"
  },
  "homepage": "https://github.com/Hypergamed/Hyperhive/tree/main/packages/colony#readme",
  "keywords": ["claude", "anthropic", "agent", "ai", "sdk", "wrapper", "llm", "openai"],
  "engines": {
    "node": ">=22.0.0"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src tests",
    "lint:fix": "eslint src tests --fix",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist coverage"
  },
  "devDependencies": {
    "@hyperhive/config-eslint": "workspace:*",
    "@hyperhive/config-typescript": "workspace:*",
    "@types/node": "catalog:",
    "@vitest/coverage-v8": "catalog:",
    "eslint": "catalog:",
    "tsup": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```

#### `packages/colony/tsconfig.json`

```json
{
  "extends": "@hyperhive/config-typescript/library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

#### `packages/colony/tsup.config.ts`

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: false,
  minify: false,
  target: "node22",
});
```

#### `packages/colony/vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts"],
    },
  },
});
```

#### `packages/colony/src/types.ts`

```typescript
/**
 * Supported LLM providers.
 */
export type LLMProvider = "claude" | "openai" | "anthropic";

/**
 * Supported model tiers.
 */
export type ModelTier = "fast" | "balanced" | "powerful";

/**
 * AIColony configuration options.
 */
export interface ColonyConfig {
  /**
   * The API key for authentication.
   */
  apiKey: string;

  /**
   * The LLM provider to use.
   * @default "claude"
   */
  provider?: LLMProvider;

  /**
   * Optional base URL for the API.
   */
  baseUrl?: string;

  /**
   * Optional timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;
}

/**
 * Drone (LLM session) configuration options.
 */
export interface DroneConfig {
  /**
   * Working directory for the session.
   */
  cwd: string;

  /**
   * Model tier to use.
   * @default "balanced"
   */
  model?: ModelTier;

  /**
   * Available tools for this session.
   */
  tools?: string[];

  /**
   * System prompt to use.
   */
  systemPrompt?: string;

  /**
   * Custom metadata passed through.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Drone status states.
 */
export type DroneStatus = "idle" | "thinking" | "tool_running" | "error";

/**
 * Message from the LLM assistant.
 */
export interface AssistantMessage {
  id: string;
  role: "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Tool execution start event.
 */
export interface ToolStartEvent {
  id: string;
  tool: string;
  input: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Tool execution end event.
 */
export interface ToolEndEvent {
  id: string;
  tool: string;
  input: Record<string, unknown>;
  result: unknown;
  isError: boolean;
  durationMs: number;
  timestamp: Date;
}

/**
 * Session completion event.
 */
export interface CompleteEvent {
  success: boolean;
  usage: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
  };
  durationMs: number;
  timestamp: Date;
}
```

#### `packages/colony/src/drone.ts`

````typescript
import { EventEmitter } from "events";
import type {
  DroneConfig,
  DroneStatus,
  AssistantMessage,
  ToolStartEvent,
  ToolEndEvent,
  CompleteEvent,
} from "./types.js";

/**
 * Drone represents an active LLM session.
 *
 * The Drone is an autonomous agent - an active connection to an LLM provider
 * that can process prompts, execute tools, and maintain conversation history.
 *
 * @example
 * ```typescript
 * const claudeDrone = await colony.hatch({ provider: 'claude', cwd: '/project' });
 *
 * claudeDrone.on('message', (msg) => console.log('Claude:', msg.content));
 * claudeDrone.on('tool:start', ({ tool }) => console.log(`Running ${tool}...`));
 *
 * await claudeDrone.buzz('Fix the authentication bug');
 * ```
 */
export class Drone extends EventEmitter {
  readonly id: string;
  readonly cwd: string;
  readonly metadata: Record<string, unknown>;

  private _status: DroneStatus = "idle";
  private readonly _messages: AssistantMessage[] = [];
  private readonly _config: Required<Omit<DroneConfig, "metadata">> & {
    metadata: Record<string, unknown>;
  };
  private readonly _createdAt: Date;

  constructor(id: string, config: DroneConfig) {
    super();
    this.id = id;
    this.cwd = config.cwd;
    this.metadata = config.metadata ?? {};
    this._createdAt = new Date();

    this._config = {
      cwd: config.cwd,
      model: config.model ?? "balanced",
      tools: config.tools ?? [],
      systemPrompt: config.systemPrompt ?? "",
      metadata: config.metadata ?? {},
    };
  }

  /**
   * Gets the current status of the Drone.
   */
  get status(): DroneStatus {
    return this._status;
  }

  /**
   * Gets when this Drone was created.
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Gets the configured model tier.
   */
  get model(): string {
    return this._config.model;
  }

  /**
   * Sends a prompt to the LLM for processing (buzz).
   *
   * @param prompt - The prompt to send
   */
  async buzz(prompt: string): Promise<void> {
    if (this._status !== "idle") {
      throw new Error(`Cannot buzz while Drone is ${this._status}`);
    }

    this._status = "thinking";
    this.emit("status", this._status);

    // TODO: Implement actual LLM integration
    // For now, this is a placeholder that simulates a response

    const message: AssistantMessage = {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: `Received prompt: ${prompt}`,
      timestamp: new Date(),
    };

    this._messages.push(message);
    this.emit("message", message);

    this._status = "idle";
    this.emit("status", this._status);

    const completeEvent: CompleteEvent = {
      success: true,
      usage: {
        inputTokens: prompt.length,
        outputTokens: message.content.length,
        costUsd: 0,
      },
      durationMs: 100,
      timestamp: new Date(),
    };

    this.emit("complete", completeEvent);
  }

  /**
   * Interrupts the current operation.
   */
  async interrupt(): Promise<void> {
    if (this._status === "idle") {
      return;
    }

    // TODO: Implement actual interruption
    this._status = "idle";
    this.emit("status", this._status);
  }

  /**
   * Retires this Drone and cleans up resources.
   */
  async retire(): Promise<void> {
    await this.interrupt();
    this.removeAllListeners();
  }

  /**
   * Gets message history.
   *
   * @param options - Pagination options
   */
  getMessages(options?: { limit?: number; offset?: number }): AssistantMessage[] {
    const { limit, offset = 0 } = options ?? {};
    const messages = this._messages.slice(offset);
    return limit ? messages.slice(0, limit) : messages;
  }

  /**
   * Gets the last message.
   */
  getLastMessage(): AssistantMessage | undefined {
    return this._messages[this._messages.length - 1];
  }

  /**
   * Clears message history.
   */
  clearMessages(): void {
    this._messages.length = 0;
  }

  // Event type overloads
  on(event: "message", handler: (message: AssistantMessage) => void): this;
  on(event: "tool:start", handler: (data: ToolStartEvent) => void): this;
  on(event: "tool:end", handler: (data: ToolEndEvent) => void): this;
  on(event: "status", handler: (status: DroneStatus) => void): this;
  on(event: "complete", handler: (data: CompleteEvent) => void): this;
  on(event: "error", handler: (error: Error) => void): this;
  on(event: string, handler: (...args: unknown[]) => void): this {
    return super.on(event, handler);
  }
}
````

#### `packages/colony/src/colony.ts`

````typescript
import { EventEmitter } from "events";
import { Drone } from "./drone.js";
import type { ColonyConfig, DroneConfig, LLMProvider } from "./types.js";

/**
 * Drone info returned by listDrones.
 */
export interface DroneInfo {
  id: string;
  cwd: string;
  status: string;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

/**
 * AIColony is the central controller for Hyperhive.
 *
 * The AIColony manages all Drones (LLM sessions), handles configuration,
 * and provides the main entry point for the library.
 *
 * @example
 * ```typescript
 * import { AIColony } from '@hyperhive/colony';
 *
 * const colony = new AIColony({
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 *   provider: 'claude',
 * });
 *
 * const claudeDrone = await colony.hatch({
 *   cwd: '/path/to/project',
 * });
 *
 * claudeDrone.on('message', (msg) => console.log(msg.content));
 * await claudeDrone.buzz('Fix the bug in auth.ts');
 * ```
 */
export class AIColony extends EventEmitter {
  private readonly _config: Required<ColonyConfig>;
  private readonly _drones: Map<string, Drone> = new Map();

  constructor(config: ColonyConfig) {
    super();

    this._config = {
      apiKey: config.apiKey,
      provider: config.provider ?? "claude",
      baseUrl: config.baseUrl ?? this.getDefaultBaseUrl(config.provider ?? "claude"),
      timeout: config.timeout ?? 30000,
    };
  }

  /**
   * Gets the default base URL for a provider.
   */
  private getDefaultBaseUrl(provider: LLMProvider): string {
    switch (provider) {
      case "claude":
      case "anthropic":
        return "https://api.anthropic.com";
      case "openai":
        return "https://api.openai.com";
      default:
        return "https://api.anthropic.com";
    }
  }

  /**
   * Hatches a new Drone (creates a new LLM session).
   *
   * @param config - Drone configuration
   */
  async hatch(config: DroneConfig): Promise<Drone> {
    const id = `drone_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const drone = new Drone(id, config);

    this._drones.set(id, drone);
    this.emit("drone:hatched", drone);

    return drone;
  }

  /**
   * Recalls an existing Drone by ID (reconnects to session).
   *
   * @param id - Drone ID
   */
  recall(id: string): Drone | undefined {
    return this._drones.get(id);
  }

  /**
   * Retires a Drone and removes it from tracking.
   *
   * @param id - Drone ID to retire
   */
  async retire(id: string): Promise<void> {
    const drone = this._drones.get(id);
    if (drone) {
      await drone.retire();
      this._drones.delete(id);
      this.emit("drone:retired", id);
    }
  }

  /**
   * Lists all active Drones.
   */
  listDrones(): DroneInfo[] {
    return Array.from(this._drones.values()).map((drone) => ({
      id: drone.id,
      cwd: drone.cwd,
      status: drone.status,
      createdAt: drone.createdAt,
      metadata: drone.metadata,
    }));
  }

  /**
   * Gets the configured API key (masked for security).
   */
  getApiKeyMasked(): string {
    const key = this._config.apiKey;
    if (key.length <= 8) {
      return "****";
    }
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }

  /**
   * Gets the configured base URL.
   */
  getBaseUrl(): string {
    return this._config.baseUrl;
  }

  /**
   * Gets the configured timeout.
   */
  getTimeout(): number {
    return this._config.timeout;
  }

  /**
   * Gets the configured provider.
   */
  getProvider(): LLMProvider {
    return this._config.provider;
  }

  // Event type overloads
  on(event: "drone:hatched", handler: (drone: Drone) => void): this;
  on(event: "drone:retired", handler: (droneId: string) => void): this;
  on(event: "error", handler: (error: Error, drone?: Drone) => void): this;
  on(event: string, handler: (...args: unknown[]) => void): this {
    return super.on(event, handler);
  }
}
````

#### `packages/colony/src/index.ts`

```typescript
export { AIColony } from "./colony.js";
export { Drone } from "./drone.js";
export type {
  ColonyConfig,
  DroneConfig,
  DroneStatus,
  LLMProvider,
  ModelTier,
  AssistantMessage,
  ToolStartEvent,
  ToolEndEvent,
  CompleteEvent,
} from "./types.js";
export type { DroneInfo } from "./colony.js";
```

#### `packages/colony/tests/colony.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { AIColony } from "../src/colony.js";
import { Drone } from "../src/drone.js";

describe("AIColony", () => {
  it("should create instance with required config", () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    expect(colony).toBeInstanceOf(AIColony);
  });

  it("should use default provider when not provided", () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    expect(colony.getProvider()).toBe("claude");
  });

  it("should use custom provider when provided", () => {
    const colony = new AIColony({
      apiKey: "test-api-key",
      provider: "openai",
    });
    expect(colony.getProvider()).toBe("openai");
  });

  it("should use correct default baseUrl for claude", () => {
    const colony = new AIColony({ apiKey: "test-api-key", provider: "claude" });
    expect(colony.getBaseUrl()).toBe("https://api.anthropic.com");
  });

  it("should use correct default baseUrl for openai", () => {
    const colony = new AIColony({ apiKey: "test-api-key", provider: "openai" });
    expect(colony.getBaseUrl()).toBe("https://api.openai.com");
  });

  it("should use custom baseUrl when provided", () => {
    const colony = new AIColony({
      apiKey: "test-api-key",
      baseUrl: "https://custom.api.com",
    });
    expect(colony.getBaseUrl()).toBe("https://custom.api.com");
  });

  it("should use default timeout when not provided", () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    expect(colony.getTimeout()).toBe(30000);
  });

  it("should use custom timeout when provided", () => {
    const colony = new AIColony({
      apiKey: "test-api-key",
      timeout: 60000,
    });
    expect(colony.getTimeout()).toBe(60000);
  });

  it("should mask API key correctly", () => {
    const colony = new AIColony({ apiKey: "sk-ant-api-key-12345678" });
    expect(colony.getApiKeyMasked()).toBe("sk-a...5678");
  });

  it("should fully mask short API keys", () => {
    const colony = new AIColony({ apiKey: "short" });
    expect(colony.getApiKeyMasked()).toBe("****");
  });

  it("should hatch a Drone", async () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    const drone = await colony.hatch({ cwd: "/test/project" });

    expect(drone).toBeInstanceOf(Drone);
    expect(drone.cwd).toBe("/test/project");
  });

  it("should list hatched Drones", async () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    await colony.hatch({ cwd: "/project1" });
    await colony.hatch({ cwd: "/project2" });

    const drones = colony.listDrones();
    expect(drones).toHaveLength(2);
    expect(drones[0]?.cwd).toBe("/project1");
    expect(drones[1]?.cwd).toBe("/project2");
  });

  it("should recall Drone by ID", async () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    const drone = await colony.hatch({ cwd: "/test" });

    const recalled = colony.recall(drone.id);
    expect(recalled).toBe(drone);
  });

  it("should retire Drone", async () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    const drone = await colony.hatch({ cwd: "/test" });

    await colony.retire(drone.id);

    expect(colony.recall(drone.id)).toBeUndefined();
    expect(colony.listDrones()).toHaveLength(0);
  });

  it("should emit drone:hatched event", async () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    let hatchedDrone: Drone | undefined;

    colony.on("drone:hatched", (drone) => {
      hatchedDrone = drone;
    });

    const drone = await colony.hatch({ cwd: "/test" });

    expect(hatchedDrone).toBe(drone);
  });

  it("should emit drone:retired event", async () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    let retiredId: string | undefined;

    colony.on("drone:retired", (id) => {
      retiredId = id;
    });

    const drone = await colony.hatch({ cwd: "/test" });
    await colony.retire(drone.id);

    expect(retiredId).toBe(drone.id);
  });
});
```

#### `packages/colony/tests/drone.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";
import { Drone } from "../src/drone.js";

describe("Drone", () => {
  it("should create instance with config", () => {
    const drone = new Drone("test-id", { cwd: "/test" });

    expect(drone.id).toBe("test-id");
    expect(drone.cwd).toBe("/test");
    expect(drone.status).toBe("idle");
  });

  it("should use default model when not provided", () => {
    const drone = new Drone("test-id", { cwd: "/test" });
    expect(drone.model).toBe("balanced");
  });

  it("should use custom model when provided", () => {
    const drone = new Drone("test-id", { cwd: "/test", model: "powerful" });
    expect(drone.model).toBe("powerful");
  });

  it("should store metadata", () => {
    const drone = new Drone("test-id", {
      cwd: "/test",
      metadata: { userId: "user-123" },
    });

    expect(drone.metadata).toEqual({ userId: "user-123" });
  });

  it("should buzz and emit events", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });
    const messageHandler = vi.fn();
    const statusHandler = vi.fn();
    const completeHandler = vi.fn();

    drone.on("message", messageHandler);
    drone.on("status", statusHandler);
    drone.on("complete", completeHandler);

    await drone.buzz("Hello");

    expect(messageHandler).toHaveBeenCalledOnce();
    expect(statusHandler).toHaveBeenCalledWith("thinking");
    expect(statusHandler).toHaveBeenCalledWith("idle");
    expect(completeHandler).toHaveBeenCalledOnce();
  });

  it("should throw error when buzzing while not idle", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });

    // Start a buzz operation
    const buzzPromise = drone.buzz("First");

    // Try to buzz again immediately (status should be 'thinking')
    await expect(drone.buzz("Second")).rejects.toThrow("Cannot buzz while Drone is thinking");

    await buzzPromise;
  });

  it("should get messages", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });

    await drone.buzz("Hello");

    const messages = drone.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0]?.content).toContain("Hello");
  });

  it("should get last message", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });

    await drone.buzz("First");
    await drone.buzz("Second");

    const lastMessage = drone.getLastMessage();
    expect(lastMessage?.content).toContain("Second");
  });

  it("should clear messages", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });

    await drone.buzz("Hello");
    expect(drone.getMessages()).toHaveLength(1);

    drone.clearMessages();
    expect(drone.getMessages()).toHaveLength(0);
  });

  it("should support message pagination", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });

    await drone.buzz("First");
    await drone.buzz("Second");
    await drone.buzz("Third");

    const limited = drone.getMessages({ limit: 2 });
    expect(limited).toHaveLength(2);

    const offset = drone.getMessages({ offset: 1 });
    expect(offset).toHaveLength(2);

    const both = drone.getMessages({ offset: 1, limit: 1 });
    expect(both).toHaveLength(1);
  });

  it("should retire and remove listeners", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });
    const handler = vi.fn();

    drone.on("message", handler);
    await drone.retire();

    // After retire, listeners should be removed
    expect(drone.listenerCount("message")).toBe(0);
  });

  it("should interrupt operation", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });

    // Interrupt while idle should be no-op
    await drone.interrupt();
    expect(drone.status).toBe("idle");
  });
});
```

#### `packages/colony/README.md`

````markdown
# @hyperhive/colony

Core library for Hyperhive - an LLM Agent SDK wrapper.

## Nomenclature

- **AIColony**: The central controller that manages all LLM sessions
- **Drone**: An autonomous agent - the active LLM session (e.g., `claudeDrone`, `gptDrone`)
- **buzz()**: Method to send prompts to the LLM

## Installation

```bash
npm install @hyperhive/colony
# or
pnpm add @hyperhive/colony
# or
yarn add @hyperhive/colony
```
````

## Usage

```typescript
import { AIColony } from "@hyperhive/colony";

// Create the central controller
const colony = new AIColony({
  apiKey: process.env.ANTHROPIC_API_KEY,
  provider: "claude", // or "openai"
});

// Hatch a Drone (create LLM session)
const claudeDrone = await colony.hatch({
  cwd: "/path/to/project",
  model: "balanced",
});

// Listen to events
claudeDrone.on("message", (msg) => {
  console.log("AI:", msg.content);
});

claudeDrone.on("tool:start", ({ tool }) => {
  console.log(`Running ${tool}...`);
});

claudeDrone.on("complete", ({ usage }) => {
  console.log(`Cost: $${usage.costUsd.toFixed(4)}`);
});

// Send a prompt with buzz()
await claudeDrone.buzz("Fix the authentication bug in auth.ts");

// Get conversation history
const messages = claudeDrone.getMessages();

// Clean up
await colony.retire(claudeDrone.id);
```

## Configuration

### AIColony Options

| Option     | Type                   | Default          | Description           |
| ---------- | ---------------------- | ---------------- | --------------------- |
| `apiKey`   | `string`               | (required)       | Your API key          |
| `provider` | `"claude" \| "openai"` | `"claude"`       | LLM provider          |
| `baseUrl`  | `string`               | Provider default | API base URL          |
| `timeout`  | `number`               | `30000`          | Request timeout in ms |

### Drone Options

| Option         | Type                                 | Default      | Description       |
| -------------- | ------------------------------------ | ------------ | ----------------- |
| `cwd`          | `string`                             | (required)   | Working directory |
| `model`        | `"fast" \| "balanced" \| "powerful"` | `"balanced"` | Model tier        |
| `tools`        | `string[]`                           | `[]`         | Available tools   |
| `systemPrompt` | `string`                             | `""`         | System prompt     |
| `metadata`     | `Record<string, unknown>`            | `{}`         | Custom metadata   |

## Events

### Drone Events

| Event        | Payload            | Description              |
| ------------ | ------------------ | ------------------------ |
| `message`    | `AssistantMessage` | New message from the LLM |
| `tool:start` | `ToolStartEvent`   | Tool execution started   |
| `tool:end`   | `ToolEndEvent`     | Tool execution completed |
| `status`     | `DroneStatus`      | Status changed           |
| `complete`   | `CompleteEvent`    | Operation completed      |
| `error`      | `Error`            | Error occurred           |

### AIColony Events

| Event           | Payload         | Description        |
| --------------- | --------------- | ------------------ |
| `drone:hatched` | `Drone`         | New Drone hatched  |
| `drone:retired` | `string`        | Drone retired (ID) |
| `error`         | `Error, Drone?` | Error occurred     |

## License

MIT

````

---

### Fastify Plugin Package (@hyperhive/plugin-fastify)

#### `packages/plugins/fastify/package.json`

```json
{
  "name": "@hyperhive/plugin-fastify",
  "version": "0.1.0",
  "description": "Fastify plugin for Hyperhive",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "license": "MIT",
  "author": "Hypergamed",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Hypergamed/Hyperhive.git",
    "directory": "packages/plugins/fastify"
  },
  "bugs": {
    "url": "https://github.com/Hypergamed/Hyperhive/issues"
  },
  "homepage": "https://github.com/Hypergamed/Hyperhive/tree/main/packages/plugins/fastify#readme",
  "keywords": [
    "claude",
    "anthropic",
    "agent",
    "ai",
    "fastify",
    "plugin",
    "hyperhive"
  ],
  "engines": {
    "node": ">=22.0.0"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src tests",
    "lint:fix": "eslint src tests --fix",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist coverage"
  },
  "dependencies": {
    "@hyperhive/colony": "workspace:*",
    "fastify-plugin": "^5.0.1"
  },
  "peerDependencies": {
    "fastify": "^5.0.0"
  },
  "devDependencies": {
    "@hyperhive/config-eslint": "workspace:*",
    "@hyperhive/config-typescript": "workspace:*",
    "@types/node": "catalog:",
    "@vitest/coverage-v8": "catalog:",
    "eslint": "catalog:",
    "fastify": "^5.2.1",
    "tsup": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
````

#### `packages/plugins/fastify/tsconfig.json`

```json
{
  "extends": "@hyperhive/config-typescript/library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

#### `packages/plugins/fastify/tsup.config.ts`

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: false,
  minify: false,
  target: "node22",
  external: ["fastify", "@hyperhive/colony"],
});
```

#### `packages/plugins/fastify/vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts"],
    },
  },
});
```

#### `packages/plugins/fastify/src/plugin.ts`

````typescript
import type { FastifyPluginAsync, FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { AIColony, type ColonyConfig } from "@hyperhive/colony";

/**
 * Options for the Hyperhive AIColony Fastify plugin.
 */
export interface ColonyFastifyOptions extends ColonyConfig {
  /**
   * Name to use for decorator. Defaults to "colony".
   * @default "colony"
   */
  decoratorName?: string;
}

/**
 * Hyperhive AIColony Fastify plugin.
 *
 * Decorates Fastify instance with an AIColony controller.
 *
 * @example
 * ```typescript
 * import Fastify from "fastify";
 * import { colonyPlugin } from "@hyperhive/plugin-fastify";
 *
 * const app = Fastify();
 *
 * await app.register(colonyPlugin, {
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 * });
 *
 * // Access AIColony via decorator
 * const drone = await app.colony.hatch({ cwd: '/project' });
 * ```
 */
const colonyPluginImpl: FastifyPluginAsync<ColonyFastifyOptions> = async (
  fastify: FastifyInstance,
  options: ColonyFastifyOptions
) => {
  const { decoratorName = "colony", ...config } = options;

  const colony = new AIColony(config);

  if (fastify.hasDecorator(decoratorName)) {
    throw new Error(`Decorator "${decoratorName}" is already registered`);
  }

  fastify.decorate(decoratorName, colony);
};

/**
 * Hyperhive AIColony Fastify plugin with encapsulation support.
 */
export const colonyPlugin = fp(colonyPluginImpl, {
  fastify: "5.x",
  name: "@hyperhive/plugin-fastify",
});
````

#### `packages/plugins/fastify/src/index.ts`

```typescript
export { colonyPlugin } from "./plugin.js";
export type { ColonyFastifyOptions } from "./plugin.js";

// Re-export colony types for convenience
export { AIColony, Drone } from "@hyperhive/colony";
export type {
  ColonyConfig,
  DroneConfig,
  DroneStatus,
  LLMProvider,
  ModelTier,
} from "@hyperhive/colony";
```

#### `packages/plugins/fastify/tests/plugin.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { colonyPlugin } from "../src/plugin.js";
import { AIColony } from "@hyperhive/colony";

describe("colonyPlugin", () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = Fastify();
  });

  afterEach(async () => {
    await app.close();
  });

  it("should register plugin and decorate instance", async () => {
    await app.register(colonyPlugin, {
      apiKey: "test-api-key",
    });

    expect(app.hasDecorator("colony")).toBe(true);
  });

  it("should create AIColony instance with provided config", async () => {
    await app.register(colonyPlugin, {
      apiKey: "test-api-key",
      baseUrl: "https://custom.api.com",
    });

    const colony = (app as unknown as { colony: AIColony }).colony;
    expect(colony).toBeInstanceOf(AIColony);
    expect(colony.getBaseUrl()).toBe("https://custom.api.com");
  });

  it("should use custom decorator name", async () => {
    await app.register(colonyPlugin, {
      apiKey: "test-api-key",
      decoratorName: "hive",
    });

    expect(app.hasDecorator("hive")).toBe(true);
    expect(app.hasDecorator("colony")).toBe(false);
  });

  it("should throw error if decorator already exists", async () => {
    app.decorate("colony", {});

    await expect(
      app.register(colonyPlugin, {
        apiKey: "test-api-key",
      })
    ).rejects.toThrow('Decorator "colony" is already registered');
  });

  it("should allow hatching Drones via the decorator", async () => {
    await app.register(colonyPlugin, {
      apiKey: "test-api-key",
    });

    const colony = (app as unknown as { colony: AIColony }).colony;
    const drone = await colony.hatch({ cwd: "/test" });

    expect(drone.cwd).toBe("/test");
  });
});
```

#### `packages/plugins/fastify/README.md`

````markdown
# @hyperhive/plugin-fastify

Fastify plugin for Hyperhive - integrates the AIColony controller with Fastify applications.

## Installation

```bash
npm install @hyperhive/plugin-fastify @hyperhive/colony fastify
# or
pnpm add @hyperhive/plugin-fastify @hyperhive/colony fastify
# or
yarn add @hyperhive/plugin-fastify @hyperhive/colony fastify
```
````

## Usage

```typescript
import Fastify from "fastify";
import { colonyPlugin } from "@hyperhive/plugin-fastify";

const app = Fastify();

await app.register(colonyPlugin, {
  apiKey: process.env.ANTHROPIC_API_KEY,
  provider: "claude",
});

// Access the AIColony controller
app.post("/chat", async (request, reply) => {
  const { prompt, projectPath } = request.body;

  const drone = await app.colony.hatch({
    cwd: projectPath,
  });

  drone.on("message", (msg) => {
    // Stream responses...
  });

  await drone.buzz(prompt);

  return { status: "ok" };
});

await app.listen({ port: 3000 });
```

## Options

| Option          | Type                   | Default          | Description                |
| --------------- | ---------------------- | ---------------- | -------------------------- |
| `apiKey`        | `string`               | (required)       | Your API key               |
| `provider`      | `"claude" \| "openai"` | `"claude"`       | LLM provider               |
| `baseUrl`       | `string`               | Provider default | API base URL               |
| `timeout`       | `number`               | `30000`          | Request timeout in ms      |
| `decoratorName` | `string`               | `"colony"`       | Name for Fastify decorator |

## TypeScript

For TypeScript support, extend Fastify's type definitions:

```typescript
import { AIColony } from "@hyperhive/colony";

declare module "fastify" {
  interface FastifyInstance {
    colony: AIColony;
  }
}
```

## License

MIT

````

---

## Phase 3: CI/CD Workflows

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  ci:
    name: CI
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22, 24]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check formatting
        run: pnpm format:check

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
````

### `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write

    steps:
      - name: Generate GitHub App token
        id: app-token
        uses: actions/create-github-app-token@v1
        with:
          app-id: ${{ vars.RELEASE_APP_ID }}
          private-key: ${{ secrets.RELEASE_APP_PRIVATE_KEY }}

      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ steps.app-token.outputs.token }}
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"
          registry-url: "https://registry.npmjs.org"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test

      - name: Create Release PR or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          version: pnpm version-packages
          publish: pnpm release
          commit: "chore(release): version packages"
          title: "chore(release): version packages"
        env:
          GITHUB_TOKEN: ${{ steps.app-token.outputs.token }}
          NPM_CONFIG_PROVENANCE: true

      - name: Published packages
        if: steps.changesets.outputs.published == 'true'
        run: |
          echo "Published packages:"
          echo '${{ steps.changesets.outputs.publishedPackages }}' | jq .
```

### `.github/workflows/pr-validation.yml`

```yaml
name: PR Validation

on:
  pull_request:
    types: [opened, synchronize, reopened, edited]

jobs:
  validate-pr-title:
    name: Validate PR Title
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Validate PR title
        run: echo "${{ github.event.pull_request.title }}" | pnpm commitlint

  validate-commits:
    name: Validate Commits
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Validate commits
        run: pnpm commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.event.pull_request.head.sha }}

  check-changeset:
    name: Check Changeset
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check for changeset
        run: |
          # Get list of changed files
          CHANGED_FILES=$(git diff --name-only origin/main...HEAD)

          # Check if any package files changed
          PACKAGE_CHANGED=false
          if echo "$CHANGED_FILES" | grep -qE "^packages/(colony|plugins|storages|observability|security|orchestration|ai|tools)/"; then
            PACKAGE_CHANGED=true
          fi

          # Check if changeset exists
          CHANGESET_EXISTS=false
          if echo "$CHANGED_FILES" | grep -qE "^\.changeset/.*\.md$"; then
            CHANGESET_EXISTS=true
          fi

          if [ "$PACKAGE_CHANGED" = true ] && [ "$CHANGESET_EXISTS" = false ]; then
            echo "::warning::No changeset found. If this PR includes user-facing changes, please run 'pnpm changeset' to add one."
          fi
```

### `.github/workflows/codeql.yml`

```yaml
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "30 1 * * 1"

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read

    strategy:
      fail-fast: false
      matrix:
        language: [javascript-typescript]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          queries: +security-extended

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{ matrix.language }}"
```

### `.github/workflows/dependency-review.yml`

```yaml
name: Dependency Review

on:
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  dependency-review:
    name: Dependency Review
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Dependency Review
        uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high
          deny-licenses: GPL-3.0, AGPL-3.0
          comment-summary-in-pr: always
```

### `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    commit-message:
      prefix: "chore(deps)"
    groups:
      minor-and-patch:
        patterns:
          - "*"
        update-types:
          - "minor"
          - "patch"
    open-pull-requests-limit: 10

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    commit-message:
      prefix: "chore(deps)"
    groups:
      actions:
        patterns:
          - "*"
```

---

## Phase 4: Root README.md

#### `README.md`

````markdown
# Hyperhive

A provider-agnostic LLM Agent SDK wrapper library for building AI-powered applications.

[![CI](https://github.com/Hypergamed/Hyperhive/actions/workflows/ci.yml/badge.svg)](https://github.com/Hypergamed/Hyperhive/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@hyperhive/colony.svg)](https://www.npmjs.com/package/@hyperhive/colony)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Nomenclature

Hyperhive uses bee-inspired naming:

| Term         | Meaning                                                                |
| ------------ | ---------------------------------------------------------------------- |
| **AIColony** | The colony controller - manages all drones across providers            |
| **Drone**    | Autonomous agent that executes tasks (e.g., `claudeDrone`, `gptDrone`) |
| **buzz()**   | How drones communicate - sending prompts to the LLM                    |

## Packages

| Package                                                 | Description    | npm                                                                                                                           |
| ------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [@hyperhive/colony](./packages/colony)                  | Core library   | [![npm](https://img.shields.io/npm/v/@hyperhive/colony.svg)](https://www.npmjs.com/package/@hyperhive/colony)                 |
| [@hyperhive/plugin-fastify](./packages/plugins/fastify) | Fastify plugin | [![npm](https://img.shields.io/npm/v/@hyperhive/plugin-fastify.svg)](https://www.npmjs.com/package/@hyperhive/plugin-fastify) |

## Quick Start

### Installation

```bash
# Core library
npm install @hyperhive/colony

# With Fastify
npm install @hyperhive/colony @hyperhive/plugin-fastify fastify
```
````

### Basic Usage

```typescript
import { AIColony } from "@hyperhive/colony";

// Create the colony controller
const colony = new AIColony({
  apiKey: process.env.ANTHROPIC_API_KEY,
  provider: "claude",
});

// Hatch a Drone (create LLM session)
const claudeDrone = await colony.hatch({
  cwd: "/path/to/project",
});

// Listen to messages
claudeDrone.on("message", (msg) => {
  console.log("AI:", msg.content);
});

// Send a prompt with buzz()
await claudeDrone.buzz("Fix the authentication bug");
```

### Fastify Integration

```typescript
import Fastify from "fastify";
import { colonyPlugin } from "@hyperhive/plugin-fastify";

const app = Fastify();

await app.register(colonyPlugin, {
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Access via app.colony
const drone = await app.colony.hatch({ cwd: "/project" });

await app.listen({ port: 3000 });
```

## Development

### Prerequisites

- Node.js 22+
- pnpm 9+

### Setup

```bash
# Clone repository
git clone https://github.com/Hypergamed/Hyperhive.git
cd Hyperhive

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Scripts

| Script           | Description                       |
| ---------------- | --------------------------------- |
| `pnpm build`     | Build all packages                |
| `pnpm test`      | Run all tests                     |
| `pnpm lint`      | Lint all packages                 |
| `pnpm format`    | Format code with Prettier         |
| `pnpm typecheck` | Run TypeScript type checking      |
| `pnpm changeset` | Create a changeset for versioning |

### Creating a Changeset

When making changes that should be released:

```bash
pnpm changeset
```

Follow the prompts to:

1. Select changed packages
2. Choose version bump type (major/minor/patch)
3. Write a summary of changes

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `chore:` Maintenance tasks
- `refactor:` Code refactoring
- `test:` Test additions/changes

## License

MIT

````

---

## Phase 5: Implementation Commands

### Step 1: Create Directory and Initialize

```bash
# Create project directory
mkdir -p ~/Projects/Hyperhive
cd ~/Projects/Hyperhive

# Initialize git
git init
````

### Step 2: Create All Files

Claude Code should create all files listed in Phase 2 with their exact contents.

### Step 3: Install Dependencies

```bash
# Install pnpm if not already installed
npm install -g pnpm@9

# Install dependencies
pnpm install

# Initialize Husky
pnpm prepare

# Make hooks executable
chmod +x .husky/pre-commit .husky/commit-msg
```

### Step 4: Verify Setup

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Check linting
pnpm lint

# Check formatting
pnpm format:check

# Type check
pnpm typecheck
```

### Step 5: Initial Commit and Push

```bash
# Stage all files
git add .

# Create initial commit
git commit -m "chore: initial monorepo setup

- Add @hyperhive/colony package with AIColony and Drone classes
- Add @hyperhive/plugin-fastify integration package
- Configure Turborepo with Vercel remote cache
- Configure Changesets for independent versioning
- Add CI/CD workflows
- Add code quality tools (ESLint, Prettier, Husky)"

# Add remote (replace with your values)
git remote add origin https://github.com/[YOUR_ORG]/[YOUR_REPO].git

# Push
git push -u origin main
```

---

## Phase 6: Post-Setup Verification Checklist

### Local Verification

- [ ] `pnpm install` completes without errors
- [ ] `pnpm build` builds all packages
- [ ] `pnpm test` runs all tests successfully
- [ ] `pnpm lint` passes without errors
- [ ] `pnpm format:check` passes without errors
- [ ] `pnpm typecheck` passes without errors

### CI Verification (after push)

- [ ] CI workflow runs and passes on main branch
- [ ] Create a test PR and verify:
  - [ ] CI runs on PR
  - [ ] PR validation runs
  - [ ] CodeQL analysis runs
  - [ ] Dependency review runs

### Remote Cache Verification

1. Run `pnpm build` twice
2. Second run should show cache hits from Vercel
3. Check Vercel dashboard for cache activity

### Release Verification

1. Create a test changeset:

   ```bash
   pnpm changeset
   # Select @hyperhive/colony
   # Choose "patch"
   # Enter: "test release setup"
   ```

2. Commit and push:

   ```bash
   git add .
   git commit -m "chore: add test changeset"
   git push
   ```

3. Verify release workflow:
   - [ ] Creates "Version Packages" PR automatically
   - [ ] PR contains version bumps and changelog updates

4. Merge the PR and verify:
   - [ ] Packages publish to npm
   - [ ] npm packages show provenance badge

---

## Troubleshooting

### Issue: pnpm install fails with peer dependency errors

**Solution**: The `.npmrc` has `strict-peer-dependencies=false`. If still failing, check Node.js version (must be 22+).

### Issue: Husky hooks not running

**Solution**:

```bash
pnpm prepare
chmod +x .husky/pre-commit .husky/commit-msg
```

### Issue: Turborepo remote cache not working

**Verify**:

1. `TURBO_TOKEN` and `TURBO_TEAM` are set correctly
2. Run with verbose: `pnpm build --verbosity=2`
3. Check Vercel dashboard for token activity

### Issue: GitHub App token not working

**Verify**:

1. App is installed on the repository
2. `RELEASE_APP_ID` matches the App ID exactly
3. `RELEASE_APP_PRIVATE_KEY` includes full PEM content with BEGIN/END lines
4. App has correct permissions (Contents: write, Pull requests: write)

### Issue: npm OIDC publishing fails

**Verify**:

1. Trusted publisher configured on npm with exact values:
   - Owner: Your GitHub org
   - Repository: Your repo name
   - Workflow: `release.yml`
   - Environment: `npm-publish`
2. Environment `npm-publish` exists in GitHub repo settings
3. Workflow has `id-token: write` permission

### Issue: Tests fail with "Cannot find module"

**Solution**: Ensure build runs before test:

```bash
pnpm build && pnpm test
```

---

## File Checklist

Use this to verify all files are created:

### Root (13 files)

- [ ] `package.json`
- [ ] `pnpm-workspace.yaml`
- [ ] `turbo.json`
- [ ] `.npmrc`
- [ ] `.nvmrc`
- [ ] `tsconfig.json`
- [ ] `eslint.config.js`
- [ ] `.prettierrc`
- [ ] `.prettierignore`
- [ ] `.gitignore`
- [ ] `commitlint.config.js`
- [ ] `lint-staged.config.js`
- [ ] `README.md`

### Changesets (2 files)

- [ ] `.changeset/config.json`
- [ ] `.changeset/README.md`

### Husky (2 files)

- [ ] `.husky/pre-commit`
- [ ] `.husky/commit-msg`

### TypeScript Config (3 files)

- [ ] `packages/configs/typescript/package.json`
- [ ] `packages/configs/typescript/base.json`
- [ ] `packages/configs/typescript/library.json`

### ESLint Config (2 files)

- [ ] `packages/configs/eslint/package.json`
- [ ] `packages/configs/eslint/base.js`

### Colony Package (11 files)

- [ ] `packages/colony/package.json`
- [ ] `packages/colony/tsconfig.json`
- [ ] `packages/colony/tsup.config.ts`
- [ ] `packages/colony/vitest.config.ts`
- [ ] `packages/colony/src/types.ts`
- [ ] `packages/colony/src/colony.ts`
- [ ] `packages/colony/src/drone.ts`
- [ ] `packages/colony/src/index.ts`
- [ ] `packages/colony/tests/colony.test.ts`
- [ ] `packages/colony/tests/drone.test.ts`
- [ ] `packages/colony/README.md`

### Fastify Plugin Package (8 files)

- [ ] `packages/plugins/fastify/package.json`
- [ ] `packages/plugins/fastify/tsconfig.json`
- [ ] `packages/plugins/fastify/tsup.config.ts`
- [ ] `packages/plugins/fastify/vitest.config.ts`
- [ ] `packages/plugins/fastify/src/plugin.ts`
- [ ] `packages/plugins/fastify/src/index.ts`
- [ ] `packages/plugins/fastify/tests/plugin.test.ts`
- [ ] `packages/plugins/fastify/README.md`

### GitHub Workflows (5 files)

- [ ] `.github/workflows/ci.yml`
- [ ] `.github/workflows/release.yml`
- [ ] `.github/workflows/pr-validation.yml`
- [ ] `.github/workflows/codeql.yml`
- [ ] `.github/workflows/dependency-review.yml`

### GitHub Config (1 file)

- [ ] `.github/dependabot.yml`

**Total: ~47 files**

---

## Notes for Claude Code Implementation

When implementing this setup:

1. **Create files in order**: Start with root configs, then shared config packages, then colony package, then fastify plugin, then workflows.

2. **Use workspace protocol**: Internal dependencies use `workspace:*` which pnpm converts to actual versions on publish.

3. **Catalog references**: Dev dependencies use `catalog:` to reference versions from `pnpm-workspace.yaml`.

4. **File permissions**: After creating Husky hooks, run `chmod +x` to make them executable.

5. **Don't skip tests**: Run verification commands after each major section to catch issues early.

6. **Package paths**: Note the structure with plural folder names and singular package prefixes:
   - `packages/colony/` → `@hyperhive/colony`
   - `packages/plugins/fastify/` → `@hyperhive/plugin-fastify`
   - `packages/storages/redis/` → `@hyperhive/storage-redis`
   - `packages/configs/eslint/` → `@hyperhive/config-eslint`

---

_Document generated for Hyperhive monorepo setup. Last updated: December 2024._
