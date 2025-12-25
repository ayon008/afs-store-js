import dayjs from "dayjs";

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function formatDate(dateString) {
    if (!dateString) return "";

    const d = dayjs(dateString);
    if (!d.isValid()) return "";

    return d.date() + " " + months[d.month()] + " " + d.year();
}
