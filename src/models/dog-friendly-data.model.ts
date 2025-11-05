export interface Park {
  naziv: string;
  adresa: string;
  opis: string;
  tip: 'službeno' | 'lokalna_tajna';
  latitude: number;
  longitude: number;
}

export interface PetShop {
  naziv: string;
  adresa: string;
  radno_vrijeme: string;
  specijalizacija: string;
  latitude: number;
  longitude: number;
}

export interface Veterinarian {
  naziv: string;
  adresa: string;
  telefon: string;
  hitna_sluzba: boolean;
  latitude: number;
  longitude: number;
}

export interface DogFriendlyData {
  parkovi_i_setnice: Park[];
  pet_shopovi: PetShop[];
  veterinari: Veterinarian[];
  lokalne_smjernice: string[];
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: WebSource;
}