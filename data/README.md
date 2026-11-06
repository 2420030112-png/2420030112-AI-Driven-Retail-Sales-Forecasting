# Walmart Store Sales Forecasting — Dataset Documentation

## Overview
This directory is designated for the historical retail time-series dataset from the **Walmart Recruiting — Store Sales Forecasting** benchmark (available on Kaggle). The data models weekly sales across 45 retail stores located in diverse regions, covering departments and promotional markdown campaigns from 2010 to 2012.

## Expected Input Files & Schema
Place the following uncompressed `.csv` files into `data/raw/` (or directly inside `data/`):

1. **`train.csv`** (~12.8 MB, 421,570 records)
   - `Store`: The store number (1 to 45).
   - `Dept`: The department number (1 to 99).
   - `Date`: The week of sales (YYYY-MM-DD), Friday reporting cadence.
   - `Weekly_Sales`: Target variable ($ sales for the given department in the given store).
   - `IsHoliday`: Boolean flag indicating whether the week is a special holiday week.

2. **`features.csv`** (~592 KB, 8,190 records)
   - `Store`: The store number (1 to 45).
   - `Date`: The week of sales (YYYY-MM-DD).
   - `Temperature`: Average temperature in the region (°F).
   - `Fuel_Price`: Cost of fuel in the region ($/gal).
   - `MarkDown1` - `MarkDown5`: Anonymized promotional markdowns active around holidays.
   - `CPI`: Consumer Price Index.
   - `Unemployment`: Unemployment rate in the store's regional market.
   - `IsHoliday`: Boolean flag indicating holiday week.

3. **`stores.csv`** (~532 bytes, 45 records)
   - `Store`: Store number (1 to 45).
   - `Type`: Store format categorical identifier (`A`, `B`, or `C` representing Supercenter, Suburban, and Compact formats).
   - `Size`: Physical store footprint in square feet.

4. *(Optional)* **`test.csv`** (~2.6 MB, 115,064 records)
   - Future unlabelled test set used for Kaggle submission evaluation.

## Directory Structure
```
data/
├── README.md               # Dataset documentation, schema, and license terms
├── raw/                    # (Git-ignored) Raw uncompressed CSV files
│   ├── train.csv
│   ├── features.csv
│   └── stores.csv
└── processed/              # Processed / merged datasets (if generated)
```

## Local Extraction
If you have downloaded `archive.zip` or `archive (1).zip` from Kaggle, you can extract the files into `data/raw/` using PowerShell:
```powershell
Expand-Archive -Path "C:\Users\<User>\Downloads\archive (1).zip" -DestinationPath "data/raw" -Force
```

## Licensing & Terms of Use
- **Source:** Kaggle Walmart Recruiting — Store Sales Forecasting Competition.
- **License / Terms:** The dataset is provided by Walmart for academic and educational evaluation under Kaggle competition rules. Redistribution of raw dataset files in public source control is restricted. Raw CSV files in `data/raw/` and `data/*.csv` are excluded from Git commits via `.gitignore`.
