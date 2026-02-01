import Bbmid from "@/app/components/Landings/Bbmid";
import Ucarve from "@/app/components/Landings/Ucarve";
import UltraHA from "@/app/components/Landings/UltraHA";


export function getProductLanding(key) {
    const map = {
        u_carve: Ucarve,
        blackBirdMid: Bbmid,
        Ultra_avant: UltraHA
    };

    return map[key]
}