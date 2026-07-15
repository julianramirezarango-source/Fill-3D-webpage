// lib/profiles-data.ts
// Datos de los perfiles de filamento — compartidos entre la SPA (wiki-client)
// y las páginas estáticas SEO (/perfiles-orcaslicer/, /perfiles-creality-print/).

export interface ProfileFilament {
  id: string
  name: string
  file: string
  color: string
  description: string
  specs: string
}

export const FILAMENTS: ProfileFilament[] = [
  {
    id: 'pla-basic',
    name: 'PLA Basic',
    file: 'FILL3D PLA Basic @System.json',
    color: '#4CAF50',
    description: 'Filamento estándar de ácido poliláctico. Fácil de imprimir, baja deformación y buena adhesión entre capas. Ideal para prototipos, piezas decorativas y proyectos generales.',
    specs: 'Temp. boquilla: 210–230 °C · Cama: 50–60 °C',
  },
  {
    id: 'pla-turbo',
    name: 'PLA Turbo HS',
    file: 'FILL3D PLA Turbo @System.json',
    color: '#753CFF',
    description: 'PLA de alta velocidad fabricado en Itagüí, Colombia por Fill3D. Formulado para imprimir hasta 350 mm/s con mayor resistencia mecánica y acabado premium.',
    specs: 'Temp. boquilla: 220–240 °C · Cama: 55–65 °C',
  },
  {
    id: 'petg',
    name: 'PETG',
    file: 'FILL3D PETG @System.json',
    color: '#2196F3',
    description: 'Tereftalato de polietileno con glicol. Combina la facilidad de impresión del PLA con mayor resistencia mecánica y química. Buena transparencia y flexibilidad moderada.',
    specs: 'Temp. boquilla: 230–250 °C · Cama: 70–85 °C',
  },
  {
    id: 'pp',
    name: 'PP',
    file: 'FILL3D PP @System.json',
    color: '#FF9800',
    description: 'Polipropileno. Material muy ligero, altamente resistente a químicos y a la fatiga por flexión. Ideal para bisagras vivas, contenedores y piezas de uso industrial.',
    specs: 'Temp. boquilla: 220–240 °C · Cama: 85–100 °C',
  },
  {
    id: 'ppcf',
    name: 'PP-CF',
    file: 'FILL3D PPCF @System.json',
    color: '#333333',
    description: 'Polipropileno reforzado con fibra de carbono. Mayor rigidez, resistencia térmica y estabilidad dimensional que el PP estándar. Requiere boquilla endurecida.',
    specs: 'Temp. boquilla: 230–250 °C · Cama: 90–105 °C · Boquilla: acero endurecido',
  },
  {
    id: 'pa',
    name: 'PA / Nylon',
    file: 'FILL3D PA @System.json',
    color: '#E91E63',
    description: 'Poliamida de alta performance. Excelente resistencia mecánica, al desgaste y al impacto. Ideal para engranajes, rodamientos y piezas funcionales sometidas a estrés continuo.',
    specs: 'Temp. boquilla: 240–260 °C · Cama: 70–90 °C · Secar antes de usar',
  },
]

export const CREALITY_FILAMENTS: ProfileFilament[] = [
  {
    id: 'pla-basic',
    name: 'PLA Basic',
    file: 'Fill-3D PLA Basic.json',
    color: '#4CAF50',
    description: 'Filamento estándar de ácido poliláctico. Fácil de imprimir, baja deformación y buena adhesión entre capas. Ideal para prototipos, piezas decorativas y proyectos generales.',
    specs: 'Temp. boquilla: 210–230 °C · Cama: 50–60 °C',
  },
  {
    id: 'pla-turbo',
    name: 'PLA Turbo HS',
    file: 'Fill-3D PLA Turbo.json',
    color: '#753CFF',
    description: 'PLA de alta velocidad fabricado en Itagüí, Colombia por Fill3D. Formulado para impresión rápida con mayor resistencia mecánica y acabado premium.',
    specs: 'Temp. boquilla: 220–240 °C · Cama: 55–65 °C',
  },
  {
    id: 'petg',
    name: 'PETG',
    file: 'Fill-3D PETG.json',
    color: '#2196F3',
    description: 'Tereftalato de polietileno con glicol. Combina la facilidad del PLA con mayor resistencia mecánica y química. Buena transparencia y flexibilidad moderada.',
    specs: 'Temp. boquilla: 230–250 °C · Cama: 70–85 °C',
  },
  {
    id: 'pp',
    name: 'PP',
    file: 'Fill-3D PP.json',
    color: '#FF9800',
    description: 'Polipropileno. Material muy ligero, altamente resistente a químicos y a la fatiga por flexión. Ideal para bisagras vivas, contenedores y piezas de uso industrial.',
    specs: 'Temp. boquilla: 220–240 °C · Cama: 85–100 °C',
  },
  {
    id: 'ppcf',
    name: 'PP-CF',
    file: 'Fill-3D PP-CF.json',
    color: '#333333',
    description: 'Polipropileno reforzado con fibra de carbono. Mayor rigidez, resistencia térmica y estabilidad dimensional. Requiere boquilla endurecida.',
    specs: 'Temp. boquilla: 230–250 °C · Cama: 90–105 °C · Boquilla: acero endurecido',
  },
  {
    id: 'pa',
    name: 'PA / Nylon',
    file: 'Fill-3D PA Nylon.json',
    color: '#E91E63',
    description: 'Poliamida de alta performance. Excelente resistencia mecánica, al desgaste y al impacto. Ideal para engranajes, rodamientos y piezas funcionales sometidas a estrés continuo.',
    specs: 'Temp. boquilla: 240–260 °C · Cama: 70–90 °C · Secar antes de usar',
  },
]
