chcp 65001 > $null
$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::UTF8

# スタート
$start = Get-Date
Write-Host "Start: $($start.ToString('yyyy-MM-dd HH:mm:ss.fff'))"

$cnt = 0 #カウンタ

# 読み取るパスの指定
$searchPath = "G:\photo\2017_2025"
$searchPath
# SQliteのDBのパス
$db = "D:\photoDB\photos.db"

# コマンド実行
 $myExifDatas = & exiftool -json -r -ext jpg -Make -Model -SerialNumber -Software `
    -FocalLength -FocalLengthIn35mmFormat -LensModel -LensID -MinFocalLength -MaxFocalLength -LensSerialNumber `
    -ExposureTime -FNumber -ExposureProgram -ISO -ExposureCompensation -MeteringMode -LightSource -Flash -ExposureMode -BrightnessValue -MaxApertureValue `
    -DateTimeOriginal -CreateDate -ModifyDate -SubSecTimeOriginal `
    -ImageWidth -ImageHeight -Orientation -Megapixels -FileType -MIMEType -GPSLatitude -GPSLongitude -GPSAltitude -GPSDateStamp -GPSTimeStamp `
 -ShutterCount -ImageCount -ReleaseCount $searchPath -charset filename=cp932 | ConvertFrom-Json

$myExifDatas | Select-Object -First 1

# DB処理------------------------------------------------------------ここから

# トランザクション開始（高速化）
sqlite3 $db "BEGIN;"

foreach ($item in $myExifDatas | Where-Object{$_.Make -ne "" -or $null -ne $_.Make}) {
#If($item.Make -ne "" -or $null -ne $item.Make) {
#    continue
#}
    # --- 文字列はすべて SQLite 用にエスケープ ---
    function Esc($v) {
    if ($null -eq $v -or "" -eq $v) {
        return "NULL"
    }
    return "'" + ($v -replace "'", "''") + "'"
   }
   function Esc_double($v) {
    if ($null -eq $v -or "" -eq $v) {
        return "NULL"
    }
    return $v -as [double] -replace ',' ,'.'
   }
   function Esc_int($v) {
    if ($null -eq $v -or "" -eq $v) {
        return "NULL"
    }
    return $v -as [int] -replace ',' ,'.'
   }
   function ToSqlDate($v) {
    if ($null -eq $v -or "" -eq $v) { 
        return "NULL" 
    }

    # EXIF形式: YYYY:MM:DD HH:MM:SS
    # Split で最初の 2 つだけ置換する
    $parts = $v.Split(":", 3)   # 3分割（年 / 月 / (それ以降)）

    # 再結合して ISO8601 日付へ
    $iso = "$($parts[0])-$($parts[1])-$($parts[2])"

    return "'" + $iso + "'"     # SQLリテラル用にクォート
   }


   $sql = @"
INSERT OR REPLACE INTO photos (
    SourceFile, Make, Model, SerialNumber, Software,
    FocalLength, FocalLength35mm, LensID, MinFocalLength, MaxFocalLength,
    LensModel, LensSerialNumber,
    ExposureTime, FNumber, ExposureProgram, ISO, ExposureComp,
    MeteringMode, LightSource, Flash, ExposureMode, MaxApertureValue,
    DateTimeOriginal, CreateDate, ModifyDate, SubSecTimeOriginal,
    ImageWidth, ImageHeight, Orientation, Megapixels,
    FileType, MIMEType, ShutterCount, ThumbnailPath
) VALUES (
    $(Esc $item.SourceFile),
    $(Esc $item.Make),
    $(Esc $item.Model),
    $(Esc $item.SerialNumber),
    $(Esc $item.Software),

    $(Esc $item.FocalLength),
    $(Esc $item.FocalLengthIn35mmFormat),
    $(Esc $item.LensID),
    $(Esc $item.MinFocalLength),
    $(Esc $item.MaxFocalLength),

    $(Esc $item.LensModel),
    $(Esc $item.LensSerialNumber),

    $(Esc $item.ExposureTime),
    $(Esc_double $item.FNumber),
    $(Esc $item.ExposureProgram),
    $(Esc_int $item.ISO),
    $(Esc $item.ExposureCompensation),

    $(Esc $item.MeteringMode),
    $(Esc $item.LightSource),
    $(Esc $item.Flash),
    $(Esc $item.ExposureMode),
    $(Esc_double $item.MaxApertureValue),

    $(ToSqlDate $item.DateTimeOriginal),
    $(ToSqlDate $item.CreateDate),
    $(ToSqlDate $item.ModifyDate),
    $(Esc $item.SubSecTimeOriginal),

    $(Esc_int $item.ImageWidth),
    $(Esc_int $item.ImageHeight),
    $(Esc $item.Orientation),
    $(Esc_double $item.Megapixels),

    $(Esc $item.FileType),
    $(Esc $item.MIMEType),
    $(Esc_int $item.ShutterCount),
    NULL
);
"@


   
        # SQL実行
        sqlite3 $db "$sql"
        $cnt++

}



# トランザクション確定
sqlite3 $db "COMMIT;"



# DB処理------------------------------------------------------------ここまで

# 処理終了
$end = Get-Date
Write-Host "End:   $($end.ToString('yyyy-MM-dd HH:mm:ss.fff'))"
Write-Host "Elapsed: $([math]::Round(($end - $start).TotalSeconds, 2)) seconds"
Write-Host "Inserted/Updated records: $cnt"

# 出力ファイル名
$dirName = Split-Path -Leaf $searchPath
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outFileName = "$dirName`_ExifData_$timestamp.csv"
$outDir = Join-Path ([Environment]::GetFolderPath("Desktop")) "ExifCSV"
$outPath = Join-Path $outDir $outFileName



$myExifDatas | Export-CSV -path $outPath -encoding Default -Notypeinformation