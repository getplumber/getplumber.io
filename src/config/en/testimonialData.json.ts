import NicolasPAvatar from "../../assets/testimonials/nicolas_p.jpeg";
import OlivierLAvatar from "../../assets/testimonials/olivier_l.jpeg";
import SteveAAvatar from "../../assets/testimonials/steve_a.jpeg";
import YannHAvatar from "../../assets/testimonials/yann_h.png";
import LucasDAvatar from "../../assets/testimonials/lucas_d.png";
import { type TestimonialItem } from "../types/configDataTypes";

export const testimonialData: TestimonialItem[] = [
  {
    avatar: OlivierLAvatar,
    name: "Olivier LAVAUX",
    title: "CISO at Numspot",
    testimonial:
      "Numspot requires continuous monitoring of its CI/CD pipeline compliance. Auditability is a critical focus to ensure that pipeline security processes do not deviate over time.",
  },
  {
    avatar: NicolasPAvatar,
    name: "Nicolas PETROUSSENKO",
    title: "COO at Point Base",
    testimonial:
      "We are both a consulting firm and a software publisher. With Plumber, we empower our clients to achieve Security by Design while enabling our developers to build compliant pipelines effortlessly. It transforms compliance from a manual burden into an automated, auditable process.",
  },
  {
    avatar: YannHAvatar,
    name: "Yann HILLEREAU",
    title: "IT Manager at FDI Access",
    testimonial:
      "Compliance is not just about the product. We must also prove that the way we build and deliver it is secure.",
  },
  {
    avatar: SteveAAvatar,
    name: "Steve ALBERT",
    title: "Head of Operations at Numspot",
    testimonial:
      "Numspot's sovereign platform is intentionally designed to incorporate security and compliance as fundamental elements, embedded into every pipeline from day one, providing the level of security and compliance needed to navigate qualifications and certifications with peace of mind.",
  },
  {
    avatar: LucasDAvatar,
    name: "Lucas Delcroix-Eustache",
    title: "CTO at Libération",
    testimonial:
      "We needed visibility first. Standardization came next. Now our CI/CD pipelines are clear, consistent, and easier to maintain.",
  },
];

export default testimonialData;
