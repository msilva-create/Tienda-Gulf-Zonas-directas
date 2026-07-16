export type ClientType = 'Pareto' | 'Normal';

export interface Client {
  id: string; // Internal unique ID
  businessId: string; // The "Id" from the CSV (Usuario)
  pointOfSale: string;
  password: string;
  type: ClientType;
}

export interface ClientPoints {
  pointOfSale: string;
  points: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsPareto: number;
  pointsNormal: number;
  imageUrls: string[];
  category?: string;
  popularity?: number;
  dateAdded?: string;
}

export interface CartItem extends Reward {
  quantity: number;
  appliedPrice: number;
}

export interface OrderDetails {
  address: string;
  receiver: string;
  city: string;
  phone: string;
}

export interface OrderLog {
  date: string;       // Columna A
  time: string;       // Columna B
  client: string;     // Columna C
  receiver: string;   // Columna D
  city: string;       // Columna E
  address: string;    // Columna F
  phone: string;      // Columna G
  items: string;      // Extra: What they bought
  points: number;     // Extra: Total points spent
}

// Simulates the structure of the CSV files requested
export interface Database {
  clients: Client[];
  points: ClientPoints[];
  rewards: Reward[];
  orders: OrderLog[];
}