import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
const teamImage = "/assets/images/Team/1A4A82C8-D73A-4826-B627-E39C082F1173.jpg.webp"
const image1 = "/assets/images/Team/Rectangle-4-32.png";
const image2 = "/assets/images/Team/Rectangle-6.png"
import FeatureBar from '@/Shared/Afs-Events/FeatureBar';
import Team from '@/Shared/Afs-Team/Team';
import { getTeamMember } from '@/app/actions/WC/getTeamMembers';

export const metadata = {
    title: 'AFS L’équipe - AFS Foiling',
    description: 'Meet the AFS team: designers, developers, and athletes behind our foiling gear and products.'
}

const BreadCums = () => {
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-[#999999]'>
                <Link className='inline' href={'/'}>Accueil</Link> / <span className='text-black'> L’équipe</span>
            </div>
        </div>
    )
}


const page = async () => {
    // Administration member-role=2485
    const administration = await getTeamMember(2135);
    // Marketing member-role=2122
    const marketing = await getTeamMember(2122);

    // Logistique member-role=2133
    const logistique = await getTeamMember(2133);

    // Burue member-role=2132
    const burue = await getTeamMember(2132);

    // production-plances = 2131
    const production_plances = await getTeamMember(2131);

    // production-foil = 2129
    const production_foil = await getTeamMember(2129);

    // Commerce member-role=2134
    const commerce = await getTeamMember(2134);


    return (
        <div className='max-w-[1920px] mx-auto'>
            <div className='bg-white global-padding relative pt-4'>
                <div>
                    <BreadCums />
                    <div className='lg:my-[80px] my-[40px]'>
                        <h1 className='global-h1 text-center relative'>L&apos;équipe Foil And Co.</h1>
                    </div>
                    {/* First Image Section */}
                    <div className='flex items-start gap-10 global-margin flex-col lg:flex-row'>
                        <div className='lg:w-[60%] relative'>
                            <Image src={teamImage} alt='Our Team' className='mx-auto rounded-md object-cover' />
                        </div>
                        <div className='lg:pt-10 lg:w-[40%]'>
                            <div className='max-w-[520px] lg:text-left text-center'>
                                <h2 className='lg:text-[36px] text-[32px] font-bold leading-[110%] tracking-[-0.01em]'>Des collaborateurs animés par une même passion</h2>
                                <p className='text-lg font-semibold mt-6'>Chez Foil And Co., notre équipe partage une passion commune pour l’innovation et l’excellence. Chaque membre contribue à faire avancer notre mission avec engagement, créativité et expertise, afin de vous offrir des produits et services de qualité. Découvrez les visages de ceux qui oeuvrent à la production de vos équipements favoris.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='global-margin'>
                    <Team data={{ administration, marketing, logistique, burue, production_plances, production_foil, commerce }} />
                </div>
            </div>
            {/* */}
            <div className='px-5 global-margin'>
                <div className='relative bg-black rounded-[10px] p-10'>
                    <div className='max-w-[1920px] mx-auto relative'>
                        {/* IMAGES BEHIND */}
                        <div className='z-10 relative lg:absolute lg:top-10 lg:right-10  overflow-hidden rounded-[4px]'>
                            <Image src={image1} alt='AFS_TEAM' className='lg:w-[250px] lg:h-[250px] w-[40%] h-[40%] max-w-[250px] ml-auto' />
                        </div>
                        <div>
                            {/* TEXT ABOVE EVERYTHING */}
                            <p className='lg:text-[clamp(3.125rem,.9028rem+3.4722vw,4.375rem)] text-[32px] tracking-[-.3px]
                            lg:leading-[110%] leading-[100%] font-semibold max-w-[1600px] text-white 
                            text-center uppercase z-30 relative mx-auto'>
                                <span className='text-[#1D98FF]'>Révélez votre potentiel avec nous !</span> Nous sommes à la recherches de personnes talentueuses et passionées voulant imposer de nouveaux standards dans le monde du foil et de l'équipement des sports nautiques. <span className='text-[#1D98FF]'>Rejoignez l'équipe aujourd'hui !</span>
                            </p>

                            <Link href='/' className='flex items-center justify-center lg:mt-10 mt-5'>
                                <button className='uppercase text-white text-base flex items-center gap-1 font-medium bg-[#1D98FF] lg:px-4 lg:py-[14px] px-2 py-2 rounded-[4px] z-30 relative'>
                                    <span>voir les postes</span>
                                    <svg width="20" height="20" className='text-white' viewBox="0 0 24 24" fill="none">
                                        <path d="M19 5L5 19M19 5H6.4M19 5V17.6" stroke="white" strokeWidth="2" />
                                    </svg>
                                </button>
                            </Link>
                        </div>
                        <div className='z-10 relative lg:absolute lg:left-10 lg:bottom-10 overflow-hidden rounded-[4px]'>
                            <Image src={image2} alt='AFS_TEAM' className='lg:w-[250px] lg:h-[250px] w-[40%] h-[40%] max-w-[250px]' />
                        </div>
                    </div>
                </div>
            </div>
            <FeatureBar />
        </div>
    );
};

export default page;