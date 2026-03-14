
REPORT VERIFICATION SYSTEM
Technical & Functional Reference Document


Document Version	1.0
Prepared By	Rajat Singh Rawat
Date	2025

1. Executive Summary
The Report Verification System (RVS) is a reconciliation tool designed to automate the comparison of any two structured reports at column, row, and cell levels. It ensures structural alignment and data accuracy across any Excel or CSV-based reporting workflow.

RVS was built to replace manual, spreadsheet-based report comparison — a time-consuming and error-prone process. The system provides a structured, automated pipeline that delivers reliable, auditable reconciliation results for any domain or use case.

2. Technology Stack
RVS is built using a Python-centric stack, selected for its robust data-handling capabilities, ecosystem maturity, and ease of integration across file formats commonly used in enterprise reporting environments.

Layer	Technology / Tool	Purpose	Notes
Backend Language	Python 3.x	Core processing engine	Primary language for all parsing and comparison logic
Data Processing	Pandas	DataFrame-based comparison	Handles CSV/XLSX ingestion, normalization, and diff logic
File Parsing – Excel	OpenPyXL / xlrd	XLSX reading and writing	Supports multi-sheet workbooks and cell formatting
File Parsing – CSV	Python csv / Pandas	CSV ingestion	Handles encoding variations and delimiter detection
Numeric Processing	NumPy	Tolerance-based comparison	Precision arithmetic for financial values
Date Handling	Python datetime / dateutil	Date normalization	Parses multiple date formats into ISO standard
Frontend	React.js / HTML + JS	User interface	File upload, primary key selection, result display
API Layer	Flask / FastAPI	REST API endpoints	Connects frontend to backend comparison engine
Report Export	Pandas / OpenPyXL	Output generation	Exports mismatch report to CSV/XLSX
Logging	Python logging module	Audit trail	Captures user, timestamp, file names, and summary stats
Testing	Pytest	Unit and integration tests	Validates comparison logic, edge cases, and error handling

3. System Architecture
The RVS follows a modular, pipeline-based architecture. Each stage is independently testable, configurable, and extensible. The pipeline processes two input reports and produces a structured mismatch report as output.

3.1 Architecture Layers
    • Presentation Layer: React/HTML frontend for file upload, primary key selection, and result visualization.
    • API Layer: REST endpoints (Flask/FastAPI) orchestrate the pipeline and handle request/response lifecycle.
    • Processing Layer: Core Python modules handle parsing, normalization, row matching, and cell comparison.
    • Output Layer: Generates summary dashboards and exportable mismatch reports in CSV/XLSX format.
    • Logging Layer: Captures audit trails for every comparison job — user, timestamp, file names, and outcomes.

4. Full Functionality
The RVS comparison pipeline consists of five sequential stages, each producing validated output consumed by the next stage.

4.1  File Upload & Parsing
    • Accepts CSV and XLSX formats for both Report A (Source) and Report B (Target).
    • Validates file format, size, and header presence before processing.
    • Converts files into standardized in-memory DataFrames.
    • Cleans data: trims whitespace, normalizes character encodings, removes blank rows.
    • Handles corrupted files and malformed rows with structured error messages.

4.2  Column-Level Validation
    • Normalizes column headers: trims whitespace, lowercases, replaces special characters.
    • Identifies missing columns, extra columns, and header mismatches between reports.
    • Detects datatype inconsistencies across equivalent columns.
    • Blocks downstream comparison if critical structural mismatches are found.

4.3  Primary Key–Based Row Matching
    • User selects a primary key column (e.g., ID, Order Number, Employee Code, Transaction ID) via the UI.
    • Performs an inner join on the primary key to align rows across both reports.
    • Identifies rows present only in Report A (missing in Report B) and vice versa.
    • Detects duplicate primary keys and raises structured validation errors.
    • Validates null or empty primary key values before proceeding.

