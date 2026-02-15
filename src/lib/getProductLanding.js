import Bbmid from "@/app/components/Landings/Bbmid";
import Ucarve from "@/app/components/Landings/Ucarve";
import UltraHA from "@/app/components/Landings/UltraHA";
import Uglide from "@/app/components/Landings/Uglide";
import aileAvantEnduro from "@/app/components/Landings/aileAvantEnduro";
import MastSkinny from "@/app/components/Landings/MastSkinny";

export function getProductLanding(key) {
  const map = {
    u_carve: Ucarve,
    blackBirdMid: Bbmid,
    Ultra_avant: UltraHA,
    u_glide: Uglide,
    aile_avant_enduro: aileAvantEnduro,
    mast_skinny: MastSkinny,
  };

  return map[key];
}
