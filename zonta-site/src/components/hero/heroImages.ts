// zonta-site/src/components/hero/heroImages.ts
//
// Shared image list for the home page hero carousel.

import GroupBanner from "../../assets/carousel/group-banner.jpg";
import MallBooth from "../../assets/carousel/mall-booth.jpeg";
import VolunteersFlyer from "../../assets/carousel/volunteers-flyer.jpg";
import GroupWithOfficer from "../../assets/carousel/group-with-officer.jpeg";
import AwardPresentation from "../../assets/carousel/award-presentation.jpg";
import DonationCheck from "../../assets/carousel/donation-check.jpg";
import Conference from "../../assets/carousel/conference.jpeg";
import HabitatRestore from "../../assets/carousel/habitat-restore.jpg";
import PhotoCollage from "../../assets/carousel/photo-collage.png";

export type HeroSlide = {
  src: string;
  alt: string;
  // How the photo fills the framed carousel card. Most photos look best
  // cropped to fill ("cover"); wide document-style images (e.g. the donation
  // check) are shown whole ("contain") so nothing important is cut off.
  // Defaults to "cover" when omitted.
  fit?: "cover" | "contain";
};

export const heroSlides: HeroSlide[] = [
  { src: GroupBanner, alt: "Zonta Club of Naples members gathered at a club event" },
  { src: MallBooth, alt: "Members staffing a Zonta outreach booth" },
  { src: VolunteersFlyer, alt: "Zonta volunteers event flyer", fit: "contain" },
  { src: GroupWithOfficer, alt: "Members standing beside the Zonta Club of Naples banner" },
  { src: AwardPresentation, alt: "Award presentation at a Zonta event" },
  { src: DonationCheck, alt: "Zonta Club of Naples presenting a $30,000 donation check", fit: "contain" },
  { src: Conference, alt: "Zonta International conference session" },
  { src: HabitatRestore, alt: "Members volunteering at the Habitat ReStore" },
  { src: PhotoCollage, alt: "Collage of Zonta Club of Naples activities", fit: "contain" },
];
