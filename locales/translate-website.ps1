# Ward Effect Website — Pre-translate all 33 languages
# Run ONCE. Generates JSON files for all languages.
# Place this script in: C:\Users\Admin\Documents\wardeffect-website\locales\

$ApiKey   = "AIzaSyAtdQG8Z21UdGubI_XnLNPfu5BuWDmvS-8"
$ApiUrl   = "https://translation.googleapis.com/language/translate/v2"
$EnFile   = "$PSScriptRoot\en.json"
$OutDir   = $PSScriptRoot

$Languages = [ordered]@{
  "af"    = "Afrikaans"
  "ar"    = "Arabic"
  "bn"    = "Bengali"
  "zh-CN" = "Chinese Simplified"
  "zh-TW" = "Chinese Traditional"
  "hr"    = "Croatian"
  "cs"    = "Czech"
  "da"    = "Danish"
  "nl"    = "Dutch"
  "fi"    = "Finnish"
  "fr"    = "French"
  "de"    = "German"
  "el"    = "Greek"
  "he"    = "Hebrew"
  "hi"    = "Hindi"
  "hu"    = "Hungarian"
  "id"    = "Indonesian"
  "it"    = "Italian"
  "ja"    = "Japanese"
  "ko"    = "Korean"
  "ms"    = "Malay"
  "no"    = "Norwegian"
  "pl"    = "Polish"
  "pt"    = "Portuguese"
  "ro"    = "Romanian"
  "ru"    = "Russian"
  "sk"    = "Slovak"
  "es"    = "Spanish"
  "sv"    = "Swedish"
  "th"    = "Thai"
  "tl"    = "Filipino"
  "tr"    = "Turkish"
  "uk"    = "Ukrainian"
  "vi"    = "Vietnamese"
}

Write-Host ""
Write-Host "Ward Effect Website Translator" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow
Write-Host ""

# Load en.json
$enData = Get-Content $EnFile -Raw -Encoding UTF8 | ConvertFrom-Json
$keys   = $enData.PSObject.Properties.Name
$values = $keys | ForEach-Object { $enData.$_ }

Write-Host "Loaded $($keys.Count) strings from en.json" -ForegroundColor Cyan
Write-Host ""

function Translate-Chunk($texts, $targetLang) {
    $body = @{
        q      = $texts
        source = "en"
        target = $targetLang
        format = "text"
    } | ConvertTo-Json -Depth 5

    $response = Invoke-RestMethod -Uri "$ApiUrl`?key=$ApiKey" `
        -Method POST `
        -Body $body `
        -ContentType "application/json; charset=utf-8"

    return $response.data.translations | ForEach-Object { $_.translatedText }
}

foreach ($code in $Languages.Keys) {
    $name    = $Languages[$code]
    $outFile = Join-Path $OutDir "$code.json"

    Write-Host "  Translating $name ($code)..." -ForegroundColor White -NoNewline

    $translated = @{}
    $chunkSize  = 50

    try {
        for ($i = 0; $i -lt $values.Count; $i += $chunkSize) {
            $chunk       = $values[$i..([Math]::Min($i + $chunkSize - 1, $values.Count - 1))]
            $chunkKeys   = $keys[$i..([Math]::Min($i + $chunkSize - 1, $keys.Count - 1))]
            $chunkResult = Translate-Chunk $chunk $code

            for ($j = 0; $j -lt $chunkKeys.Count; $j++) {
                $translated[$chunkKeys[$j]] = $chunkResult[$j]
            }
        }

        $translated | ConvertTo-Json -Depth 5 | 
            Set-Content -Path $outFile -Encoding UTF8

        Write-Host " Done" -ForegroundColor Green

    } catch {
        Write-Host " FAILED: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "All languages complete. Files saved to: $OutDir" -ForegroundColor Green
Write-Host ""
