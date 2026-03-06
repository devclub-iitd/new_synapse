"""
Utility to parse IITD entry numbers and extract department + batch year.

Entry number format: YYYYDDDNNNNN
  - YYYY = admission year (e.g. 2024)
  - DDD  = department code (e.g. CS, EE, AM)
  - rest = roll number

Email-format ID: cs1240020@iitd.ac.in → entry = CS1240020
  - prefix = department code (2 letters, ignoring trailing Z/1/6)
  - digits after prefix: first 2 = last 2 digits of admission year
"""

from datetime import datetime
from app.models.enums import DepartmentName

# Map of department code prefix → DepartmentName enum
DEPT_CODE_MAP = {
    "CS":  DepartmentName.COMPUTER_SCIENCE_AND_ENGINEERING,
    "CSZ": DepartmentName.COMPUTER_SCIENCE_AND_ENGINEERING,
    "AM":  DepartmentName.APPLIED_MECHANICS,
    "AMZ": DepartmentName.APPLIED_MECHANICS,
    "CE":  DepartmentName.CIVIL_ENGINEERING,
    "CEZ": DepartmentName.CIVIL_ENGINEERING,
    "CH":  DepartmentName.CHEMICAL_ENGINEERING,
    "CHZ": DepartmentName.CHEMICAL_ENGINEERING,
    "CY":  DepartmentName.CHEMISTRY,
    "CYZ": DepartmentName.CHEMISTRY,
    "EE":  DepartmentName.ELECTRICAL_ENGINEERING,
    "EEZ": DepartmentName.ELECTRICAL_ENGINEERING,
    "HU":  DepartmentName.HUMANITIES_AND_SOCIAL_SCIENCES,
    "HUZ": DepartmentName.HUMANITIES_AND_SOCIAL_SCIENCES,
    "MA":  DepartmentName.MATHEMATICS,
    "MAZ": DepartmentName.MATHEMATICS,
    "ME":  DepartmentName.MECHANICAL_ENGINEERING,
    "MEZ": DepartmentName.MECHANICAL_ENGINEERING,
    "PH":  DepartmentName.PHYSICS,
    "PHZ": DepartmentName.PHYSICS,
    "TT":  DepartmentName.TEXTILE_AND_FIBRE_ENGINEERING,
    "TTZ": DepartmentName.TEXTILE_AND_FIBRE_ENGINEERING,
    "BB":  DepartmentName.BIOCHEMICAL_ENGINEERING_AND_BIOTECHNOLOGY,
    "BB1": DepartmentName.BIOCHEMICAL_ENGINEERING_AND_BIOTECHNOLOGY,
    "MT":  DepartmentName.MATHEMATICS,          # Mathematics & Computing → closest enum
    "MT1": DepartmentName.MATHEMATICS,
    "MT6": DepartmentName.MATHEMATICS,
    "MS":  DepartmentName.MATERIALS_SCIENCE_AND_ENGINEERING,
    "MS1": DepartmentName.MATERIALS_SCIENCE_AND_ENGINEERING,
    "ES":  DepartmentName.ENERGY_SCIENCE_AND_ENGINEERING,
    "ES1": DepartmentName.ENERGY_SCIENCE_AND_ENGINEERING,
    "ESZ": DepartmentName.ENERGY_SCIENCE_AND_ENGINEERING,
    "MG":  DepartmentName.MANAGEMENT_STUDIES,   # Management Studies
}

def parse_entry_number(entry_number: str) -> tuple[DepartmentName | None, int | None]:
    """
    Given an IITD entry number (e.g. 'CS1240020' or '2024CS10020'),
    returns (DepartmentName, current_year_of_study) or (None, None) on failure.
    
    Two common formats:
      1. Email-based short form: CS1240020  (dept prefix + 2-digit year + roll)
      2. Full form: 2024CS10020           (4-digit year + dept + roll)
    """
    entry = entry_number.upper().strip()
    
    admission_year: int | None = None
    dept_code: str | None = None

    # --- Format 1: Full form starting with 4-digit year (e.g. 2024CS10020) ---
    if entry[:4].isdigit():
        admission_year = int(entry[:4])
        rest = entry[4:]  # e.g. "CS10020"
        # Extract alphabetic prefix
        dept_code = ""
        for ch in rest:
            if ch.isalpha():
                dept_code += ch
            else:
                break

    # --- Format 2: Short email form (e.g. CS1240020) ---
    else:
        # Extract leading alpha prefix
        dept_code = ""
        i = 0
        for ch in entry:
            if ch.isalpha():
                dept_code += ch
                i += 1
            else:
                break
        # Next 2 digits = YY of admission year
        year_digits = entry[i:i+2]
        if year_digits.isdigit():
            yy = int(year_digits)
            # Determine century: 00-29 → 2000s, else 1900s (standard assumption)
            admission_year = 2000 + yy if yy < 50 else 1900 + yy

    if admission_year is None or not dept_code:
        return None, None

    # Map department code → Enum (try 3-char first, then 2-char)
    dept_enum = DEPT_CODE_MAP.get(dept_code) or DEPT_CODE_MAP.get(dept_code[:2])

    # Calculate current year of study (1-based)
    current_calendar_year = datetime.now().year
    current_month = datetime.now().month
    # Academic year starts in July-August; if before July, use previous year's batch start
    academic_year_start = current_calendar_year if current_month >= 7 else current_calendar_year - 1
    current_year_of_study = academic_year_start - admission_year + 1
    # Clamp to reasonable range (1-6)
    current_year_of_study = max(1, min(current_year_of_study, 6))

    return dept_enum, current_year_of_study
