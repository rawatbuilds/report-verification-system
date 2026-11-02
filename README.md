# Report Verification System

A web tool for checking whether two Excel/CSV reports actually say the same thing. Upload a **reference** report (the known-good baseline) and a **current** report (the one you want to verify), and it tells you which columns, rows and cells differ — then hands you colour-coded Excel files you can triage from.

Built for the classic QA problem of validating report output after a code change, a data migration, or a move from one reporting system to another, without eyeballing two spreadsheets side by side.

![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.118-009688?logo=fastapi&logoColor=white)
![pandas](https://img.shields.io/badge/pandas-2.3-150458?logo=pandas&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)

---

## What it does

The app has two tools, each on its own page.

### 1. Column Validator — `/`

Checks that the *structure* of the current report matches the reference.

| Check | What gets flagged |
|---|---|
| Missing columns | Present in reference, absent in current |
| Extra columns | Present in current, absent in reference |
| Case differences | `Revenue` vs `revenue` |
| Sequence errors | Column exists in both, but at a different position |

You get a pass/fail verdict, a summary (total, matching, missing, extra, out-of-order) and an itemised error list, exportable as **JSON, CSV or PDF**.

### 2. Report Difference Analyzer — `/analyzer`

Compares the *data* row by row and cell by cell.

1. **Column gate** – headers are normalised (trimmed, lower-cased, BOM / zero-width characters removed, whitespace collapsed). If columns still don't line up, the analysis stops and reports the missing/extra columns.
2. **Cell normalisation** – unless *strict mode* is on, whitespace is collapsed and numbers are normalised, so `4219.0`, `4219` and ` 4219 ` all compare equal.
3. **Row matching** – no primary key needed. Rows are paired by:
   - **exact match** first, then
   - **closest match** – an unmatched reference row is paired with the current-report row that agrees on the most cells, as long as at least **70%** of columns match.
4. **Classification**
   - **Missing rows** – reference rows with no match in the current report
   - **Extra rows** – current-report rows with no match in the reference
   - **Cell mismatches** – matched row pairs where one or more cells differ
5. **Output** – summary counts on screen, plus up to three downloadable Excel files:

| File | Contents |
|---|---|
| `missing_rows.xlsx` | Unmatched reference rows, with their original Excel row number |
| `extra_rows.xlsx` | Unmatched current rows, with their original Excel row number |
| `mismatched_rows.xlsx` | Each mismatched pair as a REFERENCE row + MAIN row, differing cells in **red**, matching cells in **green** |

A progress endpoint lets the UI show live status during long comparisons.

### File handling (both tools)

- Formats: **.xlsx, .xls, .csv** (UI limit 10 MB per file)
- **Multi-sheet workbooks** – pick which sheet to compare on each side
- **Header auto-detection** – uses the first non-empty row within the first 5, so title rows above the header don't break things
- Formulas are read as their **computed values**
- CSV **encoding detection** (UTF-8, UTF-8-BOM, Latin-1, CP1252) and **delimiter sniffing**
- Uploaded/generated files older than **24 hours** are cleaned up automatically

---

## Tech stack

| Layer | Tools |
|---|---|
| Backend | Python, FastAPI, Uvicorn |
| Data processing | pandas, NumPy, openpyxl, xlrd, chardet / charset-normalizer |
| Frontend | React 19, Vite 7, React Router, Tailwind CSS |
| UI / export | lucide-react, SweetAlert2, jsPDF + jspdf-autotable, axios |

---

## Project structure

```
report-verification-system/
├── backend/
│   ├── main.py                        # FastAPI app, CORS, router registration
│   ├── column_validator.py            # Column Validator endpoints
│   ├── report_difference_analyzer.py  # Row/cell comparison engine + downloads
│   └── uploads/                       # Working dir for uploads & generated reports
├── frontend/
│   ├── src/
│   │   ├── main.jsx                   # Routes: "/" and "/analyzer"
│   │   ├── App.jsx                    # Column Validator page
│   │   ├── pages/ReportDifferenceAnalyzer.jsx
│   │   ├── components/                # FileUpload, SheetSelector, results, export…
│   │   ├── services/  utils/  hooks/  config/  constants/
│   ├── .env                           # VITE_API_BASE_URL
│   └── vite.config.js                 # Dev server on :3000
└── requirement.txt                    # Python dependencies
```

---

## Getting started

### Prerequisites

- Python 3.10+ (developed on 3.12)
- Node.js 18+ and npm

### 1. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r ../requirement.txt
uvicorn main:app --reload
```

The API runs at **http://127.0.0.1:8000**. Interactive API docs: **http://127.0.0.1:8000/docs**.

> Run `uvicorn` from inside `backend/` — the `uploads/` folder is resolved relative to the working directory.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI opens at **http://localhost:3000**.

**Windows shortcut:** once the backend venv exists, `npm run start:all` from `frontend/` starts both servers together.

### Configuration

| Setting | Where | Default |
|---|---|---|
| API base URL | `frontend/.env` → `VITE_API_BASE_URL` | `http://127.0.0.1:8000` |
| Production API URL | `frontend/.env.production` | placeholder — set before building |
| File retention | `FILE_RETENTION_HOURS` in `report_difference_analyzer.py` | 24 hours |
| Close-match threshold | `similarity_threshold` in `report_difference_analyzer.py` | 70% of columns |

---

## How to use

**Column check**
1. Open `http://localhost:3000/`.
2. Upload the reference report (choose a sheet if it has several).
3. Upload the current report and pick its sheet.
4. Review the result; export as JSON / CSV / PDF if needed.

**Data comparison**
1. Open `http://localhost:3000/analyzer`.
2. Upload the reference and current reports, choosing sheets as needed.
3. Leave strict mode off to ignore formatting noise, or turn it on for exact string matching.
4. Run the analysis, check the summary, and download the missing / extra / mismatched files.

---

## API reference

All endpoints accept `multipart/form-data` for file uploads.

### Column Validator — `/column-validator`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload-reference/` | Upload reference file (`file`); returns columns and sheet list |
| POST | `/change-sheet/?sheet_name=` | Re-read reference columns from a different sheet |
| POST | `/detect-sheets/` | List sheets in an uploaded workbook (`file`) |
| POST | `/compare-reports/` | Compare `reference` and `current` files; optional `reference_sheet`, `current_sheet` form fields |
| GET | `/download-result/` | Download the last comparison as JSON |

### Report Difference Analyzer — `/report-difference-analyzer`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/sheets/` | List sheets in an uploaded workbook (`file`) |
| POST | `/analyze/` | Compare `reference` and `main` files. Query params: `ref_sheet`, `main_sheet`, `strict_mode` (default `false`) |
| GET | `/progress` | Current analysis phase and percentage |
| GET | `/download-missing/?session=` | Missing-rows Excel file |
| GET | `/download-extra/?session=` | Extra-rows Excel file |
| GET | `/download-mismatched/?session=` | Colour-coded mismatch Excel file |
| POST | `/debug/` | Return a normalised sample of both files for troubleshooting |

`session` is the ID returned by `/analyze/`; use `latest` (the default) for the most recent run.

**Example**

```bash
curl -X POST "http://127.0.0.1:8000/report-difference-analyzer/analyze/?strict_mode=false" \
  -F "reference=@baseline.xlsx" \
  -F "main=@new_report.xlsx"
```

```json
{
  "status": "success",
  "session": "6a286cae",
  "rowsCompared": 1250,
  "sharedColumns": 14,
  "matchedRows": 1243,
  "missingRows": 7,
  "extraRows": 3,
  "cellMismatches": 12,
  "missingPath": "missing_6a286cae.xlsx",
  "extraPath": "extra_6a286cae.xlsx",
  "mismatchPath": "mismatch_6a286cae.xlsx"
}
```

---

## Known limitations

- **Row matching is pairwise**, so comparison time grows quadratically. It's comfortable for typical report sizes (a few thousand rows); very large files will be slow.
- **Duplicate rows are collapsed** before comparison, so a row that appears twice in one report and once in the other isn't reported as a difference.
- **Single-user state** – progress and the last column-validation result are held in process memory, so concurrent users would overwrite each other's status.
- **Number normalisation only** – dates, percentages and case are compared as text after whitespace cleanup. `01-03-2025` and `2025-03-01` count as different values.
- No authentication; CORS is open to all origins. Intended for local or internal use.

## Roadmap

- Optional primary-key matching for faster, deterministic row pairing on large files
- Date, percentage and numeric-tolerance normalisation rules
- Per-column match statistics in the UI
- Side-by-side visual diff in the browser
- CLI / CI mode so comparisons can run as a pipeline quality gate
- Automated test suite (pytest + Playwright)

---

## Author

**Rajat Singh Rawat** — Senior QA Engineer / SDET
GitHub: [@rawatbuilds](https://github.com/rawatbuilds)
