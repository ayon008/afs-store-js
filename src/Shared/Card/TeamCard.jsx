import React, { useState } from 'react';
import default_image from "../../../public/assets/images/Team/Group-1-3.png.webp"
import Image from 'next/image';

import moment from "moment";
import PopUp from '../PopUp/PopUp';
// import "moment/locale/fr";

// moment.locale("fr");

const TeamCard = ({ member }) => {
    const memberData = member?.acf;
    const name = memberData?.member_name || "Member Name";
    const jobTitle = memberData?.memer_job_role || "Job Title";
    const photoUrl = memberData?.primary_image?.url || default_image;
    const secondPhotoUrl = memberData?.casual_image?.url || photoUrl;
    const pop_up = memberData?.popbtn_id === "hide" ? false : true;
    const first_name = memberData?.first_name || "";
    const last_name = memberData?.last_name || "";
    const join_date = memberData["depuis_quelle_annee_travaillez-vous_chez_foil_and_co_"];
    const email = memberData["e-mail"];
    const linkedIn = memberData["si_vous_le_souhaitez_partagez_vos_liens_de_reseaux_professionnels_"];
    const missions = memberData["quelles_sont_vos_missions_"];
    const role = memberData["vous_pouvez_decrire_en_quelques_mots_ce_que_vous_appreciez_dans_votre_role_"];
    const last_line = memberData["vous_pouvez_partagez_une_anecdote_un_souvenir_ou_un_moment_marquant_vecu_chez_foil_and_co_"];


    const [isOpen, setOpen] = useState(false);

    return (
        <div>
            <div className='text-white aspect-[351/484] bg-[#11111199] w-full h-auto group relative overflow-hidden rounded-sm'>
                {/* 1st Image */}
                <Image
                    src={photoUrl}
                    alt={name}
                    className='
                    w-full h-full object-cover object-center absolute inset-0
                    transition-opacity duration-300
                    [transition-timing-function:cubic-bezier(.23,1,.32,1)]
                    opacity-100 group-hover:opacity-0
                '
                    width={351}
                    height={492}
                />
                {/* Hover Image */}
                <Image
                    src={secondPhotoUrl}
                    alt={name}
                    className='
                    w-full h-full object-cover object-center absolute inset-0
                    transition-opacity duration-300
                    [transition-timing-function:cubic-bezier(.23,1,.32,1)]
                    opacity-0 group-hover:opacity-100
                '
                    width={351}
                    height={492}
                />

                <div className='absolute left-0 right-0 bottom-0 lg:px-4 px-[10px] pt-[10px] lg:pt-4 lg:pb-6 pb-[16px] group-hover:backdrop-blur-[10px] z-10'>
                    <div className='space-y-2'>
                        <p className='font-bold lg:text-[21px] text-base leading-[100%]'>{name}</p>
                        <p className='lg:text-lg text-sm font-medium leading-[125%]'>{jobTitle}</p>
                        {
                            pop_up && <div onClick={() => setOpen(true)} className='flex items-center border-white w-fit cursor-pointer border-b'>
                                <p className='lg:text-lg text-sm font-medium leading-[125%]'>VOIR PLUS</p>
                                <svg width="20" height="20" className='text-white' viewBox="0 0 24 24" fill="none">
                                    <path d="M19 5L5 19M19 5H6.4M19 5V17.6" stroke="white" strokeWidth="2" />
                                </svg>
                            </div>
                        }
                    </div>
                </div>
            </div>


            <PopUp isOpen={isOpen}>
                <div className='w-[90%] mx-auto bg-white/95 max-w-[1280px] lg:h-[80%] h-fit flex lg:flex-row flex-col items-stretch justify-center rounded-3xl overflow-hidden shadow-xl'>
                    <div className='lg:w-1/2 w-full h-full lg:py-10 py-5 lg:px-5 px-5 relative'>
                        <h2 className='global-h2 uppercase'>
                            <span>{first_name} </span>
                            <span className='text-[#248FEB]'>{last_name}</span>
                        </h2>
                        <div className='overflow-y-scroll h-full lg:pb-10 pb-5 popup-scroll-bar'>
                            <div className='mt-6'>
                                <p className='text-base font-medium uppercase'>Début chez Foil And Co.</p>
                                <h4 className='text-lg font-normal text-gray-500 mt-1'>
                                    {join_date}
                                </h4>
                            </div>
                            <div className='mt-4'>
                                <p className='text-base uppercase'>Missions</p>
                                <p className='text-base leading-[24px] text-gray-500 mt-1'>
                                    {missions}
                                </p>
                            </div>
                            {
                                role &&
                                <div className='mt-4'>
                                    <p className='text-base uppercase'>Ce que vous aimez dans votre rôle</p>
                                    <p className='text-base leading-[24px] text-gray-500 mt-1'>
                                        {role}
                                    </p>
                                </div>
                            }
                            {
                                last_line && <div className='mt-4'>
                                    <p className='text-base uppercase'>Un souvenir marquant chez Foil And Co.</p>
                                    <p className='text-base leading-[24px] text-gray-500 mt-1'>
                                        {last_line}
                                    </p>
                                </div>
                            }
                            <div className='mt-4 flex items-center gap-4'>
                                {
                                    email && <a href={`mailto:${email}`}>
                                        <button className="flex items-center gap-1 bg-black py-[10px] px-6 rounded-3xl">
                                            <span className="text-lg leading-[20px] text-white">Email</span>
                                            <svg width="20" height="20" className="text-white" viewBox="0 0 24 24" fill="none">
                                                <path d="M19 5L5 19M19 5H6.4M19 5V17.6" stroke="white" strokeWidth="2" />
                                            </svg>
                                        </button>
                                    </a>
                                }

                                {
                                    linkedIn && <a href={linkedIn} target='_blank'>
                                        <button className='flex items-center gap-1 bg-black py-[10px] px-6 rounded-3xl'>
                                            <span className='text-lg leading-[20px] text-white'>LinkedIn</span>
                                            <svg width="20" height="20" className='text-white' viewBox="0 0 24 24" fill="none">
                                                <path d="M19 5L5 19M19 5H6.4M19 5V17.6" stroke="white" strokeWidth="2" />
                                            </svg>
                                        </button>
                                    </a>
                                }
                            </div>
                            <div onClick={() => setOpen(!isOpen)} className='flex items-center justify-center absolute top-6 right-6 w-10 h-10 rounded-full bg-white cursor-pointer lg:hidden'>
                                X
                            </div>
                        </div>
                    </div>
                    <div className='lg:w-1/2 w-full lg:block hidden group h-full relative'>
                        {/* 1st Image */}
                        <Image
                            src={photoUrl}
                            alt={name}
                            className='
                    w-full h-full object-cover object-center absolute inset-0
                    transition-opacity duration-300
                    [transition-timing-function:cubic-bezier(.23,1,.32,1)]
                    opacity-100 group-hover:opacity-0
                '
                            width={351}
                            height={492}
                        />
                        {/*  */}
                        {/* Hover Image */}
                        <Image
                            src={secondPhotoUrl}
                            alt={name}
                            className='
                    w-full h-full object-cover object-center absolute inset-0
                    transition-opacity duration-300
                    [transition-timing-function:cubic-bezier(.23,1,.32,1)]
                    opacity-0 group-hover:opacity-100
                '
                            width={351}
                            height={492}
                        />
                        <div onClick={() => setOpen(!isOpen)} className='flex items-center justify-center absolute top-6 right-6 w-10 h-10 rounded-full bg-white cursor-pointer'>
                            X
                        </div>
                    </div>
                </div>
            </PopUp>

        </div>
    );
};

export default TeamCard;
