import '../globals.css';
import NavItems from './Navitem';
import { getAuthenticatedUser } from '../../actions/WC/Auth/getAuth';
import { getTranslations } from 'next-intl/server';


export const metadata = {
    title: 'My Account - AFS',
    description: 'Manage your account and personal information on AFS. Discover your orders, preferences and history.',
    icons: {
        icon: '/favicon.ico',
    },
    openGraph: {
        type: 'website',
        title: 'My Account - AFS',
        description: 'Manage your account and personal information on AFS. Discover your orders, preferences and history.',
        url: 'https://afs-foiling.com/mon-compte',
        siteName: 'AFS',
        images: [
            {
                url: 'https://afs-foiling.com/wp-content/uploads/2024/02/Fly2023-7-1-1.png',
                width: 1920,
                height: 1484,
                alt: 'My Account AFS',
                type: 'image/png',
            },
        ],
        publishedTime: '2024-01-14T18:49:39+01:00',
        modifiedTime: '2025-12-12T12:00:00+01:00',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'My Account - AFS',
        description: 'Manage your account and personal information on AFS. Discover your orders, preferences and history.',
        images: ['https://afs-foiling.com/wp-content/uploads/2024/02/Fly2023-7-1-1.png'],
        creator: '@upwork13',
    },
    other: {
        'og:updated_time': '2025-12-12T12:00:00+01:00',
        'twitter:label1': 'Written by',
        'twitter:data1': 'upwork13',
    },
};



export default async function RootLayout({ children, locale }) {

    const user = await getAuthenticatedUser();
    const t = await getTranslations("profile", locale);

    return (
        <div className='global-padding pt-4 global-margin max-w-[1920px] mx-auto'>
            <div className=''>
                <div className='pb-10 global-b-bottom-d'>
                    <h1 className='global-h1'>{t("hello")}, {user?.last_name}</h1>
                </div>
            </div>
            <div className='flex items-start justify-between xl:flex-row flex-col gap-10 mt-10'>
                {/* Side Bar */}
                <aside className='block xl:sticky xl:top-[170px] xl:max-w-[320px] xl:min-w-[250px] w-full xl:basis-[30%_0_0] aside-nav'>
                    <h3 className='uppercase leading-[100%] bg-[#1F1F1F] p-[6px] text-white text-xl font-bold'>
                        {t("profile")}
                    </h3>
                    <NavItems />
                </aside>
                {/* Content */}
                <div className='flex-1 p-[clamp(1.25rem,0.099rem+2.401vw,2.5rem)] bg-[#F0F0F0]'>
                    {children}
                </div>
            </div>
        </div>
    );
}