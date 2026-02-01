import Ucarve from "@/app/components/Landings/Ucarve";


export function getProductLanding(key) {
    const map = {
        u_carve: Ucarve,
    };

    return map[key]
}