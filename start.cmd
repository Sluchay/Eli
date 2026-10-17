@echo off
rem ---------------------------------------------------------------------------
rem  Launcher for the ELI restaurant site.
rem
rem  IMPORTANT: this file must stay pure ASCII. cmd.exe reads .cmd files in the
rem  OEM code page (866 on Russian Windows), so UTF-8 Cyrillic inside a batch
rem  file turns into garbage and breaks even the commands themselves. Russian
rem  messages are passed to PowerShell as an encoded command instead.
rem
rem    start.cmd             open the site on http://localhost:3000
rem    start.cmd lan         also allow access from a phone in the same Wi-Fi
rem    start.cmd tunnel      start the site and a public Cloudflare link
rem ---------------------------------------------------------------------------

setlocal EnableDelayedExpansion
cd /d "%~dp0"

set "NODE_BIN="

where node >nul 2>&1
if not errorlevel 1 (
  set "NODE_BIN=node"
  goto :node_found
)

if exist "C:\Users\esluc\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe" (
  set "NODE_BIN=C:\Users\esluc\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
  goto :node_found
)

if exist "%ProgramFiles%\nodejs\node.exe" (
  set "NODE_BIN=%ProgramFiles%\nodejs\node.exe"
  goto :node_found
)

if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
  set "NODE_BIN=%LOCALAPPDATA%\Programs\nodejs\node.exe"
  goto :node_found
)

goto :no_node

:node_found
if /i not "%NODE_BIN%"=="node" (
  for %%A in ("%NODE_BIN%") do set "PATH=%%~dpA;%PATH%"
)

if /i "%~1"=="tunnel" goto :tunnel

set "EXTRA="
if /i "%~1"=="lan" set "EXTRA=-Lan"
if /i "%~1"=="nobrowser" set "EXTRA=-NoBrowser"
if /i "%~2"=="nobrowser" set "EXTRA=%EXTRA% -NoBrowser"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\start.ps1" %EXTRA%
goto :eof

:tunnel
"%NODE_BIN%" "%~dp0tools\start-tunnel.mjs"
echo.
pause
goto :eof

:no_node
powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand VwByAGkAdABlAC0ASABvAHMAdAAgACcAJwAKAFcAcgBpAHQAZQAtAEgAbwBzAHQAIAAnACAAIABOAG8AZABlAC4AagBzACAAPQQ1BCAAPQQwBDkENAQ1BD0EIAAUICAAMQQ1BDcEIAA9BDUEMwQ+BCAAQQQwBDkEQgQgAD0ENQQgADcEMAQ/BEMEQQRCBDgEQgRBBE8ELgAnACAALQBGAG8AcgBlAGcAcgBvAHUAbgBkAEMAbwBsAG8AcgAgAFkAZQBsAGwAbwB3AAoAVwByAGkAdABlAC0ASABvAHMAdAAgACcAJwAKAFcAcgBpAHQAZQAtAEgAbwBzAHQAIAAnACAAIAAhBDoEMARHBDAEOQRCBDUEIABMAFQAUwAtADIENQRABEEEOAROBCAAQQQgAGgAdAB0AHAAcwA6AC8ALwBuAG8AZABlAGoAcwAuAG8AcgBnACAAKABXAGkAbgBkAG8AdwBzACAASQBuAHMAdABhAGwAbABlAHIAKQAsACcACgBXAHIAaQB0AGUALQBIAG8AcwB0ACAAJwAgACAAQwRBBEIEMAQ9BD4EMgQ4BEIENQQgAEEEIAA9BDAEQQRCBEAEPgQ5BDoEMAQ8BDgEIAA/BD4EIABDBDwEPgQ7BEcEMAQ9BDgETgQgADgEIAA3BDAEPwRDBEEEQgQ4BEIENQQgAHMAdABhAHIAdAAuAGMAbQBkACAAQQQ9BD4EMgQwBC4AJwAKAFcAcgBpAHQAZQAtAEgAbwBzAHQAIAAnACcA
pause
exit /b 1