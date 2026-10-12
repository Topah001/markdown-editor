$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$html = Get-Content -Raw (Join-Path $root 'index.html')
$js = Get-Content -Raw (Join-Path $root 'app.js')
foreach ($marker in @('markdown-input', 'preview', 'localStorage', 'escapeHtml', 'https?:')) { if (($html + $js) -notmatch [regex]::Escape($marker)) { throw "Missing expected editor feature: $marker" } }
if ($js -notmatch 'preview\.innerHTML\s*=\s*renderMarkdown' -or $js -notmatch 'return allowed \?') { throw 'Preview rendering or link filtering is missing.' }
Write-Output 'Markdown editor smoke checks passed.'
