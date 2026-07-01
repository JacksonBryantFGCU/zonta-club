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
import CarouselLast from "../../assets/carousel/Carousel-last.jpeg";

export type HeroSlide = {
  src: string;
  alt: string;
  // How the photo fills the framed carousel card. Most photos look best
  // cropped to fill ("cover"); wide document-style images (e.g. the donation
  // check) are shown whole ("contain") so nothing important is cut off.
  // Defaults to "cover" when omitted.
  fit?: "cover" | "contain";
  // CSS object-position controlling which part of a "cover" photo stays in
  // view when the frame crops it (e.g. "center top" to favor faces over feet).
  // Defaults to "center" when omitted.
  position?: string;
};

export const heroSlides: HeroSlide[] = [
  { src: GroupBanner, alt: "Zonta Club of Naples members gathered at a club event" },
  { src: MallBooth, alt: "Members staffing a Zonta outreach booth" },
  { src: VolunteersFlyer, alt: "Zonta volunteers event flyer", fit: "contain" },
  // Wide group shot — show the whole frame so the member in red on the left
  // edge isn't cropped out.
  { src: GroupWithOfficer, alt: "Members standing beside the Zonta Club of Naples banner", fit: "contain" },
  // Crop higher so faces show rather than feet.
  { src: AwardPresentation, alt: "Award presentation at a Zonta event", position: "center top" },
  { src: DonationCheck, alt: "Zonta Club of Naples presenting a $30,000 donation check", fit: "contain" },
  { src: Conference, alt: "Zonta International conference session" },
  { src: HabitatRestore, alt: "Members volunteering at the Habitat ReStore" },
  { src: CarouselLast, alt: "Zonta Club of Naples members", fit: "contain" },
];
