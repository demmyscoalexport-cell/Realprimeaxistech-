# Quick smoke test for all PrimeAxis API routes (direct + Vite proxy)
$ErrorActionPreference = "Continue"
$base = "http://localhost:5000/api"
$proxy = "http://localhost:5173/api"

$endpoints = @(
  "GET /healthz",
  "GET /home/feed",
  "GET /articles?limit=3",
  "GET /articles/trending?limit=3",
  "GET /articles/most-discussed?limit=3",
  "GET /articles/search?q=ai&limit=3",
  "GET /categories",
  "GET /authors",
  "GET /reviews?limit=3",
  "GET /reviews/best-picks",
  "GET /videos?limit=3",
  "GET /newsletters",
  "GET /podcast/feed.xml",
  "GET /rss.xml",
  "GET /sitemap.xml"
)

function Test-Endpoint($root, $label) {
  $fail = 0
  Write-Host "`n=== $label ($root) ===" -ForegroundColor Cyan
  foreach ($e in $endpoints) {
    $parts = $e -split " ", 2
    $path = $parts[1]
    try {
      $r = Invoke-WebRequest -Uri "$root$path" -Method $parts[0] -UseBasicParsing -TimeoutSec 25
      Write-Host "  OK  $path ($($r.StatusCode), $($r.Content.Length) bytes)"
    } catch {
      Write-Host "  FAIL $path -> $($_.Exception.Message)" -ForegroundColor Red
      $fail++
    }
  }
  return $fail
}

$feed = Invoke-RestMethod -Uri "$base/home/feed" -TimeoutSec 25
$slug = $feed.hero.slug
$cat = $feed.hero.category.slug
$author = $feed.hero.author.slug
$review = (Invoke-RestMethod -Uri "$base/reviews?limit=1" -TimeoutSec 25)[0].slug
$video = (Invoke-RestMethod -Uri "$base/videos?limit=1" -TimeoutSec 25)[0].slug

$detail = @(
  "GET /articles/$slug",
  "GET /articles/$slug/related",
  "GET /categories/$cat",
  "GET /authors/$author",
  "GET /reviews/$review"
)
Write-Host "`n=== Detail routes (5000) ===" -ForegroundColor Cyan
$detailFail = 0
foreach ($e in $detail) {
  $parts = $e -split " ", 2
  try {
    $r = Invoke-WebRequest -Uri "$base$($parts[1])" -UseBasicParsing -TimeoutSec 25
    Write-Host "  OK  $($parts[1]) ($($r.StatusCode))"
  } catch {
    Write-Host "  FAIL $($parts[1]) -> $($_.Exception.Message)" -ForegroundColor Red
    $detailFail++
  }
}

$img = $feed.hero.heroImageUrl
Write-Host "`n=== Sample image ===" -ForegroundColor Cyan
try {
  $ir = Invoke-WebRequest -Uri $img -Method Head -UseBasicParsing -TimeoutSec 15
  Write-Host "  OK  hero image ($($ir.StatusCode)) $img"
} catch {
  Write-Host "  FAIL hero image -> $($_.Exception.Message)" -ForegroundColor Red
  $detailFail++
}

$f1 = Test-Endpoint $base "Direct API"
$f2 = Test-Endpoint $proxy "Vite proxy"
$total = $f1 + $f2 + $detailFail
if ($total -eq 0) {
  Write-Host "`nAll checks passed." -ForegroundColor Green
  exit 0
}
Write-Host "`n$total check(s) failed." -ForegroundColor Red
exit 1
