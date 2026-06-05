from pathlib import Path
import re

from pypdf import PdfReader


PDF_PATH = Path("FWC2026_regulations_EN.pdf")
OUTPUT_PATH = Path("frontend/src/lib/world-cup-annex-c.ts")
HEADERS = ["1A", "1B", "1D", "1E", "1G", "1I", "1K", "1L"]


def main() -> None:
    reader = PdfReader(PDF_PATH)
    rows: list[tuple[int, list[str]]] = []

    for page_index in range(79, 97):
        text = reader.pages[page_index].extract_text() or ""
        for line in text.splitlines():
            match = re.match(r"^\s*(\d{1,3})\s+((?:3[A-L]\s+){7}3[A-L])\s*$", line)
            if match:
                rows.append((int(match.group(1)), match.group(2).split()))

    if len(rows) != 495:
        raise SystemExit(f"expected 495 Annex C rows, got {len(rows)}")

    seen: set[str] = set()
    lines = [
        "// Generated from FIFA World Cup 26 Regulations, Annexe C, May 2026.",
        "import type { GroupLetter, ThirdPlaceHostSlot } from './world-cup-simulator-types'",
        "",
        "export const ANNEX_C_SOURCE = {",
        "  title: 'Regulations for the FIFA World Cup 26, Annexe C',",
        "  url: 'https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf',",
        "  published: 'May 2026',",
        "} as const",
        "",
        "export const ANNEX_C_THIRD_PLACE_ALLOCATIONS: Record<string, Record<ThirdPlaceHostSlot, GroupLetter>> = {",
    ]

    for _option, values in rows:
        groups = "".join(sorted(value[1] for value in values))
        if groups in seen:
            raise SystemExit(f"duplicate Annex C combination {groups}")
        seen.add(groups)
        entries = ", ".join(f"'{header}': '{value[1]}'" for header, value in zip(HEADERS, values, strict=True))
        lines.append(f"  '{groups}': {{ {entries} }},")

    lines.extend(["}", ""])
    OUTPUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"generated {len(rows)} Annex C rows")


if __name__ == "__main__":
    main()
