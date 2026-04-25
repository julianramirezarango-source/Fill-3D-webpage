# FILL3D OrcaSlicer Profile Installer
# Run from the root of your OrcaSlicer clone:
#   cd C:\Users\Julian\Claude\webpage\Claude\OrcaSlicer
#   .\add-fill3d-profiles.ps1
# (If you get a script execution error, first run: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)

$ErrorActionPreference = "Stop"

$filamentDir = "resources\profiles\OrcaFilamentLibrary\filament\FILL3D"
Write-Host "Creating directory: $filamentDir"
New-Item -ItemType Directory -Force -Path $filamentDir | Out-Null

# ── PLA Basic @base ──────────────────────────────────────────────────────────
$content = @'
{
	"type": "filament",
	"name": "FILL3D PLA Basic @base",
	"from": "system",
	"filament_id": "FILL3D002",
	"instantiation": "false",
	"inherits": "fdm_filament_pla",
	"filament_vendor": [
		"FILL3D"
	],
	"filament_type": [
		"PLA"
	],
	"filament_density": [
		"1.24"
	],
	"filament_max_volumetric_speed": [
		"54"
	],
	"enable_pressure_advance": [
		"1"
	],
	"filament_flow_ratio": [
		"0.95"
	],
	"filament_retraction_length": [
		"0.2"
	],
	"nozzle_temperature": [
		"235"
	],
	"nozzle_temperature_initial_layer": [
		"230"
	],
	"pressure_advance": [
		"0.021"
	],
	"slow_down_layer_time": [
		"0"
	]
}
'@
Set-Content -Path "$filamentDir\FILL3D PLA Basic @base.json" -Value $content -NoNewline
Write-Host "  Written: FILL3D PLA Basic @base.json"

# ── PLA Basic @System ────────────────────────────────────────────────────────
$content = @'
{
	"type": "filament",
	"name": "FILL3D PLA Basic @System",
	"from": "system",
	"setting_id": "FILL3D002SYS",
	"instantiation": "true",
	"inherits": "FILL3D PLA Basic @base",
	"compatible_printers": []
}
'@
Set-Content -Path "$filamentDir\FILL3D PLA Basic @System.json" -Value $content -NoNewline
Write-Host "  Written: FILL3D PLA Basic @System.json"

# ── PETG @base ───────────────────────────────────────────────────────────────
$content = @'
{
	"type": "filament",
	"name": "FILL3D PETG @base",
	"from": "system",
	"filament_id": "FILL3D003",
	"instantiation": "false",
	"inherits": "fdm_filament_pet",
	"filament_vendor": [
		"FILL3D"
	],
	"filament_type": [
		"PETG"
	],
	"filament_density": [
		"1.27"
	],
	"filament_max_volumetric_speed": [
		"28"
	],
	"enable_pressure_advance": [
		"1"
	],
	"filament_flow_ratio": [
		"0.94"
	],
	"filament_retraction_length": [
		"0.2"
	],
	"hot_plate_temp": [
		"80"
	],
	"hot_plate_temp_initial_layer": [
		"80"
	],
	"nozzle_temperature": [
		"265"
	],
	"nozzle_temperature_initial_layer": [
		"265"
	],
	"nozzle_temperature_range_high": [
		"285"
	],
	"nozzle_temperature_range_low": [
		"230"
	],
	"pressure_advance": [
		"0.059"
	],
	"slow_down_layer_time": [
		"0"
	]
}
'@
Set-Content -Path "$filamentDir\FILL3D PETG @base.json" -Value $content -NoNewline
Write-Host "  Written: FILL3D PETG @base.json"

# ── PETG @System ─────────────────────────────────────────────────────────────
$content = @'
{
	"type": "filament",
	"name": "FILL3D PETG @System",
	"from": "system",
	"setting_id": "FILL3D003SYS",
	"instantiation": "true",
	"inherits": "FILL3D PETG @base",
	"compatible_printers": []
}
'@
Set-Content -Path "$filamentDir\FILL3D PETG @System.json" -Value $content -NoNewline
Write-Host "  Written: FILL3D PETG @System.json"

# ── PP @base ─────────────────────────────────────────────────────────────────
$content = @'
{
	"type": "filament",
	"name": "FILL3D PP @base",
	"from": "system",
	"filament_id": "FILL3D004",
	"instantiation": "false",
	"inherits": "fdm_filament_pp",
	"filament_vendor": [
		"FILL3D"
	],
	"filament_type": [
		"PP"
	],
	"filament_density": [
		"0.93"
	],
	"filament_max_volumetric_speed": [
		"14"
	],
	"additional_cooling_fan_speed": [
		"0"
	],
	"close_fan_the_first_x_layers": [
		"5"
	],
	"during_print_exhaust_fan_speed": [
		"0"
	],
	"enable_pressure_advance": [
		"1"
	],
	"fan_max_speed": [
		"60"
	],
	"fan_min_speed": [
		"0"
	],
	"filament_flow_ratio": [
		"1.045"
	],
	"filament_retraction_length": [
		"0.2"
	],
	"hot_plate_temp": [
		"100"
	],
	"hot_plate_temp_initial_layer": [
		"100"
	],
	"nozzle_temperature": [
		"300"
	],
	"nozzle_temperature_initial_layer": [
		"295"
	],
	"overhang_fan_threshold": [
		"25%"
	],
	"pressure_advance": [
		"0.085"
	],
	"slow_down_layer_time": [
		"10"
	]
}
'@
Set-Content -Path "$filamentDir\FILL3D PP @base.json" -Value $content -NoNewline
Write-Host "  Written: FILL3D PP @base.json"