4.4  Cell-Level Comparison Engine
    • Evaluates each cell pair across matched rows and comparable columns.
    • Applies normalization before comparison to eliminate false mismatches.
    • Numeric: removes thousand separators, converts to float, applies configurable rounding and tolerance.
    • Percentage: converts to decimal format and compares post-normalization.
    • Date: standardizes all dates to ISO 8601 (YYYY-MM-DD) before comparison.
    • Null: configurable logic — Null vs Null (match), Null vs 0 (configurable), Null vs Value (mismatch).
    • String: trims whitespace, optional case normalization, special character cleanup.

4.5  Mismatch Reporting & Output Generation
    • Summary Dashboard: Total rows, columns, and cells compared; total matches and mismatches; match percentage.
    • Column-Level Summary: Per-column match percentage and mismatch count.
    • Row-Level Mismatch Report: Primary key, column name, value in Report A, value in Report B, numeric difference.
    • Full mismatch report exportable as CSV or XLSX for downstream analysis.

4.6  Audit Logging
    • Logs every comparison job with: user who initiated it, timestamp, file names, and summary statistics.
    • Supports compliance and traceability requirements.

4.7  Error Handling
    • Structured error responses for: invalid file format, missing primary key, duplicate primary keys, parsing failures, unsupported data types.
    • All errors surfaced with actionable messages to guide user remediation.


5. How It Works — Step-by-Step Walkthrough
This section walks through a complete end-to-end usage of RVS, from uploading files to interpreting the final mismatch report.

Step 1  Step 1:  Upload Your Two Reports
Navigate to the RVS upload screen. You will see two upload zones:
    • Report A — the source or reference report (e.g., the older version, backend-generated file, or baseline data).
    • Report B — the target report to validate against (e.g., the new version, UI-generated file, or updated data).

Supported formats: CSV (.csv)  |  Excel (.xlsx)
File size: Up to the configured row threshold (large datasets supported)

Both files must have column headers in the first row. The system will reject files with missing or malformed headers.

Step 2  Step 2:  Automatic Column Validation
Once both files are uploaded, RVS immediately runs a column-level structural check before any data comparison begins.

Example — Report A headers vs Report B headers:
  Column Structure Check
Column	Report A	Report B	Status
id	✔ Present	✔ Present	Matched
name	✔ Present	✔ Present	Matched
amount	✔ Present	✔ Present	Matched
region	✔ Present	✘ Missing	⚠ Missing in B
created_at	✔ Present	✔ Present	Matched
discount	✘ Missing	✔ Present	⚠ Extra in B

If critical columns are missing, RVS blocks the comparison and displays an actionable error message. Extra columns are flagged but do not block processing.

Step 3  Step 3:  Select the Primary Key
After column validation, you are prompted to select the Primary Key — the column that uniquely identifies each row across both reports.

    • The primary key is used to align rows between Report A and Report B before cell comparison begins.
    • Any column present in both reports can be selected as the primary key.
    • Common examples: ID, Order Number, Product Code, Employee ID, Transaction Reference.

Example: Primary Key selected → 'id'

If duplicate values are found in the selected primary key column, RVS raises a validation error and halts comparison. Null or empty key values are also flagged.

Step 4  Step 4:  Row Matching
RVS performs an inner join on the selected primary key to align rows across both reports. It then identifies:
    • Matched rows — present in both reports, proceed to cell comparison.
    • Rows only in Report A — present in source but missing from target.
    • Rows only in Report B — present in target but not in source.

  Row Matching Result
id	name	Matched?
101	Alice	✔ Matched
102	Bob	✔ Matched
103	Carol	⚠ Only in Report A
104	David	⚠ Only in Report B

Step 5  Step 5:  Cell-Level Comparison
For every matched row, RVS compares each column value between Report A and Report B after applying normalization rules.

  Cell Comparison — Matched Rows
id	Column	Report A Value	Report B Value	Result
101	amount	1,000.00	1000.0	✔ Match (normalized)
101	region	North	north	✔ Match (case normalized)
102	amount	2500.00	2450.00	✘ Mismatch (Δ 50.00)
102	status	Active	Inactive	✘ Mismatch
101	created_at	01-03-2025	2025-03-01	✔ Match (date normalized)

