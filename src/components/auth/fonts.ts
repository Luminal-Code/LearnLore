import { DM_Serif_Display, Nunito } from "next/font/google";

export const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: ["400"] });

export const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});
