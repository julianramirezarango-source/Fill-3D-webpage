# FILL3D PLA Turbo — Bambu Studio profiles

Custom filament presets for **Bambu Studio** (not OrcaSlicer), tuned for FILL3D PLA Turbo.

| File | Printer(s) | Inherits |
|------|-----------|----------|
| `FILL3D PLA Turbo @BBL A1.json` | Bambu Lab A1 (0.4 / 0.6 / 0.8 nozzle) | Bambu PLA Basic @BBL A1 |
| `FILL3D PLA Turbo @BBL P1S.json` | Bambu Lab P1S (0.4 nozzle) | Bambu PLA Basic @BBL P1S 0.4 nozzle |

Each preset inherits the matching Bambu system PLA profile, so it keeps all the
printer-specific cooling, bed, and retraction tuning, and only overrides the
FILL3D-specific values (temps, flow ratio, max volumetric speed, pressure
advance, bed temps, density, cost).

## Key settings (from the FILL3D PLA Turbo OrcaSlicer profile)

- Nozzle: 235 °C (first layer 230 °C), range 190–250 °C
- Bed: cool 35 / supertack 45 / textured 55 / smooth 55 °C
- Max volumetric speed: 32 mm³/s
- Flow ratio: 0.98
- Pressure advance: 0.036 (adaptive PA enabled)
- Cooling: 100 % fan, min layer time 4 s
- Density: 1.31 g/cm³

## How to import into Bambu Studio

1. Open **Bambu Studio**.
2. Select your printer (A1 or P1S) in the top-right printer dropdown.
3. Go to the **Filament** dropdown → **Add/Remove presets…** is not needed —
   instead use the top menu: **File → Import → Import Configs…**
4. Choose the matching `.json` file for your printer.
5. The preset **FILL3D PLA Turbo @BBL A1** (or **@BBL P1S**) now appears in the
   filament dropdown. Select it and slice.

> Tip: if a preset doesn't show up, make sure the printer selected matches the
> file (the A1 preset won't appear while a P1S is selected, and vice-versa).
