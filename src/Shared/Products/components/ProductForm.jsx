import React from 'react';
import { ArrowUpRight } from "lucide-react";

const ProductForm = ({
    hasVariations,
    attributes,
    watch,
    register,
    optionAvailability,
    decodeHtml,
    setGradeOpen,
    t
}) => {
    return (
        <div className="flex flex-col gap-4">
            {hasVariations && (
                <table>
                    <tbody className="flex flex-col gap-5">
                        {attributes?.map((singleAttribute, index) => {
                            const fieldName = singleAttribute.name;
                            const selectedValue = watch(fieldName);
                            return (
                                <tr key={index} className="flex flex-col gap-[6px]">
                                    <th className="font-bold text-left p-0!">
                                        {fieldName === "Grade" &&
                                            <button
                                                type="button"
                                                onClick={() => setGradeOpen(true)}
                                                className='text-[#1D98FF] text-base leading-[100%] font-semibold cursor-pointer flex items-center mb-5'
                                            >
                                                <span>{t("Grade")}</span>
                                                <span className='inline'><ArrowUpRight className='inline ml-1' size={'1.1rem'} strokeWidth={2.5} /></span>
                                            </button>
                                        }
                                        <label className='font-semibold text-base leading-[100%] text-left'>
                                            {singleAttribute?.name}
                                            {selectedValue && (
                                                <span className="">
                                                    {" "} : {decodeHtml(selectedValue)}
                                                </span>
                                            )}
                                        </label>
                                    </th>
                                    <td>
                                        <ul className="flex flex-wrap gap-1">
                                            {singleAttribute.options?.map((singleOption, idx) => {
                                                const inStock = optionAvailability[singleAttribute.name]?.[singleOption] ?? true;
                                                const selected = watch(fieldName) === singleOption;
                                                return (
                                                    <li key={idx}>
                                                        <label
                                                            className={`text-base leading-[130%] border-[2px] border-[#111]! cursor-pointer px-2 py-1 flex items-center justify-center font-semibold rounded-[34px]
                                                            ${selected
                                                                    ? "bg-[#111] text-white"
                                                                    : "border-[#111] text-[#111]"
                                                                }
                                                            ${!inStock ? "opacity-50 line-through cursor-not-allowed" : ""}
                                                            `}
                                                        >
                                                            <input
                                                                type="radio"
                                                                value={singleOption}
                                                                {...register(fieldName, { required: true })}
                                                                className="hidden"
                                                                disabled={!inStock} // prevent selecting unavailable option
                                                            />
                                                            {decodeHtml(singleOption)}
                                                        </label>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ProductForm;
