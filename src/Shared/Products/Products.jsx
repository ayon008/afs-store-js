// "use client"
// import { useRouter, usePathname } from 'next/navigation';
// import React, { useState, useTransition, useEffect, useRef } from 'react';
// import RangeSlider from 'react-range-slider-input';
// import 'react-range-slider-input/dist/style.css';
// // import ProjectCard from '../../components/ProjectCard';
// // import { getProductsByCategoryId } from '../../funtions/getWooCommerce';
// // import SkeletonProjectCard from "../../Shared/Products/ProductLoader"
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { Filter, X } from 'lucide-react';
// import { useGSAP } from '@gsap/react';
// import ProductCard from '../Card/ProductCard';
// import PopUp from '../PopUp/PopUp';

// gsap.registerPlugin(ScrollTrigger);


// const Products = ({ minPrice, maxPrice, childCategories, min = null, max = null, id }) => {
//     const [value, setValue] = useState([minPrice, maxPrice]);
//     const router = useRouter();
//     const pathname = usePathname();
//     const [isPending, startTransition] = useTransition();

//     const [ids, setIds] = useState([id]);

//     const handleChange = (val) => {
//         setValue(val);
//         // Use current pathname instead of hardcoded slug so this works for any category
//         const newUrl = `${pathname}?min=${val[0]}&max=${val[1]}`;

//         // perform client navigation then refresh the server-rendered data
//         startTransition(() => {
//             router.replace(newUrl, { scroll: false });
//             router.refresh();
//         });
//     }


//     const renderCategories = (categories) => {
//         const logSelectedCategoryIds = () => {
//             const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
//             const selectedIds = Array.from(checkedBoxes).map(cb => cb.value)?.length > 0 ? Array.from(checkedBoxes).map(cb => cb.value) : id;
//             setIds(selectedIds);
//         };

//         return (
//             <ul className="space-y-3">
//                 {categories.map((cat) => (
//                     <li key={cat.id} className="flex flex-col">
//                         {/* Checkbox + Label */}
//                         <label className="flex items-center gap-2 cursor-pointer">
//                             <input
//                                 type="checkbox"
//                                 className="peer w-3 h-3 cursor-pointer accent-black"
//                                 value={cat.id}
//                                 onChange={logSelectedCategoryIds}
//                             />
//                             <span className="text-[#999] font-semibold text-[14px] leading-[16px] uppercase peer-checked:text-[#111111bf]">
//                                 {cat.name}
//                             </span>
//                         </label>

//                         {/* Children */}
//                         {Array.isArray(cat.children) && cat.children.length > 0 && (
//                             <div className="ml-6 mt-3">
//                                 {renderCategories(cat.children)}
//                             </div>
//                         )}
//                     </li>
//                 ))}
//             </ul>
//         );
//     };


//     const [productData, setProductData] = useState([]);
//     const [loader, setLoader] = useState(true);

//     useEffect(() => {
//         setLoader(true)
//         const load = async () => {
//             const data = await getProductsByCategoryId(ids, max, min);
//             setProductData(data);
//             setLoader(false)
//         }
//         load();
//     }, [ids, min, max])

//     const [isOpen, setOpen] = useState(false);

//     const filterRef = useRef(null);
//     const productRef = useRef(null);

//     useGSAP(() => {
//         if (!productRef.current && !filterRef.current) return;
//         const ctx = gsap.context(() => {
//             const tl = gsap.timeline({
//                 scrollTrigger: {
//                     trigger: productRef.current,
//                     start: "top 170px",
//                     end: "bottom bottom",
//                     pin: filterRef.current,
//                     pinSpacing: true,
//                     invalidateOnRefresh: true,
//                     anticipatePin: 1,
//                 }
//             })
//         })
//         return () => ctx.revert();
//     }, { dependencies: [productData?.length], revertOnUpdate: true })


