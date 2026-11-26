#!/bin/bash
# Second Life Passport · Health Check (macOS)
# Reads battery data straight from the battery controller and opens the Repair Station pre-filled.
set -euo pipefail
SITE="${SLP_SITE:-https://mattjunior039.github.io/second-life-passport/}"

data=$(ioreg -rn AppleSmartBattery)
design=$(echo "$data" | grep -o '"DesignCapacity"=[0-9]*' | head -1 | cut -d= -f2)
full=$(echo "$data" | grep -o '"NominalChargeCapacity"=[0-9]*' | head -1 | cut -d= -f2)
cycles=$(echo "$data" | grep -E '^\s*\|?\s*"CycleCount" = ' | head -1 | grep -o '[0-9]*$')
model=$(system_profiler SPHardwareDataType | awk -F': ' '/Model Name/{print $2; exit}')

health=$(awk -v f="$full" -v d="$design" 'BEGIN { printf "%.1f", f / d * 100 }')
echo "Model:        $model"
echo "Design:       $design mAh"
echo "Full charge:  $full mAh"
echo "Health:       $health %"
echo "Cycles:       $cycles"

enc() { python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$1"; }
url="${SITE}create/?model=$(enc "$model")&source=$(enc "macOS battery controller")&design=$design&full=$full&cycles=$cycles&unit=mAh"
echo "Opening Repair Station: $url"
open "$url"
