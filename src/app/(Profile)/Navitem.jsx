"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut } from "lucide-react";

// Navigation items
const NAV_ITEMS = [
    { label: "Information", href: "/my-profile", icon: "user" },
    { label: "Orders", href: "/my-profile/orders", icon: "orders" },
    { label: "Payment Methods", href: "/my-profile/payment-methods", icon: "payment" },
    { label: "SAV", href: "/demande-sav", icon: "sav" },
    { label: "Change Password", href: "/my-profile/reinitialiser-mot-de-passe", icon: "password" },
    { label: "Log Out", href: "/my-profile/logout", icon: "logout" }
];

// Custom SVG renderer for string icons
const CustomIcon = ({ name, isActive }) => {
    const cls = `${isActive ? "text-[#111]" : "text-[#808080]"} group-hover:text-[#111] w-4 h-4`;

    switch (name) {
        case "orders":
            return (
                <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
                    <path
                        d="M5 5H11M15 8V3C15 1.89543 14.1046 1 13 1H3C1.89543 1 1 1.89543 1 3V17C1 18.1046 1.89543 19 3 19H5M5 9H6M5 13H7M9.375 18.3333C8.61561 18.3333 8 18.9303 8 19.6667C8 20.403 8.61561 21 9.375 21C10.1344 21 10.75 20.403 10.75 19.6667C10.75 18.9303 10.1344 18.3333 9.375 18.3333ZM9.375 18.3333H16.9375M9.375 18.3333V9H8M16.9375 18.3333C16.1781 18.3333 15.5625 18.9303 15.5625 19.6667C15.5625 20.403 16.1781 21 16.9375 21C17.6969 21 18.3125 20.403 18.3125 19.6667C18.3125 18.9303 17.6969 18.3333 16.9375 18.3333ZM9.375 10.3333L19 11L18.3125 15.6667H9.375"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="square"
                    />
                </svg>
            );
        case "payment":
            return (
                <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16" fill="none">
                    <path
                        d="M15 5V3C15 2.46957 14.7893 1.96086 14.4142 1.58579C14.0391 1.21071 13.5304 1 13 1H3C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 1 2.46957 1 3V9C1 9.53043 1.21071 10.0391 1.58579 10.4142C1.96086 10.7893 2.46957 11 3 11H5M7 5H17C18.1046 5 19 5.89543 19 7V13C19 14.1046 18.1046 15 17 15H7C5.89543 15 5 14.1046 5 13V7C5 5.89543 5.89543 5 7 5ZM14 10C14 11.1046 13.1046 12 12 12C10.8954 12 10 11.1046 10 10C10 8.89543 10.8954 8 12 8C13.1046 8 14 8.89543 14 10Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            );
        case "sav":
            return (
                <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                        d="M13 3H16C16.2652 3 16.5196 3.10536 16.7071 3.29289C16.8946 3.48043 17 3.73478 17 4V15C17 15.5304 16.7893 16.0391 16.4142 16.4142C16.0391 16.7893 15.5304 17 15 17M15 17C14.4696 17 13.9609 16.7893 13.5858 16.4142C13.2107 16.0391 13 15.5304 13 15V2C13 1.73478 12.8946 1.48043 12.7071 1.29289C12.5196 1.10536 12.2652 1 12 1H2C1.73478 1 1.48043 1.10536 1.29289 1.29289C1.10536 1.48043 1 1.73478 1 2V14C1 14.7956 1.31607 15.5587 1.87868 16.1213C2.44129 16.6839 3.20435 17 4 17H15ZM5 5H9M5 9H9M5 13H9"
                        stroke="currentColor"
                        strokeOpacity={isActive ? 1 : 0.4}
                        strokeWidth="1.5"
                        strokeLinecap="square"
                    />
                </svg>
            );
        case "password":
            return (
                <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        d="M0.999998 5.50001V3.25001C0.999998 2.65327 0.999985 1 0.999985 1C0.999985 1 2.65326 1.00001 3.25 1.00001H5.5M0.999998 14.5V16.75C0.999998 17.3467 0.999992 19 0.999992 19C0.999992 19 2.65326 19 3.25 19H5.5M14.5 1.00001H16.75C17.3467 1.00001 19 1 19 1C19 1 19 2.65327 19 3.25001V5.50001M14.5 19H16.75C17.3467 19 19 19 19 19C19 19 19 17.3467 19 16.75V14.5M7.75 8.87501V6.62501C7.75 6.02827 7.98705 5.45598 8.40901 5.03402C8.83096 4.61206 9.40326 4.37501 10 4.37501C10.5967 4.37501 11.169 4.61206 11.591 5.03402C12.0129 5.45598 12.25 6.02827 12.25 6.62501V8.87501M6.625 8.87501H13.375C13.9963 8.87501 14.5 9.37869 14.5 10V13.375C14.5 13.9963 13.9963 14.5 13.375 14.5H6.625C6.00368 14.5 5.5 13.9963 5.5 13.375V10C5.5 9.37869 6.00368 8.87501 6.625 8.87501Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="square"
                    />
                </svg>
            );

        case "logout":
            return (
                <LogOut className={cls} />
            );
        case "user":
            return (
                <User className={cls} />
            );
        default:
            return null;
    }
};

const NavItems = () => {
    const pathname = usePathname();

    return (
        <ul className="space-y-[18px] mt-[22px] xl:block flex items-center gap-[10px] w-full">
            {NAV_ITEMS.map((item, i) => {
                const isActive = item.href
                    ? pathname === item.href || pathname.startsWith(item.href + "/")
                    : false;

                const Icon = typeof item.icon === "function" ? item.icon : null;

                return (
                    <li key={i}>
                        <Link
                            href={item.href}
                            className={`text-base font-bold leading-[100%] uppercase flex items-center gap-1 group ${isActive ? "text-[#111]" : "text-[#111]/40"
                                }`}
                        >
                            <CustomIcon name={item.icon} isActive={isActive} />
                            <span className="group-hover:text-[#111]">{item.label}</span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
};

export default NavItems;
