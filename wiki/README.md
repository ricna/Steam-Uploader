# Wiki source

These markdown files are the source for the **GitHub Wiki** at
https://github.com/ricna/Steam-Uploader/wiki

GitHub Wikis are stored in a separate Git repository
(`https://github.com/ricna/Steam-Uploader.wiki.git`). To publish updates:

```bash
# One-time setup
git clone https://github.com/ricna/Steam-Uploader.wiki.git wiki-repo
cd wiki-repo

# To update
cp ../Steam-Uploader/wiki/*.md .
git add .
git commit -m "Update wiki"
git push
```

The first push must be a manual page created via the GitHub web UI — once a
single page exists, the wiki repo becomes pushable.

| File             | Wiki page              |
|------------------|------------------------|
| `Home.md`        | Home (landing page)    |
| `User-Guide.md`  | User Guide             |
| `Why-Steam-Uploader.md` | Why Steam Uploader |
| `Comparison-vs-SteamPipeGUI.md` | Comparison vs SteamPipeGUI |
| `Architecture-Overview.md` | Architecture Overview |
| `Troubleshooting.md` | Troubleshooting   |
| `FAQ.md`         | FAQ                    |
| `_Sidebar.md`    | Sidebar (right-rail nav) |
