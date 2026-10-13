"""Consistent SQLite snapshots suitable for subsequent encrypted archive handling."""
import sqlite3
from pathlib import Path

def snapshot(source: str, destination: str) -> None:
    src = Path(source).resolve()
    dst = Path(destination).resolve()
    if src == dst or not src.is_file() or dst.exists():
        raise ValueError("Source must exist; destination must be new and different")
    dst.parent.mkdir(parents=True, exist_ok=True)
    try:
        with sqlite3.connect(str(src)) as origin:
            with sqlite3.connect(str(dst)) as target:
                origin.backup(target)
                integrity = target.execute("PRAGMA integrity_check").fetchone()[0]
                if integrity != "ok":
                    raise RuntimeError("Backup integrity check failed")
    except Exception:
        dst.unlink(missing_ok=True)
        raise
