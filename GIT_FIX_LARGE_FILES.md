# Fix "File exceeds GitHub's 100 MB limit" (node_modules)

`node_modules` (including `electron.exe` ~168 MB) was committed by mistake. It’s now **untracked** (and in `.gitignore`), but **old commits still contain it**, so GitHub will reject the push until you remove it from history.

Run **one** of the options below in **Git Bash** or **PowerShell** from the FlipIt folder. Then force-push.

---

## Option A: Remove `node_modules` from all history (Git)

In **Git Bash** (not PowerShell) from the project folder:

```bash
git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch node_modules" --prune-empty HEAD
```

Then force-push (rewrites remote history):

```bash
git push origin main --force
```

---

## Option B: Fresh history (no old commits)

If you don’t need to keep existing commit history:

1. Create a new branch with no history:
   ```bash
   git checkout --orphan temp
   git add -A
   git commit -m "Initial commit (no node_modules)"
   git branch -D main
   git branch -m main
   ```

2. Force-push:
   ```bash
   git push origin main --force
   ```

---

## Option C: BFG Repo-Cleaner

1. Download [BFG](https://rtyley.github.io/bfg-repo-cleaner/).
2. In Git Bash:
   ```bash
   java -jar bfg.jar --delete-folders node_modules
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   git push origin main --force
   ```

---

After any option, `node_modules` will no longer be in history and push should succeed. **Option B** is simplest if you’re fine losing old commits.
