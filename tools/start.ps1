# Запуск сайта «ЕЛИ» на этом компьютере.
#
#   start.cmd        — обычный запуск, сайт на http://localhost:3000
#   start.cmd lan    — плюс доступ с телефона в той же сети Wi-Fi (для проверки QR)
#
# Файл сохранён в UTF-8 с BOM: так его одинаково правильно читают и
# Windows PowerShell 5.1, и PowerShell 7.

param(
  [switch]$Lan,
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'

# Корень проекта — папка на уровень выше tools\
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$siteUrl = 'http://localhost:3000'

function Test-SiteRunning {
  try {
    Invoke-WebRequest -Uri 'http://127.0.0.1:3000' -UseBasicParsing -TimeoutSec 2 | Out-Null
    return $true
  } catch {
    return $false
  }
}

function Open-Site([string]$url) {
  if ($NoBrowser) { return }
  try { Start-Process $url } catch { }
}

Write-Host ''
Write-Host '  Ресторан ЕЛИ — локальный запуск сайта' -ForegroundColor Green
Write-Host '  -------------------------------------' -ForegroundColor DarkGray

if (Test-SiteRunning) {
  Write-Host ''
  Write-Host '  Сайт уже запущен. Открываю браузер.' -ForegroundColor Yellow
  Write-Host "  Адрес: $siteUrl" -ForegroundColor Cyan
  Write-Host ''
  Open-Site $siteUrl
  exit 0
}

# ── 1. Node.js ───────────────────────────────────────────────────────────────
$nodeExe = $null
$systemNode = Get-Command node -ErrorAction SilentlyContinue

if ($systemNode) {
  $nodeExe = $systemNode.Source
} else {
  # Запасной вариант: Node.js, встроенный в среду DeepSeek Harness.
  $fallbackNode = 'C:\Users\esluc\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe'
  if (Test-Path $fallbackNode) {
    $nodeExe = $fallbackNode
    $env:PATH = (Split-Path -Parent $fallbackNode) + ';' + $env:PATH
    Write-Host ''
    Write-Host '  Обычного Node.js в системе нет — беру встроенный в среду DSH.' -ForegroundColor DarkGray
  }
}

if (-not $nodeExe) {
  Write-Host ''
  Write-Host '  Node.js не найден.' -ForegroundColor Red
  Write-Host '  Установите Node.js 20 или новее с сайта nodejs.org,'
  Write-Host '  затем выполните один раз в терминале: npm install -g pnpm'
  Write-Host ''
  Read-Host '  Нажмите Enter, чтобы закрыть окно'
  exit 1
}

# ── 2. pnpm ──────────────────────────────────────────────────────────────────
$systemPnpm = Get-Command pnpm -ErrorAction SilentlyContinue
$pnpmExe = $null
$pnpmScript = $null

if ($systemPnpm) {
  $pnpmExe = $systemPnpm.Source
} else {
  $fallbackPnpm = 'C:\Users\esluc\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\pnpm\bin\pnpm.mjs'
  if (Test-Path $fallbackPnpm) { $pnpmScript = $fallbackPnpm }
}

if (-not $pnpmExe -and -not $pnpmScript) {
  Write-Host ''
  Write-Host '  pnpm не найден.' -ForegroundColor Red
  Write-Host '  Выполните один раз в терминале: npm install -g pnpm'
  Write-Host ''
  Read-Host '  Нажмите Enter, чтобы закрыть окно'
  exit 1
}

function Invoke-Pnpm([string[]]$pnpmArgs) {
  if ($pnpmExe) {
    & $pnpmExe @pnpmArgs
  } else {
    & $nodeExe $pnpmScript @pnpmArgs
  }
}

# ── 3. Зависимости ───────────────────────────────────────────────────────────
if (-not (Test-Path (Join-Path $root 'node_modules\next\package.json'))) {
  Write-Host ''
  Write-Host '  Первый запуск: устанавливаю зависимости. Это займёт пару минут.' -ForegroundColor Yellow
  Invoke-Pnpm @('install')
  if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host '  Не удалось установить зависимости. Смотрите сообщение выше.' -ForegroundColor Red
    Write-Host ''
    Read-Host '  Нажмите Enter, чтобы закрыть окно'
    exit 1
  }
}

# ── 4. Браузер откроется сам, как только сервер ответит ──────────────────────
$opener = $null
if (-not $NoBrowser) {
  $opener = Start-Job -ScriptBlock {
    param($url)
    for ($attempt = 0; $attempt -lt 120; $attempt++) {
      try {
        Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 | Out-Null
        Start-Process $url
        return
      } catch {
        Start-Sleep -Seconds 1
      }
    }
  } -ArgumentList $siteUrl
}

# ── 5. Сервер ────────────────────────────────────────────────────────────────
$task = if ($Lan) { 'dev:lan' } else { 'dev' }

Write-Host ''
if ($Lan) {
  Write-Host '  Режим с доступом из сети: адрес для телефона — в строке Network ниже.' -ForegroundColor Cyan
}
Write-Host "  Адрес: $siteUrl" -ForegroundColor Cyan
Write-Host '  Остановить сайт: Ctrl+C в этом окне или просто закрыть окно.' -ForegroundColor DarkGray
Write-Host ''

try {
  Invoke-Pnpm @('run', $task)
} finally {
  if ($opener) {
    Stop-Job $opener -ErrorAction SilentlyContinue
    Remove-Job $opener -Force -ErrorAction SilentlyContinue
  }
}
