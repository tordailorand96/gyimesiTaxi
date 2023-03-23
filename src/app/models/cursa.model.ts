export interface Cursa {
  idB: string;
  nrC: string;
  totB: string;
  totTva: string;
  cota: string;
  tva: string;
}

export interface TotalInfo {
  date: Date;
  avgIncome: number;
  avgRoutes: number;
  avgDistance: number;
  avgWithCustomer: number;
  avgWithoutCustomer: number;
}

export interface Day {
  idBon: string;
  idU: string;
  distanceWithoutC: number;
  distanceWithC: number;
  distance: number;
  routes: number;
  income: number;
  codeBon: string;
  date: Date;
  curse: Cursa[];
  tva: number;
}
