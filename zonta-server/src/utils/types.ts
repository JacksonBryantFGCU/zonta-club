export interface BaseDocument {
  _id?: string;
  _type: string;
  _createdAt?: string;
  _updatedAt?: string;
}

export interface Product extends BaseDocument {
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  stock?: number;
}

export interface Event extends BaseDocument {
  title: string;
  date: string;
  location?: string;
  description?: string;
  imageUrl?: string;
}

export interface Scholarship extends BaseDocument {
  title: string;
  amount: number;
  description?: string;
  deadline?: string;
}

export interface Order extends BaseDocument {
  email: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface ClubSettings extends BaseDocument {
  mission: string;
  contactEmail: string;
  address: string;
  website: string;
}