# Ward Effect Translations — run once locally
$ApiKey = "REDACTED_API_KEY"
$ApiUrl = "https://translation.googleapis.com/language/translate/v2"
$enData = Get-Content ".\en.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$keys   = $enData.PSObject.Properties.Name
$values = $keys | ForEach-Object { $enData.$_ }
$langs  = [ordered]@{
    "af"="Afrikaans";"ar"="Arabic";"zh-CN"="Chinese Simplified"
    "zh-TW"="Chinese Traditional";"hr"="Croatian";"cs"="Czech"
    "da"="Danish";"nl"="Dutch";"fi"="Finnish";"fr"="French"
    "de"="German";"el"="Greek";"hi"="Hindi";"hu"="Hungarian"
    "id"="Indonesian";"it"="Italian";"ja"="Japanese";"ko"="Korean"
    "ms"="Malay";"no"="Norwegian";"fa"="Persian";"pl"="Polish"
    "pt"="Portuguese";"ro"="Romanian";"ru"="Russian";"es"="Spanish"
    "sv"="Swedish";"tl"="Filipino";"th"="Thai";"tr"="Turkish"
    "uk"="Ukrainian";"ur"="Urdu";"vi"="Vietnamese"
}
$all = [ordered]@{}
foreach ($code in $langs.Keys) {
    Write-Host "Translating $($langs[$code]) ($code)..." -NoNewline
    $t = [ordered]@{}
    $ok = $true
    for ($i = 0; $i -lt $values.Count; $i += 50) {
        $e = [Math]::Min($i+49, $values.Count-1)
        $ck = $values[$i..$e]
        $kk = $keys[$i..$e]
        $b  = @{q=$ck;source="en";target=$code;format="text"} | ConvertTo-Json -Depth 5
        try {
            $r = Invoke-RestMethod -Uri "$ApiUrl`?key=$ApiKey" -Method POST -Body $b -ContentType "application/json; charset=utf-8"
            for ($j=0; $j -lt $kk.Count; $j++) { $t[$kk[$j]] = $r.data.translations[$j].translatedText }
        } catch { Write-Host " FAILED chunk $i" -ForegroundColor Red; $ok=$false; break }
    }
    if ($ok) { $all[$code]=$t; Write-Host " Done" -ForegroundColor Green }
    Start-Sleep -Milliseconds 300
}
$out = "const WE_TRANSLATIONS = " + ($all | ConvertTo-Json -Depth 10) + ";"
[System.IO.File]::WriteAllText("$PSScriptRoot\wardeffect-translations.js", $out, [System.Text.UTF8Encoding]::new($false))
Write-Host "Saved: wardeffect-translations.js" -ForegroundColor Yellow
