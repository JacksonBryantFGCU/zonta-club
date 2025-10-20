import groq from "groq";
import { sanity } from "../lib/sanityClient";
import { queryKeys } from "../lib/queryKeys";

export interface Leader {
  _id: string;
  name: string;
  role: string;
  bio?: string;
  imageUrl?: string;
}

const leadershipQuery = groq`*[_type == "leadership"] | order(order asc) {
  _id,
  name,
  role,
  bio,
  "imageUrl": image.asset->url
}`;

export const fetchLeadership = async (): Promise<Leader[]> => {
  return await sanity.fetch(leadershipQuery);
};

export const leadershipKeys = {
  all: queryKeys.leadership,
};