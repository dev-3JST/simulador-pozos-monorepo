export interface Pozo {
  id: number;
  nombre: string;
  ubicacion: string;
  nivel_estatico_m: string; // MySQL devuelve DECIMAL como string
  nivel_dinamico_m: string;
  diametro_pulgadas: string;
  activo: number;
}

export interface Bomba {
  id: number;
  marca: string;
  modelo: string;
  potencia_hp: string;
  caudal_max_lpm: string;
  altura_max_m: string;
  eficiencia_nominal: string;
}