# ── PP @System ───────────────────────────────────────────────────────────────
$content = @'
{
	"type": "filament",
	"name": "FILL3D PP @System",
	"from": "system",
	"setting_id": "FILL3D004SYS",
	"instantiation": "true",
	"inherits": "FILL3D PP @base",
	"compatible_printers": []
}
'@
Set-Content -Path "$filamentDir\FILL3D PP @System.json" -Value $content -NoNewline
Write-Host "  Written: FILL3D PP @System.json"

# ── PPCF @base ───────────────────────────────────────────────────────────────
$content = @'
{
	"type": "filament",
	"name": "FILL3D PPCF @base",
	"from": "system",
	"filament_id": "FILL3D005",
	"instantiation": "false",
	"inherits": "fdm_filament_pp",
	"filament_vendor": [
		"FILL3D"
	],
	"filament_type": [
		"PP"
	],
	"filament_density": [
		"0.97"
	],
	"filament_max_volumetric_speed": [
		"17"
	],
	"additional_cooling_fan_speed": [
		"0"
	],
	"close_fan_the_first_x_layers": [
		"5"
	],
	"during_print_exhaust_fan_speed": [
		"0"
	],
	"enable_pressure_advance": [
		"1"
	],
	"fan_max_speed": [
		"80"
	],
	"fan_min_speed": [
		"0"
	],
	"filament_flow_ratio": [
		"1.015"
	],
	"filament_retraction_length": [
		"0.2"
	],
	"hot_plate_temp": [
		"80"
	],
	"hot_plate_temp_initial_layer": [
		"80"
	],
	"nozzle_temperature": [
		"300"
	],
	"nozzle_temperature_initial_layer": [
		"295"
	],
	"overhang_fan_threshold": [
		"25%"
	],
	"pressure_advance": [
		"0.044"
	],
	"slow_down_layer_time": [
		"10"
	]
}
'@
Set-Content -Path "$filamentDir\FILL3D PPCF @base.json" -Value $content -NoNewline
Write-Host "  Written: FILL3D PPCF @base.json"

# ── PPCF @System ─────────────────────────────────────────────────────────────
$content = @'
{
	"type": "filament",
	"name": "FILL3D PPCF @System",
	"from": "system",
	"setting_id": "FILL3D005SYS",
	"instantiation": "true",
	"inherits": "FILL3D PPCF @base",
	"compatible_printers": []
}
'@
Set-Content -Path "$filamentDir\FILL3D PPCF @System.json" -Value $content -NoNewline
Write-Host "  Written: FILL3D PPCF @System.json"

# ── PA @base ─────────────────────────────────────────────────────────────────
$content = @'
{
	"type": "filament",
	"name": "FILL3D PA @base",
	"from": "system",
	"filament_id": "FILL3D006",
	"instantiation": "false",
	"inherits": "fdm_filament_pa",
	"filament_vendor": [
		"FILL3D"
	],
	"filament_type": [
		"PA"
	],
	"filament_density": [
		"1.04"
	],
	"filament_max_volumetric_speed": [
		"18"
	],
	"close_fan_the_first_x_layers": [
		"10"
	],
	"during_print_exhaust_fan_speed": [
		"0"
	],
	"enable_pressure_advance": [
		"1"
	],
	"fan_cooling_layer_time": [
		"5"
	],
	"filament_flow_ratio": [
		"0.975"
	],
	"filament_retraction_length": [
		"2"
	],
	"hot_plate_temp": [
		"100"
	],
	"hot_plate_temp_initial_layer": [
		"100"
	],
	"nozzle_temperature": [
		"275"
	],
	"nozzle_temperature_initial_layer": [
		"275"
	],
	"pressure_advance": [
		"0.038"
	],
	"slow_down_layer_time": [
		"1"
	]
}
'@
Set-Content -Path "$filamentDir\FILL3D PA @base.json" -Value $content -NoNewline
Write-Host "  Written: FILL3D PA @base.json"

# ── PA @System ───────────────────────────────────────────────────────────────
$content = @'
{
	"type": "filament",
	"name": "FILL3D PA @System",
	"from": "system",
	"setting_id": "FILL3D006SYS",
	"instantiation": "true",
	"inherits": "FILL3D PA @base",
	"compatible_printers": []
}
'@
Set-Content -Path "$filamentDir\FILL3D PA @System.json" -Value $content -NoNewline
Write-Host "  Written: FILL3D PA @System.json"

