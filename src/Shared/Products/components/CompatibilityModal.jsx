import React from 'react';
import { X } from "lucide-react";
import PopUp from '../../PopUp/PopUp';

const CompatibilityModal = ({ isOpen, setOpen, content, t }) => {
    return (
        <PopUp isOpen={isOpen} fn={setOpen}>
            <div onClick={(e) => e.stopPropagation()} className='bg-white max-w-[920px] w-[95%] max-h-[80vh] overflow-x-hidden overflow-y-scroll p-5 relative mx-auto rounded-[4px]'>
                <div className='global-b-bottom-d pb-2'>
                    {/* Absolute Button for closing Pop Up */}
                    <button onClick={() => setOpen(false)} className='border border-black rounded-full w-fit h-fit p-[5px] absolute top-[10px] right-4 cursor-pointer '>
                        <X className="w-4 h-4" />
                    </button>
                    <h2 className='text-[clamp(1.375rem,1.1448rem+0.4802vw,1.625rem)] leading-[100%] font-bold'>{t("guide")}</h2>
                </div>
                <div className='lg:mt-4 mt-0'>
                    <div
                        className="scroll-bar faq"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </PopUp>
    );
};

export default CompatibilityModal;
