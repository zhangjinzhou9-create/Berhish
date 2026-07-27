@echo off
setlocal
cd /d "%~dp0"

where java >nul 2>nul
if errorlevel 1 (
  echo Java 17 or newer is required to run CampusFlow.
  echo The published website can be opened with OPEN_CAMPUSFLOW.url.
  pause
  exit /b 1
)

if not exist "output\submission\CampusFlow.jar" (
  echo The compiled file output\submission\CampusFlow.jar was not found.
  pause
  exit /b 1
)

start "CampusFlow Server" cmd /k java -jar "output\submission\CampusFlow.jar" --spring.profiles.active=classroom
timeout /t 8 /nobreak >nul
start "" "http://localhost:8080/index.html"

endlocal
