# Central Asia Geo Reference

Source snapshot date: `2026-03-24`

Sources:
- GeoNames country dump and administrative codes: `countryInfo.txt`, `admin1CodesASCII.txt`, `admin2Codes.txt`
- GeoNames country place dumps for `KZ`, `KG`, `TJ`, `TM`, `UZ`
- UN M49 Central Asia classification used as the regional baseline

Countries included:
- Kazakhstan (`KZ`)
- Kyrgyzstan (`KG`)
- Tajikistan (`TJ`)
- Turkmenistan (`TM`)
- Uzbekistan (`UZ`)

Folders:
- `raw/` filtered source snapshots used to build the dictionaries
- `generated/` normalized CSVs prepared for Liquibase and project use

Project use:
- `verifix-jobs-domain/src/main/resources/db/changelog/data/geo/` contains the CSV copies used by Liquibase
- `geo_country.csv`, `geo_region.csv`, `geo_district.csv` seed the normalized reference tables
- `geo_city_tm_major.csv` adds the top Turkmenistan cities missing from the legacy manual seed
