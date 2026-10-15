@echo off
rem ---------------------------------------------------------------------------
rem  Launcher for the ELI restaurant site.
rem  All messages are printed by PowerShell: cmd.exe cannot show UTF-8 Cyrillic.
rem
rem    start.cmd             - open the site on http://localhost:3000
rem    start.cmd lan         - also allow access from a phone in the same Wi-Fi
rem    start.cmd lan nobrowser - same, but do not open the browser
rem ---------------------------------------------------------------------------

cd /d "%~dp0"

set "EXTRA="
if /i "%~1"=="lan" set "EXTRA=-Lan"
if /i "%~1"=="nobrowser" set "EXTRA=-NoBrowser"
if /i "%~2"=="nobrowser" set "EXTRA=%EXTRA% -NoBrowser"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\start.ps1" %EXTRA%
