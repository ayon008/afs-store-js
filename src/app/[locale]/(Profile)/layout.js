import '../globals.css';
import { alliance } from '@/fonts/Alliance';
import NavItems from './Navitem';
import { getAuthenticatedUser } from '../../actions/WC/Auth/getAuth';


export const metadata = {
    title: 'Mon profil - AFS',
    description: 'Gérez votre compte et vos informations personnelles sur AFS. Découvrez vos commandes, préférences et historique.',
    icons: {
        icon: '/favicon.ico',
    },
    openGraph: {
        type: 'website',
        title: 'Mon profil - AFS',
        description: 'Gérez votre compte et vos informations personnelles sur AFS. Découvrez vos commandes, préférences et historique.',
        url: 'https://afs-foiling.com/mon-compte',
        siteName: 'AFS',
        images: [
            {
                url: 'https://afs-foiling.com/wp-content/uploads/2024/02/Fly2023-7-1-1.png',
                width: 1920,
                height: 1484,
                alt: 'Mon profil AFS',
                type: 'image/png',
            },
        ],
        publishedTime: '2024-01-14T18:49:39+01:00',
        modifiedTime: '2025-12-12T12:00:00+01:00',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Mon profil - AFS',
        description: 'Gérez votre compte et vos informations personnelles sur AFS. Découvrez vos commandes, préférences et historique.',
        images: ['https://afs-foiling.com/wp-content/uploads/2024/02/Fly2023-7-1-1.png'],
        creator: '@upwork13',
    },
    other: {
        'og:updated_time': '2025-12-12T12:00:00+01:00',
        'twitter:label1': 'Écrit par',
        'twitter:data1': 'upwork13',
    },
};



export default async function RootLayout({ children }) {

    const user = await getAuthenticatedUser();

    return (
        <html lang="en" className={alliance.className}>
            <body className="font-alliance">
                <main className='global-padding pt-4 global-margin max-w-[1920px] mx-auto'>
                    <div className=''>
                        <div className='pb-10 global-b-bottom'>
                            <h1 className='global-h1'>Bonjour, {user?.last_name}</h1>
                        </div>
                    </div>
                    <div className='flex items-start justify-between xl:flex-row flex-col gap-10 mt-10'>
                        {/* Side Bar */}
                        <aside className='block xl:max-w-[320px] xl:min-w-[250px] w-full xl:basis-[30%_0_0] aside-nav'>
                            <h3 className='uppercase leading-[100%] bg-[#1F1F1F] p-[6px] text-white text-xl font-bold'>Your Profile</h3>
                            <NavItems />
                        </aside>
                        {/* Content */}
                        <div className='flex-1 p-[clamp(1.25rem,0.099rem+2.401vw,2.5rem)] bg-[#F0F0F0]'>
                            {children}
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}