//     return (
//         <div className='flex items-start justify-center gap-10 lg:flex-row flex-col global-padding max-w-[1920px] mx-auto'>
//             <div className='lg:w-[20%] w-full'>
//                 <div ref={filterRef} className='hidden lg:block'>
//                     <div className='lg:h-[calc(90vh-140px)] h-0 overflow-y-scroll popup-scroll-bar-1'>
//                         <div className='mb-6'>
//                             <p className='font-semibold text-base leading-[100%] text-black mb-4'>CATÉGORIES</p>
//                             {childCategories && childCategories.length > 0
//                                 ? renderCategories(childCategories)
//                                 : <p className="text-sm text-gray-500">No categories</p>}
//                         </div>
//                         <div>
//                             <label className='uppercase text-base font-medium mb-4 block' for="vol">PRIX</label>
//                             <RangeSlider min={minPrice} max={maxPrice} defaultValue={[min || minPrice, max || maxPrice]} onInput={(val) => handleChange(val)} className='my-dashed-slider -ml-2' />
//                             <div className='text-[14px] leading-[15px] font-semibold mt-4'>
//                                 €{min || value[0].toFixed(2)} — €{max || value[1].toFixed(2)}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <div>
//                     <p className='uppercase text-base font-semibold leading-[100%] pb-1 global-b-bottom lg:hidden block' onClick={() => setOpen(true)}>
//                         Filter
//                         <Filter className='inline ml-2 mb-1' size={'0.8rem'} />
//                     </p>
//                 </div>
//             </div>


//             {/* Products */}
//             {
//                 loader ?
//                     <div className='grid xl:grid-cols-3 3xl:grid-cols-5 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 gap-4 lg:w-[80%] w-full grid-cols-2 max-w-[1920px] mx-auto global-margin'>
//                         {
//                             [...Array(6)].map((_, i) => {
//                                 return (
//                                     <SkeletonProjectCard key={i} />
//                                 )
//                             })
//                         }
//                     </div>
//                     : <div className='grid xl:grid-cols-3 3xl:grid-cols-5 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 gap-4 lg:w-[80%] w-full grid-cols-2 max-w-[1920px] mx-auto global-margin' ref={productRef}>
//                         {
//                             productData?.map((product) => {
//                                 const { images } = product;
//                                 const bestseller = product?.acf?.bestseller;
//                                 return (
//                                     <ProductCard price={product?.price_html} singlePrice={product?.price_with_tax} type={product?.type} name={product?.name} bestseller={bestseller} hoverImage={images[1]?.src} image={images[0]?.src} key={product?.id} slug={product?.slug} />
//                                 )
//                             })
//                         }
//                     </div>
//             }


//             {/* PopUp */}
//             <PopUp isOpen={isOpen}>
//                 <div className='w-[90%] mx-auto bg-white/95 h-[90vh] p-4 rounded-[4px] overflow-hidden shadow-xl'>
//                     <div className='relative'>
//                         <p className='font-medium uppercase text-xs leading-[100%] pb-4 text-[#999] border-gray-300 border-b'>Filters</p>
//                         <X className="w-4 h-4 absolute top-0 right-0 text-[#999]" onClick={() => setOpen(!isOpen)} />
//                     </div>
//                     <div className='mb-4 mt-4 h-[50%] overflow-y-scroll popup-scroll-bar-1'>
//                         <p className='font-semibold text-base leading-[100%] text-black mb-4'>CATÉGORIES</p>
//                         {childCategories && childCategories.length > 0
//                             ? renderCategories(childCategories)
//                             : <p className="text-sm text-gray-500">No categories</p>}
//                     </div>
//                     <div>
//                         <label className='uppercase text-base font-medium mb-4 block' for="vol">PRIX</label>
//                         <RangeSlider min={minPrice} max={maxPrice} defaultValue={[min || minPrice, max || maxPrice]} onInput={(val) => handleChange(val)} className='my-dashed-slider -ml-2' />
//                         <div className='text-[14px] leading-[15px] font-semibold mt-4'>
//                             €{min || value[0].toFixed(2)} — €{max || value[1].toFixed(2)}
//                         </div>
//                         {/* <FormButton label={"TERMINER"}/> */}
//                         <button type='button' className='text-center bg-black text-white w-full mt-4 text-sm leading-[100%] py-5 font-semibold rounded-4xl cursor-pointer' onClick={() => setOpen(!isOpen)}>
//                             TERMINER
//                         </button>
//                     </div>
//                 </div>
//             </PopUp>
//         </div>
//     );
// };

// export default Products;


import React from 'react';

const Products = () => {
    return (
        <div className='max-w-[1920px] mx-auto'>
            <h1>Products</h1>
        </div>
    );
};

export default Products;
