// zonta-server/src/utils/types.ts

export interface BaseDocument {
  _id?: string;
  _type: string;
  _createdAt?: string;
  _updatedAt?: string;
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

export interface ClubSettings extends BaseDocument {
  mission: string;
  contactEmail: string;
  address: string;
  website: string;
}