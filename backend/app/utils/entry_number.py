"""
Utility to parse IITD entry numbers and extract department + batch year.

Official 11-char entry number format (full form): YYYY + DD + P + NNNN
  - YYYY = 4-digit admission year (e.g. 2024)
  - DD   = 2-letter department/unit code (e.g. CS, EE, MT)
  - P    = 1-char program level:
           1-4 → B.Tech, 5-9 → Dual Degree, A-X → M.Tech/MBA/etc, Y → MS(R), Z → Ph.D.
  - NNNN = 4-digit sequence number

Email/Kerberos short form (9 chars): DD + P + YY + NNNN
  - DD   = 2-letter department code
  - P    = 1-char program level
  - YY   = 2-digit admission year
  - NNNN = 4-digit sequence number

Example: CS1240020 → Dept=CS, Program=1 (B.Tech), Year=2024, Roll=0020
Example: MT1240916 → Dept=MT, Program=1 (B.Tech), Year=2024, Roll=0916
Example: EEZ240001 → Dept=EE, Program=Z (Ph.D.), Year=2024, Roll=0001
"""

from datetime import datetime
from app.models.enums import DepartmentName

# 2-letter department/unit code → DepartmentName enum
DEPT_CODE_MAP = {
    "CS": DepartmentName.COMPUTER_SCIENCE_AND_ENGINEERING,
    "AM": DepartmentName.APPLIED_MECHANICS,
    "BB": DepartmentName.BIOCHEMICAL_ENGINEERING_AND_BIOTECHNOLOGY,
    "CE": DepartmentName.CIVIL_ENGINEERING,
    "CH": DepartmentName.CHEMICAL_ENGINEERING,
    "CY": DepartmentName.CHEMISTRY,
    "EE": DepartmentName.ELECTRICAL_ENGINEERING,
    "ES": DepartmentName.ENERGY_SCIENCE_AND_ENGINEERING,
    "HU": DepartmentName.HUMANITIES_AND_SOCIAL_SCIENCES,
    "MA": DepartmentName.MATHEMATICS,
    "ME": DepartmentName.MECHANICAL_ENGINEERING,
    "PH": DepartmentName.PHYSICS,
    "TT": DepartmentName.TEXTILE_AND_FIBRE_ENGINEERING,
    "MT": DepartmentName.MATHEMATICS,              # Mathematics & Computing
    "MS": DepartmentName.MATERIALS_SCIENCE_AND_ENGINEERING,
    "MG": DepartmentName.MANAGEMENT_STUDIES,
    "DD": DepartmentName.DESIGN,
    # Interdisciplinary Schools & Centres (map to closest dept or None)
    "SI": DepartmentName.COMPUTER_SCIENCE_AND_ENGINEERING,  # School of IT
    "AI": DepartmentName.COMPUTER_SCIENCE_AND_ENGINEERING,  # Yardi School of AI
    "BS": DepartmentName.ELECTRICAL_ENGINEERING,            # Bharti School of Telecom
    "CT": DepartmentName.MECHANICAL_ENGINEERING,            # CART
    "CR": DepartmentName.ELECTRICAL_ENGINEERING,            # CARE
}


def parse_entry_number(entry_number: str) -> tuple[DepartmentName | None, int | None]:
    """
    Parse an IITD entry number and return (DepartmentName, current_year_of_study).
    Returns (None, None) on failure.
    """
    entry = entry_number.upper().strip()
    if not entry:
        return None, None

    admission_year: int | None = None
    dept_code: str | None = None

    # --- Format 1: Full form starting with 4-digit year (e.g. 2024CS10020) ---
    if len(entry) >= 7 and entry[:4].isdigit():
        admission_year = int(entry[:4])
        dept_code = entry[4:6]  # 2-letter dept code
        # field 7 = program level (skip), rest = sequence

    # --- Format 2: Short email form (e.g. CS1240020) ---
    elif len(entry) >= 5 and entry[:2].isalpha():
        dept_code = entry[0:2]          # 2-letter dept code
        # entry[2] = program level (1 char, digit or letter) — skip
        year_digits = entry[3:5]        # 2-digit year
        if year_digits.isdigit():
            yy = int(year_digits)
            admission_year = 2000 + yy if yy < 50 else 1900 + yy

    if admission_year is None or not dept_code:
        return None, None

    # Map department code → Enum
    dept_enum = DEPT_CODE_MAP.get(dept_code)

    # Calculate current year of study (1-based)
    now = datetime.now()
    # Academic year starts in July-August
    academic_year_start = now.year if now.month >= 7 else now.year - 1
    current_year_of_study = academic_year_start - admission_year + 1
    # Clamp to reasonable range (1-6)
    current_year_of_study = max(1, min(current_year_of_study, 6))

    return dept_enum, current_year_of_study
