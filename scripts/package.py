"""Package reproducible source and the self-contained static deployment."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from shutil import copyfile

root = Path(__file__).resolve().parents[1]
out = root.parent
excluded = {"node_modules", "dist", "test-results", ".git"}

with ZipFile(out / "vim-workshop-source.zip", "w", ZIP_DEFLATED) as archive:
    for file in sorted(root.rglob("*")):
        relative = file.relative_to(root)
        if not file.is_file() or any(part in excluded for part in relative.parts):
            continue
        if file.suffix == ".tsbuildinfo" or relative.parts[:2] == ("public", "vendor"):
            continue
        if str(relative).replace("\\", "/") == "public/coi-serviceworker.js":
            continue
        archive.write(file, Path("vim-workshop") / relative)

with ZipFile(out / "vim-workshop-static.zip", "w", ZIP_DEFLATED) as archive:
    for file in sorted((root / "dist").rglob("*")):
        if file.is_file():
            archive.write(file, file.relative_to(root / "dist"))

# Preserve earlier download links as aliases to the current build.
copyfile(out / "vim-workshop-source.zip", out / "between-lines-source.zip")
copyfile(out / "vim-workshop-static.zip", out / "between-lines-static.zip")
print("Created vim-workshop-source.zip and vim-workshop-static.zip")
