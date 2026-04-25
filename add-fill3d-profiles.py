"""
FILL3D OrcaSlicer Profile Installer
Run from the root of your OrcaSlicer clone:
  cd C:\\Users\\Julian\\Claude\\webpage\\Claude\\OrcaSlicer
  python add-fill3d-profiles.py
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
FILAMENT_DIR = os.path.join(ROOT, "resources", "profiles", "OrcaFilamentLibrary", "filament", "FILL3D")
LIB_PATH = os.path.join(ROOT, "resources", "profiles", "OrcaFilamentLibrary.json")

os.makedirs(FILAMENT_DIR, exist_ok=True)

FILES = {
    "FILL3D PLA Basic @base.json": {
        "type": "filament",
        "name": "FILL3D PLA Basic @base",
        "from": "system",
        "filament_id": "FILL3D002",
        "instantiation": "false",
        "inherits": "fdm_filament_pla",
        "filament_vendor": ["FILL3D"],
        "filament_type": ["PLA"],
        "filament_density": ["1.24"],
        "filament_max_volumetric_speed": ["54"],
        "enable_pressure_advance": ["1"],
        "filament_flow_ratio": ["0.95"],
        "filament_retraction_length": ["0.2"],
        "nozzle_temperature": ["235"],
        "nozzle_temperature_initial_layer": ["230"],
        "pressure_advance": ["0.021"],
        "slow_down_layer_time": ["0"]
    },
    "FILL3D PLA Basic @System.json": {
        "type": "filament",
        "name": "FILL3D PLA Basic @System",
        "from": "system",
        "setting_id": "FILL3D002SYS",
        "instantiation": "true",
        "inherits": "FILL3D PLA Basic @base",
        "compatible_printers": []
    },
    "FILL3D PETG @base.json": {
        "type": "filament",
        "name": "FILL3D PETG @base",
        "from": "system",
        "filament_id": "FILL3D003",
        "instantiation": "false",
        "inherits": "fdm_filament_pet",
        "filament_vendor": ["FILL3D"],
        "filament_type": ["PETG"],
        "filament_density": ["1.27"],
        "filament_max_volumetric_speed": ["28"],
        "enable_pressure_advance": ["1"],
        "filament_flow_ratio": ["0.94"],
        "filament_retraction_length": ["0.2"],
        "hot_plate_temp": ["80"],
        "hot_plate_temp_initial_layer": ["80"],
        "nozzle_temperature": ["265"],
        "nozzle_temperature_initial_layer": ["265"],
        "nozzle_temperature_range_high": ["285"],
        "nozzle_temperature_range_low": ["230"],
        "pressure_advance": ["0.059"],
        "slow_down_layer_time": ["0"]
    },
    "FILL3D PETG @System.json": {
        "type": "filament",
        "name": "FILL3D PETG @System",
        "from": "system",
        "setting_id": "FILL3D003SYS",
        "instantiation": "true",
        "inherits": "FILL3D PETG @base",
        "compatible_printers": []
    },
    "FILL3D PP @base.json": {
        "type": "filament",
        "name": "FILL3D PP @base",
        "from": "system",
        "filament_id": "FILL3D004",
        "instantiation": "false",
        "inherits": "fdm_filament_pp",
        "filament_vendor": ["FILL3D"],
        "filament_type": ["PP"],
        "filament_density": ["0.93"],
        "filament_max_volumetric_speed": ["14"],
        "additional_cooling_fan_speed": ["0"],
        "close_fan_the_first_x_layers": ["5"],
        "during_print_exhaust_fan_speed": ["0"],
        "enable_pressure_advance": ["1"],
        "fan_max_speed": ["60"],
        "fan_min_speed": ["0"],
        "filament_flow_ratio": ["1.045"],
        "filament_retraction_length": ["0.2"],
        "hot_plate_temp": ["100"],
        "hot_plate_temp_initial_layer": ["100"],
        "nozzle_temperature": ["300"],
        "nozzle_temperature_initial_layer": ["295"],
        "overhang_fan_threshold": ["25%"],
        "pressure_advance": ["0.085"],
        "slow_down_layer_time": ["10"]
    },
    "FILL3D PP @System.json": {
        "type": "filament",
        "name": "FILL3D PP @System",
        "from": "system",
        "setting_id": "FILL3D004SYS",
        "instantiation": "true",
        "inherits": "FILL3D PP @base",
        "compatible_printers": []
    },
    "FILL3D PPCF @base.json": {
        "type": "filament",
        "name": "FILL3D PPCF @base",
        "from": "system",
        "filament_id": "FILL3D005",
        "instantiation": "false",
        "inherits": "fdm_filament_pp",
        "filament_vendor": ["FILL3D"],
        "filament_type": ["PP"],
        "filament_density": ["0.97"],
        "filament_max_volumetric_speed": ["17"],
        "additional_cooling_fan_speed": ["0"],
        "close_fan_the_first_x_layers": ["5"],
        "during_print_exhaust_fan_speed": ["0"],
        "enable_pressure_advance": ["1"],
        "fan_max_speed": ["80"],
        "fan_min_speed": ["0"],
        "filament_flow_ratio": ["1.015"],
        "filament_retraction_length": ["0.2"],
        "hot_plate_temp": ["80"],
        "hot_plate_temp_initial_layer": ["80"],
        "nozzle_temperature": ["300"],
        "nozzle_temperature_initial_layer": ["295"],
        "overhang_fan_threshold": ["25%"],
        "pressure_advance": ["0.044"],
        "slow_down_layer_time": ["10"]
    },
    "FILL3D PPCF @System.json": {
        "type": "filament",
        "name": "FILL3D PPCF @System",
        "from": "system",
        "setting_id": "FILL3D005SYS",
        "instantiation": "true",
        "inherits": "FILL3D PPCF @base",
        "compatible_printers": []
    },
    "FILL3D PA @base.json": {
        "type": "filament",
        "name": "FILL3D PA @base",
        "from": "system",
        "filament_id": "FILL3D006",
        "instantiation": "false",
        "inherits": "fdm_filament_pa",
        "filament_vendor": ["FILL3D"],
        "filament_type": ["PA"],
        "filament_density": ["1.04"],
        "filament_max_volumetric_speed": ["18"],
        "close_fan_the_first_x_layers": ["10"],
        "during_print_exhaust_fan_speed": ["0"],
        "enable_pressure_advance": ["1"],
        "fan_cooling_layer_time": ["5"],
        "filament_flow_ratio": ["0.975"],
        "filament_retraction_length": ["2"],
        "hot_plate_temp": ["100"],
        "hot_plate_temp_initial_layer": ["100"],
        "nozzle_temperature": ["275"],
        "nozzle_temperature_initial_layer": ["275"],
        "pressure_advance": ["0.038"],
        "slow_down_layer_time": ["1"]
    },
    "FILL3D PA @System.json": {
        "type": "filament",
        "name": "FILL3D PA @System",
        "from": "system",
        "setting_id": "FILL3D006SYS",
        "instantiation": "true",
        "inherits": "FILL3D PA @base",
        "compatible_printers": []
    },
    "FILL3D PETG CF @base.json": {
        "type": "filament",
        "name": "FILL3D PETG CF @base",
        "from": "system",
        "filament_id": "FILL3D007",
        "instantiation": "false",
        "inherits": "fdm_filament_pet",
        "filament_vendor": ["FILL3D"],
        "filament_type": ["PETG-CF"],
        "filament_density": ["1.30"],
        "filament_max_volumetric_speed": ["12"],
        "additional_cooling_fan_speed": ["30"],
        "enable_pressure_advance": ["1"],
        "fan_max_speed": ["60"],
        "fan_min_speed": ["20"],
        "filament_flow_ratio": ["0.95"],
        "filament_retraction_length": ["0.2"],
        "hot_plate_temp": ["75"],
        "hot_plate_temp_initial_layer": ["80"],
        "nozzle_temperature": ["245"],
        "nozzle_temperature_initial_layer": ["240"],
        "nozzle_temperature_range_high": ["265"],
        "nozzle_temperature_range_low": ["230"],
        "pressure_advance": ["0.04"],
        "slow_down_layer_time": ["6"]
    },
    "FILL3D PETG CF @System.json": {
        "type": "filament",
        "name": "FILL3D PETG CF @System",
        "from": "system",
        "setting_id": "FILL3D007SYS",
        "instantiation": "true",
        "inherits": "FILL3D PETG CF @base",
        "compatible_printers": []
    },
}

print("Writing filament profile files...")
for filename, data in FILES.items():
    path = os.path.join(FILAMENT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent="\t", ensure_ascii=False)
        f.write("\n")
    print(f"  Written: {filename}")

print("\nUpdating OrcaFilamentLibrary.json...")
with open(LIB_PATH, "r", encoding="utf-8") as f:
    lib = json.load(f)

existing = {e["name"] for e in lib["filament_list"]}
new_entries = [
    {"name": n.replace(".json", ""), "sub_path": f"filament/FILL3D/{n}"}
    for n in FILES
    if n.replace(".json", "") not in existing
]

if new_entries:
    lib["filament_list"].extend(new_entries)
    with open(LIB_PATH, "w", encoding="utf-8") as f:
        json.dump(lib, f, indent="\t", ensure_ascii=False)
        f.write("\n")
    print(f"  Added {len(new_entries)} entries.")
else:
    print("  All entries already present.")

print("\nStaging changes...")
subprocess.run(["git", "add",
    "resources/profiles/OrcaFilamentLibrary/filament/FILL3D/",
    "resources/profiles/OrcaFilamentLibrary.json"], check=True)
subprocess.run(["git", "status", "--short"], check=True)

print("\nCommitting...")
subprocess.run(["git", "commit", "-m",
    "Add FILL3D filament profiles: PLA Basic, PETG, PETG CF, PP, PPCF, PA"], check=True)

print("\nPushing to GitHub...")
subprocess.run(["git", "push", "origin", "add-fill3d-additional-profiles"], check=True)

print("\nDone! Open a Pull Request at:")
print("  https://github.com/julianramirezarango-source/OrcaSlicer/compare/add-fill3d-additional-profiles")
