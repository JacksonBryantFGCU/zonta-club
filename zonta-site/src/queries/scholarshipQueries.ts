// src/queries/scholarshipQueries.ts
import groq from "groq";
import { sanity } from "../lib/sanityClient";
import { queryKeys } from "../lib/queryKeys";

export interface Scholarship {
  _id: string;
  title: string;
  description: string;
  eligibility?: string[];
  deadline?: string;
  fileUrl?: string;
  imageUrl?: string;
}

const scholarshipQuery = groq`*[_type == "scholarship"] | order(order asc) {
  _id,
  title,
  description,
  eligibility,
  deadline,
  "fileUrl": applicationFile.asset->url,
  "imageUrl": image.asset->url
}`;

export const fetchScholarships = async (): Promise<Scholarship[]> => {
  return await sanity.fetch(scholarshipQuery);
};

export const scholarshipKeys = {
  all: queryKeys.scholarships,
};