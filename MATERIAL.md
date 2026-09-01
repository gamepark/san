# San — Game material

Reference for the physical components of San and how they map to the images in `app/src/images`.

Images hold **one file per design**, not per physical component: the 82 printed cards boil down to
51 images. The number of copies is therefore *not* readable from the file tree and must come from
`SanSetup`. This document is the source of truth for it.

## Cards — 82 in total

All 82 cards share the same back: `cards/CardBack.jpg`.

| Image | Copies | Total |
|-------|--------|-------|
| `cards/start/{Moon,Star}{Propaganda,Hacking,Corruption,Equipment}.jpg` | 3 each | 24 (12 per Corporation) |
| `cards/virus/{Moon,Star}Virus1..5.jpg` | 1 each | 10 (5 per Corporation) |
| `cards/river/Propaganda1..5.jpg` | 2 each | 10 |
| `cards/river/Hacking1..5.jpg` | 2 each | 10 |
| `cards/river/Corruption1..5.jpg` | 2 each | 10 |
| `cards/river/Equipment1..18.jpg` | 1 each | 18 |

The 48 River cards are the last four rows. Each Corporation starts with the 12 cards of its colour
plus its 5 Virus cards.

Colour ↔ type: **blue = Propaganda**, **red = Hacking**, **yellow = Corruption**, **grey = Equipment**.
Corporation: `Moon` = crescent, `Star` = star (see `rules/src/Corporation.ts`).

Virus cards are named after the number printed on them, which is the count of remaining viruses
(`Virus5` sits on top of the pile at setup, `Virus1` at the bottom).

## Punchboard

| Image | Copies |
|-------|--------|
| `tokens/MoonHandBonus.png`, `tokens/StarHandBonus.png` | 2 each (4 Hand Bonus tokens) |
| `pawns/MoonBanner.png`, `pawns/StarBanner.png` | 1 each |
| `pawns/VirusPawn.png` | 1 |
| `tiles/CentralPort.png` | 1 |

The punchboard also holds 6 standee bases; they are not digitised.

## Mapping to the printed card number

Every printed card carries a number (1-82) in its bottom-right corner. It has no gameplay use — the
rulebook only labels it in the card anatomy — so it was removed from the images, which is what lets
identical cards share a single file. The number remains the easiest way to point at a card in the
production PDFs or in the rulebook diagrams:

| Printed number | Image |
|-----|-----|
| 1-3 / 4-6 / 7-9 / 10-12 | `start/Moon` Propaganda / Hacking / Corruption / Equipment |
| 13-17 | `virus/MoonVirus` 5 → 1 (decreasing) |
| 18-20 / 21-23 / 24-26 / 27-29 | `start/Star` Propaganda / Hacking / Corruption / Equipment |
| 30-34 | `virus/StarVirus` 5 → 1 |
| 35-44 | `river/Propaganda1..5` (consecutive pairs) |
| 45-54 | `river/Hacking1..5` (consecutive pairs) |
| 55-64 | `river/Corruption1..5` (consecutive pairs) |
| 65-82 | `river/Equipment1..18` |

## How the images were produced

Sources are the production PDFs in `kDrive/Licences/Blue Cocker/San/fichiers prod/` — not the
marketing PNGs, which are 3D renders. Tools: `pdftoppm` (poppler), ImageMagick, `pikepdf`.

- **Scale**: rendered at **254 dpi**, so 100 px = 1 cm everywhere.
- **Cards**: cropped to the PDF TrimBox (`pdftoppm -r 254 -x 83 -y 83 -W 630 -H 880`) → 63×88 mm =
  630×880 px. Card fronts have a printed white border (the artwork itself is 57×83 mm); that is by
  design, not a cropping mistake. The back is full-bleed.
- **Card number removal**: the number was the *only* text in the PDF (everything else is raster), so
  it was dropped at the PDF level by removing the `BT…ET` blocks with `pikepdf`, then rendered. No
  pixel retouching. Copies of a same design then match bit for bit.
- **Punchboard**: masks obtained by labelling the connected components of
  `PUNCHBOARD_SAN_DIECUT.pdf` (the die-cut paths), dilated by 2 px, applied as alpha over
  `PUNCHBOARD_SAN_RECTO.pdf`.
- **PNG shadow**: black, no offset, `-blur 0x18` then alpha ×2.5, with 60 px of transparent margin
  added on every side. The piece stays centred, so its real size is the image size minus 1.2 cm on
  each axis (e.g. `CentralPort.png` is 960×400 px for an 84×28 mm tile).
- **Formats**: `.jpg` q92 4:4:4 for cards, `.png` with alpha for punchboard pieces.

The French rulebook shipped in `app/public/rules-fr.pdf` has an extractable text layer
(`pdftotext -layout`); it is the reference for the rules and the component list.
