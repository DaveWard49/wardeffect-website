# Ward Effect Website Deploy
# Uploads: commercialisation.html, index.html, water-crisis.png
# Run from the folder containing your downloaded files

$files = @(
    "commercialisation.html",
    "index.html",
    "water-crisis.png"
)

$source = $PSScriptRoot  # folder where this script lives
$dest   = "C:\Users\Admin\Documents\wardeffect-website"  # change this to your local site folder if different

Write-Host ""
Write-Host "Ward Effect -- Cloudflare Pages Deploy" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow
Write-Host ""

# Copy files to site folder
foreach ($file in $files) {
    $src = Join-Path $source $file
    if (Test-Path $src) {
        Copy-Item $src -Destination $dest -Force
        Write-Host "  Copied: $file" -ForegroundColor Green
    } else {
        Write-Host "  MISSING: $file -- make sure it is in the same folder as this script" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Files ready in: $dest" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step -- upload to Cloudflare Pages:" -ForegroundColor Yellow
Write-Host "  1. Go to https://dash.cloudflare.com" -ForegroundColor White
Write-Host "  2. Workers & Pages -> wardeffect-website" -ForegroundColor White
Write-Host "  3. Create new deployment -> Upload assets" -ForegroundColor White
Write-Host "  4. Drag the three files from $dest" -ForegroundColor White
Write-Host ""
Write-Host "Done." -ForegroundColor Green
