<#
.SYNOPSIS
    FzLounge Product Image Optimization Script
    
.DESCRIPTION
    Processes product images from distributors:
    - Resizes to standard dimensions (600x600 for cards, 1200x1200 for details)
    - Converts to WebP format for modern browsers
    - Creates JPEG fallbacks for compatibility
    - Optimizes file size while maintaining quality
    
.NOTES
    Requires: ImageMagick (https://imagemagick.org/script/download.php#windows)
    Install ImageMagick and add to PATH before running this script.
    
.EXAMPLE
    .\optimize-images.ps1
    Processes all images in assets/products/originals/
    
.EXAMPLE
    .\optimize-images.ps1 -Size card
    Creates 600x600 card-sized images
    
.EXAMPLE
    .\optimize-images.ps1 -Size detail
    Creates 1200x1200 detail-sized images
#>

param(
    [Parameter()]
    [ValidateSet("card", "detail", "both")]
    [string]$Size = "both",
    
    [Parameter()]
    [int]$Quality = 85,
    
    [Parameter()]
    [switch]$SkipWebP
)

# Configuration
$OriginalsPath = "assets\products\originals"
$OptimizedPath = "assets\products\optimized"
$CardSize = 600
$DetailSize = 1200

# Colors for output
$ColorSuccess = "Green"
$ColorError = "Red"
$ColorInfo = "Cyan"
$ColorWarning = "Yellow"

# Check if ImageMagick is installed
function Test-ImageMagick {
    try {
        $null = magick --version 2>&1
        return $true
    }
    catch {
        return $false
    }
}

# Process a single image
function Optimize-ProductImage {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$TargetSize,
        [int]$Quality,
        [bool]$CreateWebP
    )
    
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($InputPath)
    $outputJpeg = Join-Path $OutputPath "$fileName.jpg"
    $outputWebP = Join-Path $OutputPath "$fileName.webp"
    
    Write-Host "  Processing: $fileName" -ForegroundColor $ColorInfo
    
    try {
        # Create JPEG version
        Write-Host "    Creating JPEG ($($TargetSize)x$($TargetSize))..." -NoNewline
        $jpegArgs = @(
            "convert"
            $InputPath
            "-resize", "${TargetSize}x${TargetSize}^"
            "-gravity", "center"
            "-extent", "${TargetSize}x${TargetSize}"
            "-quality", $Quality
            "-strip"
            $outputJpeg
        )
        & magick $jpegArgs 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            $jpegSize = (Get-Item $outputJpeg).Length / 1KB
            Write-Host " OK ($([math]::Round($jpegSize, 1)) KB)" -ForegroundColor $ColorSuccess
        }
        else {
            Write-Host " FAILED" -ForegroundColor $ColorError
            return $false
        }
        
        # Create WebP version
        if ($CreateWebP) {
            Write-Host "    Creating WebP ($($TargetSize)x$($TargetSize))..." -NoNewline
            $webpArgs = @(
                "convert"
                $InputPath
                "-resize", "${TargetSize}x${TargetSize}^"
                "-gravity", "center"
                "-extent", "${TargetSize}x${TargetSize}"
                "-quality", $Quality
                "-define", "webp:method=6"
                "-strip"
                $outputWebP
            )
            & magick $webpArgs 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                $webpSize = (Get-Item $outputWebP).Length / 1KB
                $savings = [math]::Round((1 - ($webpSize / $jpegSize)) * 100, 1)
                Write-Host " OK ($([math]::Round($webpSize, 1)) KB, $savings% smaller)" -ForegroundColor $ColorSuccess
            }
            else {
                Write-Host " FAILED" -ForegroundColor $ColorError
            }
        }
        
        return $true
    }
    catch {
        Write-Host " ERROR: $_" -ForegroundColor $ColorError
        return $false
    }
}

# Main script
Write-Host "`n========================================" -ForegroundColor $ColorInfo
Write-Host "  FzLounge Image Optimization Script" -ForegroundColor $ColorInfo
Write-Host "========================================`n" -ForegroundColor $ColorInfo

