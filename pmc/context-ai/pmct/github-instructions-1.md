## Push a new repository

### Step-by-Step Instructions: Local Repository → New GitHub Repository
https://github.com/jamesjordanmarketing/br-kombai-7.git


#### Step 1: Prepare Your Local Repository
```bash
# Navigate to your project folder in VS Code terminal
cd your-project-folder

# Initialize git if not already done
git init

# Check status of files
git status
```

#### Step 2: Stage and Commit Your Files
```bash
# Add all files to staging
git add .

# Or add specific files
git add filename.txt

# Commit your changes
git commit -m "Initial commit"
```

#### Step 3: Create New Repository on GitHub
1. Go to [GitHub.com](https://github.com)
2. Click the "+" icon in top right corner
3. Select "New repository"
4. Enter repository name (should match your local folder name)
5. Choose public or private
6. **DO NOT** initialize with README, .gitignore, or license (since you already have local files)
7. Click "Create repository"

#### Step 4: Connect Local Repository to GitHub
```bash
# Add the remote origin (replace with your actual GitHub URL)
git remote add origin https://github.com/jamesjordanmarketing/train-data.git

# Verify the remote was added
git remote -v
```

#### Step 5: Push to GitHub
```bash
# Push your code to GitHub (first time)
git push -u origin main

# Or if your default branch is master
git push -u origin master
```

#### Step 6: Verify Upload
1. Refresh your GitHub repository page
2. You should see all your files uploaded
3. Your local VS Code is now connected to GitHub

#### Future Pushes (After Initial Setup)
```bash
git add .
git commit -m "Your commit message"
git push
```

#### Troubleshooting:
- **Authentication Error**: You may need to use a Personal Access Token instead of password
- **Branch Name Issues**: Check if your default branch is `main` or `master` with `git branch`
- **Remote Already Exists**: Use `git remote set-url origin https://github.com/yourusername/your-repo-name.git`


## Push to existing repository
git status

git add -A
git commit -m "Added About page and updated index"
git push

git add -A
git commit -m "Last night checkin-wireframes 1. done"
git push --force

## Pulling Changes from GitHub Repository

**Basic pull (most common):**
```bash
git pull
```

**Pull from specific remote and branch:**
```bash
git pull origin main
```
(Replace `main` with your branch name if different, could be `master`)

**Pull with rebase (cleaner history):**
```bash
git pull --rebase
```

**Force pull (overwrites local changes - use with caution):**
```bash
git fetch origin
git reset --hard origin/main
```

## Complete Workflow:
1. Check current status: `git status`
2. Commit any local changes first: `git add . && git commit -m "Save local changes"`
3. Pull latest changes: `git pull`
4. Resolve any merge conflicts if they occur

## Troubleshooting:
- If you have uncommitted changes, git will ask you to commit or stash them first
- Use `git stash` to temporarily save changes, then `git stash pop` after pulling
- Check your remote with: `git remote -v`