Normalization is applied before comparison — thousand separators, date formats, letter case, and whitespace differences do not cause false mismatches.

Step 6  Step 6:  Review the Output Report
Once comparison is complete, RVS generates a structured output consisting of three views:

  Summary Dashboard
Metric	Value
Total Rows Compared	2
Total Columns Compared	5
Total Cells Compared	10
Total Matches	8
Total Mismatches	2
Match Percentage	80.00%

  Column-Level Summary
Column	Match %	Mismatch Count
amount	50%	1
status	50%	1
region	100%	0
created_at	100%	0

  Row-Level Mismatch Report (Exportable as CSV / XLSX)
id	Column	Report A Value	Report B Value	Difference
102	amount	2500.00	2450.00	50.00
102	status	Active	Inactive	—

The mismatch report can be exported as CSV or XLSX for further triage, audit, or sharing.

6. Edge Cases Handled
The system has been designed to handle real-world data quality issues commonly found in production reporting environments.

Edge Case	Handling Approach
Duplicate Primary Keys	Detected and raised as a validation error before comparison proceeds.
Missing Primary Key Values	Null or empty key rows are flagged and excluded from matching.
Extra Rows (One-Sided)	Rows present in only one report are captured in the output with clear labeling.
Column Reordering	Column matching is name-based, not position-based; reordering does not cause false mismatches.
Datatype Mismatch	Columns with inconsistent types across reports are flagged at the structural validation stage.
High-Precision Decimals	NumPy-backed arithmetic handles financial precision without floating-point errors.
Negative Financial Values	Supported natively; sign is preserved through normalization.
Blank / Empty Rows	Stripped during parsing; do not affect row counts or comparison results.
Special Characters in Headers	Cleaned during normalization; comparison proceeds on sanitized column names.
Date Format Variations	Multiple date formats (DD-MM-YYYY, MM/DD/YYYY, etc.) are parsed and normalized to ISO 8601.
Null vs Zero	Behaviour is configurable — treat as match or mismatch based on business rules.
Tolerance-Based Numeric Comparison	Configurable percentage tolerance allows small rounding differences to be accepted as matches.

7. Advantages
The Report Verification System delivers measurable benefits across QA, engineering, finance, and product functions.

1	Eliminates Manual Reconciliation Effort
What previously required hours of spreadsheet comparison is now completed in minutes. RVS processes large datasets automatically, freeing QA and finance teams to focus on analysis rather than data entry.

2	Dramatically Reduces Human Error
Automated cell-by-cell comparison eliminates the risk of missed discrepancies caused by fatigue, oversight, or formula errors in manual processes.

3	Accelerates Release Validation
Release-blocking report validations that previously delayed go-lives can now be completed as a fast, repeatable step in the deployment pipeline.

4	Configurable & Business-Rule Aware
Tolerance thresholds, null handling, and case sensitivity are all configurable — allowing the system to be adapted to any reporting standard or business domain without code changes.

5	Handles Real-World Data Quality Issues
The normalization engine handles format inconsistencies (date formats, decimal separators, whitespace, encoding) that commonly cause false mismatches in naive comparison approaches.

6	Clear, Actionable Output
The mismatch report is structured by primary key, column, and cell — giving engineers and finance teams the exact location and magnitude of every discrepancy, exportable for downstream triage.

7	Auditable & Traceable
Every comparison job is logged with user, timestamp, and summary statistics — providing a complete audit trail for compliance and sign-off processes.

8	Modular & Extensible Architecture
Each stage of the pipeline is independently maintained and extendable. New normalization rules, comparison modes, or export formats can be added without disrupting existing functionality.

9	Supports Safe Report Logic Migration
When migrating report generation logic (e.g., from backend systems to a new UI), RVS provides a reliable regression gate to confirm that outputs are identical before and after the change.

10	Minimizes Finance Escalations
By catching discrepancies before reports are shared or published, RVS significantly reduces the volume of post-release corrections and associated rework.


