import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '../Context/LanguageContext';

function Help() {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('helpSupport')} - Auto Finder</title>
        <meta name="description" content={t('helpDesc')} />
      </Helmet>
      <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center text-red-600 dark:text-red-500 uppercase">
              {t('helpSupport')}
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b pb-2">
                {t('allFaqs')}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {t('hq_q1')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {t('hq_a1')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {t('hq_q2')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {t('hq_a2')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {t('hq_q3')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {t('hq_a3')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {t('hq_q4')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {t('hq_a4')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {t('hq_q5')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {t('hq_a5')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {t('hq_q6')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {t('hq_a6')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {t('hq_q7')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {t('hq_a7')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {t('hq_q8')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {t('hq_a8')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b pb-2">
                {t('contactSupport')}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {t('phoneSupport')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    <a href={t('hqPhoneLink')} className="text-red-600 dark:text-red-400 hover:underline font-bold">
                      {t('hqPhoneLabel')}
                    </a> ({t('support247')})
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {t('emailSupport')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    <a href={t('hqEmailLink')} className="text-red-600 dark:text-red-400 hover:underline font-bold">
                      {t('hqEmailLabel')}
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {t('officeAddress')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('hqAddressLabel')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Help;

