# スタート
$start = Get-Date
Write-Host "Start: $($start.ToString('yyyy-MM-dd HH:mm:ss.fff'))"


# 読み取るパスの指定
$searchPath = "G:\photo\2017年_2025年\201711"

# パスをUTF8に変換
#$utf8 = [System.Text.Encoding]::UTF8.GetString([System.Text.Encoding]::UTF8.GetBytes($searchPath))
# コマンド
 $myExifDatas = & exiftool -json -r -ext jpg -Make -Model -SerialNumber -Software `
    -FocalLength -FocalLengthIn35mmFormat -LensModel -LensID -MinFocalLength -MaxFocalLength -LensSerialNumber `
    -ExposureTime -FNumber -ExposureProgram -ISO -ExposureCompensation -MeteringMode -LightSource -Flash -ExposureMode -BrightnessValue -MaxApertureValue `
    -DateTimeOriginal -CreateDate -ModifyDate -SubSecTimeOriginal `
    -ImageWidth -ImageHeight -Orientation -Megapixels -FileType -MIMEType -GPSLatitude -GPSLongitude -GPSAltitude -GPSDateStamp -GPSTimeStamp
 -ShutterCount -ImageCount -ReleaseCount $searchPath -charset filename=cp932 | ConvertFrom-Json

# 処理終了
$end = Get-Date
Write-Host "End:   $($end.ToString('yyyy-MM-dd HH:mm:ss.fff'))"
Write-Host "Elapsed: $([math]::Round(($end - $start).TotalSeconds, 2)) seconds"

# 出力ファイル名
$dirName = Split-Path -Leaf $searchPath
$outFileName = "$dirName`_ExifData.csv"
$outDir = Join-Path ([Environment]::GetFolderPath("Desktop")) "ExifCSV"
$outPath = Join-Path $outDir $outFileName



$myExifDatas | Export-CSV -path $outPath -encoding utf8 -Notypeinformation