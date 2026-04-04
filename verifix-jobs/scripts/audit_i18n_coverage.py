from __future__ import annotations

from collections import Counter
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
WEB_ROOT = ROOT / "verifix-jobs-web" / "src" / "app"
TRANSLATION_FILES = [
    WEB_ROOT / "core" / "services" / "web-translations.shared.ts",
    WEB_ROOT / "core" / "services" / "web-translations.public.ts",
    WEB_ROOT / "core" / "services" / "web-translations.employer.ts",
    WEB_ROOT / "core" / "services" / "web-translations.admin.ts",
    WEB_ROOT / "core" / "services" / "web-translations.multilang.ts",
    WEB_ROOT / "core" / "services" / "web-translations.recruitment.ts",
]
LANGS = ("uz_lat", "uz_cyr", "ru", "en", "kk", "tg", "ky")


def explicit_coverage(path: Path) -> tuple[int, Counter[str]]:
    text = path.read_text(encoding="utf-8")
    rows = re.findall(r"'([^']+)':\s*\{([^}]*)\}", text, flags=re.S)
    missing = Counter()
    for _, body in rows:
        for lang in LANGS:
            if re.search(rf"\b{lang}\s*:", body) is None:
                missing[lang] += 1
    return len(rows), missing


def feature_key_usage(feature_dir: Path) -> Counter[str]:
    usage: Counter[str] = Counter()
    for path in sorted(feature_dir.rglob("*.ts")):
        text = path.read_text(encoding="utf-8")
        for key in re.findall(r"i18n\.t\('([^']+)'\)", text):
            usage[key] += 1
    return usage


def main() -> None:
    print("Translation catalog coverage")
    print("============================")
    for path in TRANSLATION_FILES:
        total, missing = explicit_coverage(path)
        summary = ", ".join(f"{lang}: {missing[lang]}" for lang in LANGS)
        print(f"{path.name}: rows={total}; missing explicit -> {summary}")

    print()
    print("Admin key usage")
    print("===============")
    admin_usage = feature_key_usage(WEB_ROOT / "features" / "admin")
    for key in sorted(admin_usage):
        print(f"{key}: {admin_usage[key]}")


if __name__ == "__main__":
    main()
