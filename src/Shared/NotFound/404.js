import { getTranslations } from 'next-intl/server';
import React from 'react';

const NotFound = async () => {
    const t = await getTranslations("404")
    return (
        <div className='global-padding my-5'>
            <h1 className='global-h2 font-normal!'>{t("notfound")}</h1>
            <p className="mt-3 text-base">{t("appears")}</p>
        </div>
    );
};

export default NotFound;