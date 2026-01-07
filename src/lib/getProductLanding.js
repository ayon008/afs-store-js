import StreamLanding from "@/app/components/Landings/StreamLanding";

export function getProductLanding(key) {
    const map = {
        stream: StreamLanding,
    };

    return map[key]
}