8. QA Validation Strategy
7.1 Test Types
Test Type	Description
Functional Testing	Validates that each pipeline stage produces correct output for valid inputs.
Negative Testing	Ensures the system handles invalid inputs gracefully with appropriate error messages.
Boundary Testing	Tests behavior at data boundaries — empty files, single-row files, maximum column counts.
Large Dataset Testing	Validates performance and correctness under high-volume data loads.
Performance Testing	Measures processing time and memory usage against defined thresholds.
Security Testing	Confirms temporary file cleanup, access control, and absence of data leakage.

7.2 Key Validation Scenarios
    • Identical reports → 100% match across all cells
    • One missing column → Structural mismatch detected, comparison blocked
    • Single cell value change → Exactly one mismatch reported
    • Duplicate primary key → Validation error triggered before comparison
    • Null vs 0 → Behaviour driven by configuration setting
    • Date format variation (DD-MM-YYYY vs YYYY-MM-DD) → Normalized to match
    • Numeric tolerance (0.1%) → Small rounding difference accepted as match
    • Large dataset (100k+ rows) → Performance validated within acceptable time

9. Non-Functional Requirements
Performance
The system is designed to handle large datasets efficiently using Pandas vectorized operations. Processing time scales linearly with dataset size and is benchmarked against defined row thresholds.

Scalability
The modular pipeline architecture allows normalization rules, tolerance configurations, and comparison modes to be extended independently. New data types and formats can be onboarded without core changes.

Security
Uploaded files are stored temporarily and deleted after processing. Access is restricted to authorized users. No long-term storage of report data unless explicitly configured.

Auditability
All comparison jobs are logged with user identity, timestamp, file references, and summary statistics — supporting compliance and sign-off workflows.

Reliability
Structured error handling at every pipeline stage ensures graceful degradation. Users receive actionable error messages rather than silent failures.


10. Future Enhancements
The following capabilities are planned for future iterations of the RVS, based on identified business needs and product roadmap priorities.

Enhancement	Description
Visual Diff Interface	Side-by-side cell highlighting to make mismatches visually scannable without reading raw data.
Graphical Mismatch Heatmap	Column-level heatmap overlaid on the report to instantly surface high-error-density areas.
Multi-Report Comparison	Extend the engine to compare three or more reports simultaneously for multi-source reconciliation.
CI/CD Integration	Automated regression validation triggered by deployment pipelines — RVS as a quality gate in SDLC.
Email Summary Notifications	Post-comparison summary dispatched to configured recipients with match statistics and mismatch highlights.
Configurable Tolerance via UI	Allow business users to set tolerance thresholds and null-handling rules directly from the frontend — no code change required.
Scheduled Comparison Jobs	Automated recurring comparisons for periodic report reconciliation (daily, weekly, monthly).
Role-Based Access Control	Differentiated access levels for uploaders, reviewers, and administrators.

11. Business Impact
The Report Verification System has delivered measurable improvements across QA, engineering, data, and finance functions since its implementation.

    • Eliminated manual reconciliation effort by automating end-to-end comparison of structured reports.
    • Increased confidence in report accuracy by providing a reliable, repeatable quality gate before sharing.
    • Reduced post-release corrections by catching data discrepancies early in the workflow.
    • Enabled safe report logic migration by providing regression validation between old and new report sources.
    • Improved data accuracy and transparency through structured, auditable reconciliation outputs.
    • Reduced time-to-validation — large-dataset comparisons that previously took hours are completed in minutes.

12. Conclusion
The Report Verification System provides a structured, scalable, and reliable mechanism to validate report integrity across systems. By automating column, row, and cell-level comparison with intelligent normalization, it ensures data accuracy, strengthens financial reporting confidence, and supports controlled production releases.

The system serves as a reliable quality gate in any reporting workflow and establishes a repeatable, auditable reconciliation framework. Its modular architecture ensures it can grow with evolving needs — from simple two-report comparisons today to multi-source, CI/CD-integrated validation in future iterations.
