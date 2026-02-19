# Fix "repository not found" and publish

The remote is set to **https://github.com/Marsel/FlipIt.git**. "Repository not found" means that repo doesn’t exist on GitHub yet, or the username/repo name is wrong.

---

## Step 1: Create the repo on GitHub

1. Open **https://github.com/new** in your browser and sign in.
2. **Repository name:** type **FlipIt** (or another name you want).
3. Leave **Public** selected.
4. **Do not** check "Add a README", ".gitignore", or "License" — leave the repo empty.
5. Click **Create repository**.

GitHub will show a page with a URL like `https://github.com/YOUR_USERNAME/FlipIt` — that’s your repo.

---

## Step 2: Point Git at your repo

In a terminal, from the FlipIt project folder, set the remote to **your** repo (use the URL from Step 1):

```bash
cd c:\Users\teren\Documents\projects\apps\FlipIt

git remote set-url origin https://github.com/YOUR_USERNAME/FlipIt.git
```

Replace **YOUR_USERNAME** with your real GitHub username (e.g. if your profile is `github.com/teren`, use `teren`).

---

## Step 3: Push

```bash
git push -u origin main
```

If it asks for login, use your GitHub username and a **Personal Access Token** (not your password). To create one: GitHub → **Settings → Developer settings → Personal access tokens**.

---

## If you still get "repository not found"

- Confirm the repo exists: open **https://github.com/YOUR_USERNAME/FlipIt** in a browser (with your username). You should see the repo (it can be empty).
- Confirm the remote URL:
  ```bash
  git remote -v
  ```
  The second line should be `https://github.com/YOUR_USERNAME/FlipIt.git` with your username.
- If your repo has a **different name** (e.g. `flipit-app`), use that in the URL:
  ```bash
  git remote set-url origin https://github.com/YOUR_USERNAME/flipit-app.git
  ```
