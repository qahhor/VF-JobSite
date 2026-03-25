@echo off
setlocal enabledelayedexpansion

set BASE_DIR=%~dp0
set WRAPPER_DIR=%BASE_DIR%\.mvn\wrapper
set PROPERTIES_FILE=%WRAPPER_DIR%\maven-wrapper.properties
set INSTALL_DIR=%WRAPPER_DIR%\apache-maven
set ARCHIVE_FILE=%WRAPPER_DIR%\apache-maven.zip

for /f "tokens=1,* delims==" %%A in (%PROPERTIES_FILE%) do (
  if "%%A"=="distributionUrl" set DIST_URL=%%B
)

if not exist "%INSTALL_DIR%\bin\mvn.cmd" (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ProgressPreference='SilentlyContinue';" ^
    "New-Item -ItemType Directory -Force '%WRAPPER_DIR%' | Out-Null;" ^
    "Invoke-WebRequest -Uri '%DIST_URL%' -OutFile '%ARCHIVE_FILE%';" ^
    "if (Test-Path '%INSTALL_DIR%') { Remove-Item '%INSTALL_DIR%' -Recurse -Force };" ^
    "Expand-Archive -Path '%ARCHIVE_FILE%' -DestinationPath '%WRAPPER_DIR%' -Force;" ^
    "$dir = Get-ChildItem '%WRAPPER_DIR%' -Directory | Where-Object { $_.Name -like 'apache-maven-*' } | Select-Object -First 1;" ^
    "Move-Item $dir.FullName '%INSTALL_DIR%' -Force"
)

call "%INSTALL_DIR%\bin\mvn.cmd" %*
