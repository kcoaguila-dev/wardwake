# Contributing to Wardwake

Thank you for contributing to **Wardwake**! This repository follows strict Clean Architecture principles and automated testing pipelines.

---

## 🛠️ Development Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/kcoaguila-dev/wardwake.git
   cd wardwake
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to test live changes.

---

## 🧪 Testing Guidelines

Before committing any changes or opening a Pull Request, ensure all tests pass:

```bash
# 1. Type check
npx tsc --noEmit

# 2. Unit tests (Domain & Application logic)
npm test

# 3. End-to-End browser tests (Presentation & UI)
npm run test:e2e

# 4. Production build check
npm run build
```

---

## 🌿 Git & Pull Request Guidelines

1. **Branch Naming**:
   - `feature/<feature-name>-<task-id>` for new features.
   - `fix/<bug-name>` for bug fixes.
   - `refactor/<scope>` for structural code refactors.

2. **Commit Convention**:
   Use [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add fog of war tile lighting`
   - `fix: resolve health bar positioning on unit attack`
   - `test: add E2E test for combat forecasting`
   - `docs: update game design document roadmap`

3. **PR Review Checklist**:
   - [ ] Clean Architecture boundaries preserved (no Phaser imports in Domain).
   - [ ] No regression in unit test suites (`npm test`).
   - [ ] E2E browser tests pass (`npm run test:e2e`).
   - [ ] Visual elements encapsulated in `Phaser.GameObjects.Container`.