# ── PETG CF @base ────────────────────────────────────────────────────────────
$content = @'
{
	"type": "filament",
	"name": "FILL3D PETG CF @base",
	"from": "system",
	"filament_id": "FILL3D007",
	"instantiation": "false",
	"inherits": "fdm_filament_pet",
	"filament_vendor": [
		"FILL3D"
	],
	"filament_type": [
		"PETG-CF"
	],
	"filament_density": [
		"1.30"
	],
	"filament_max_volumetric_speed": [
		"12"
	],
	"additional_cooling_fan_speed": [
		"30"
	],
	"enable_pressure_advance": [
		"1"
	],
	"fan_max_speed": [
		"60"
	],
	"fan_min_speed": [
		"20"
	],
	"filament_flow_ratio": [
		"0.95"
	],
	"filament_retraction_length": [
		"0.2"
	],
	"hot_plate_temp": [
		"75"
	],
	"hot_plate_temp_initial_layer": [
		"80"
	],
	"nozzle_temperature": [
		"245"
	],
	"nozzle_temperature_initial_layer": [
		"240"
	],
	"nozzle_temperature_range_high": [
		"265"
	],
	"nozzle_temperature_range_low": [
		"230"
	],
	"pressure_advance": [
		"0.04"
	],
	"slow_down_layer_time": [
		"6"
	]
}
'@
Set-Content -Path "$filamentDir\FILL3D PETG CF @base.json" -Value $content -NoNewline
Write-Host "  Written: FILL3D PETG CF @base.json"

# ── PETG CF @System ──────────────────────────────────────────────────────────
$content = @'
{
	"type": "filament",
	"name": "FILL3D PETG CF @System",
	"from": "system",
	"setting_id": "FILL3D007SYS",
	"instantiation": "true",
	"inherits": "FILL3D PETG CF @base",
	"compatible_printers": []
}
'@
Set-Content -Path "$filamentDir\FILL3D PETG CF @System.json" -Value $content -NoNewline
Write-Host "  Written: FILL3D PETG CF @System.json"

# ── Update OrcaFilamentLibrary.json ──────────────────────────────────────────
Write-Host ""
Write-Host "Updating OrcaFilamentLibrary.json..."

$libPath = "resources\profiles\OrcaFilamentLibrary.json"
$libJson = Get-Content $libPath -Raw | ConvertFrom-Json

$newEntries = @(
    [PSCustomObject]@{ name = "FILL3D PLA Basic @base";  sub_path = "filament/FILL3D/FILL3D PLA Basic @base.json" },
    [PSCustomObject]@{ name = "FILL3D PLA Basic @System"; sub_path = "filament/FILL3D/FILL3D PLA Basic @System.json" },
    [PSCustomObject]@{ name = "FILL3D PETG @base";       sub_path = "filament/FILL3D/FILL3D PETG @base.json" },
    [PSCustomObject]@{ name = "FILL3D PETG @System";     sub_path = "filament/FILL3D/FILL3D PETG @System.json" },
    [PSCustomObject]@{ name = "FILL3D PP @base";         sub_path = "filament/FILL3D/FILL3D PP @base.json" },
    [PSCustomObject]@{ name = "FILL3D PP @System";       sub_path = "filament/FILL3D/FILL3D PP @System.json" },
    [PSCustomObject]@{ name = "FILL3D PPCF @base";       sub_path = "filament/FILL3D/FILL3D PPCF @base.json" },
    [PSCustomObject]@{ name = "FILL3D PPCF @System";     sub_path = "filament/FILL3D/FILL3D PPCF @System.json" },
    [PSCustomObject]@{ name = "FILL3D PA @base";         sub_path = "filament/FILL3D/FILL3D PA @base.json" },
    [PSCustomObject]@{ name = "FILL3D PA @System";       sub_path = "filament/FILL3D/FILL3D PA @System.json" },
    [PSCustomObject]@{ name = "FILL3D PETG CF @base";    sub_path = "filament/FILL3D/FILL3D PETG CF @base.json" },
    [PSCustomObject]@{ name = "FILL3D PETG CF @System";  sub_path = "filament/FILL3D/FILL3D PETG CF @System.json" }
)

$existingNames = $libJson.filament_list | ForEach-Object { $_.name }
$toAdd = $newEntries | Where-Object { $existingNames -notcontains $_.name }

if ($toAdd.Count -eq 0) {
    Write-Host "  All entries already present — no changes needed."
} else {
    $libJson.filament_list = $libJson.filament_list + $toAdd
    $libJson | ConvertTo-Json -Depth 10 | Set-Content $libPath
    Write-Host "  Added $($toAdd.Count) entries."
}

# ── Git commit ───────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Staging and committing..."
git add "resources/profiles/OrcaFilamentLibrary/filament/FILL3D/"
git add "resources/profiles/OrcaFilamentLibrary.json"
git status --short
git commit -m "Add FILL3D filament profiles: PLA Basic, PETG, PETG CF, PP, PPCF, PA"

Write-Host ""
Write-Host "Pushing to GitHub..."
git push origin add-fill3d-additional-profiles

Write-Host ""
Write-Host "Done! Now open a Pull Request at:"
Write-Host "  https://github.com/julianramirezarango-source/OrcaSlicer/compare/add-fill3d-additional-profiles"