# Check ImageMagick installation
Write-Host "Checking ImageMagick installation..." -NoNewline
if (-not (Test-ImageMagick)) {
    Write-Host " NOT FOUND" -ForegroundColor $ColorError
    Write-Host "`nImageMagick is required but not installed or not in PATH." -ForegroundColor $ColorError
    Write-Host "Download from: https://imagemagick.org/script/download.php#windows" -ForegroundColor $ColorWarning
    Write-Host "After installation, add ImageMagick to your PATH environment variable.`n" -ForegroundColor $ColorWarning
    exit 1
}
Write-Host " OK" -ForegroundColor $ColorSuccess

# Check if originals folder exists
if (-not (Test-Path $OriginalsPath)) {
    Write-Host "`nError: Originals folder not found: $OriginalsPath" -ForegroundColor $ColorError
    Write-Host "Please place your images in this folder first.`n" -ForegroundColor $ColorWarning
    exit 1
}

# Get all image files
$imageFiles = Get-ChildItem -Path $OriginalsPath -Include *.jpg,*.jpeg,*.png,*.gif,*.bmp -Recurse
if ($imageFiles.Count -eq 0) {
    Write-Host "`nNo images found in $OriginalsPath" -ForegroundColor $ColorWarning
    Write-Host "Supported formats: JPG, PNG, GIF, BMP`n" -ForegroundColor $ColorInfo
    exit 0
}

Write-Host "`nFound $($imageFiles.Count) image(s) to process" -ForegroundColor $ColorInfo
Write-Host "Output folder: $OptimizedPath" -ForegroundColor $ColorInfo
Write-Host "Quality: $Quality%" -ForegroundColor $ColorInfo
Write-Host "Size mode: $Size`n" -ForegroundColor $ColorInfo

# Ensure output folder exists
if (-not (Test-Path $OptimizedPath)) {
    New-Item -ItemType Directory -Path $OptimizedPath -Force | Out-Null
}

# Process images
$successCount = 0
$failCount = 0
$createWebP = -not $SkipWebP.IsPresent

foreach ($image in $imageFiles) {
    Write-Host "[$($successCount + $failCount + 1)/$($imageFiles.Count)] $($image.Name)" -ForegroundColor $ColorInfo
    
    $success = $false
    
    if ($Size -eq "card" -or $Size -eq "both") {
        $success = Optimize-ProductImage -InputPath $image.FullName -OutputPath $OptimizedPath -TargetSize $CardSize -Quality $Quality -CreateWebP $createWebP
    }
    
    if ($Size -eq "detail" -or $Size -eq "both") {
        # For detail size, save with -detail suffix
        $detailOutput = $OptimizedPath
        if ($Size -eq "both") {
            # If processing both, create a subfolder for detail images
            $detailOutput = Join-Path $OptimizedPath "detail"
            if (-not (Test-Path $detailOutput)) {
                New-Item -ItemType Directory -Path $detailOutput -Force | Out-Null
            }
        }
        $detailSuccess = Optimize-ProductImage -InputPath $image.FullName -OutputPath $detailOutput -TargetSize $DetailSize -Quality $Quality -CreateWebP $createWebP
        $success = $success -or $detailSuccess
    }
    
    if ($success) {
        $successCount++
    }
    else {
        $failCount++
    }
    
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor $ColorInfo
Write-Host "  Processing Complete!" -ForegroundColor $ColorInfo
Write-Host "========================================" -ForegroundColor $ColorInfo
Write-Host "Successful: $successCount" -ForegroundColor $ColorSuccess
if ($failCount -gt 0) {
    Write-Host "Failed: $failCount" -ForegroundColor $ColorError
}
Write-Host "`nOptimized images saved to: $OptimizedPath" -ForegroundColor $ColorInfo

if ($Size -eq "both") {
    Write-Host "`nNote: Detail images (1200x1200) saved in: $OptimizedPath\detail\" -ForegroundColor $ColorWarning
}

Write-Host "`nNext steps:" -ForegroundColor $ColorInfo
Write-Host "1. Update data/products.json with the new image paths" -ForegroundColor $ColorInfo
Write-Host "2. Commit changes to Git" -ForegroundColor $ColorInfo
Write-Host "3. Push to GitHub Pages`n" -ForegroundColor $ColorInfo
