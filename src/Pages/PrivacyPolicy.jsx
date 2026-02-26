import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '../Context/LanguageContext';

function PrivacyPolicy() {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('ppTitle')} - Auto Finder</title>
        <meta name="description" content={t('ppIntro')} />
      </Helmet>
      <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center text-red-600 dark:text-red-500 uppercase">
              {t('ppTitle')}
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 space-y-8 border border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <strong className="text-gray-800 dark:text-gray-200">{t('lastUpdated')}:</strong> {new Date().toLocaleDateString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  {t('ppIntro')}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">
                  {t('ppSection1Title')}
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  <p>
                    {t('ppSection1Text1')}
                  </p>
                  <p>
                    {t('ppSection1Text2')}
                  </p>
                  <p>
                    {t('ppSection1Text3')}
                  </p>
                  <p>
                    {t('ppSection1Text4')}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">
                  {t('ppSection2Title')}
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4 text-lg leading-relaxed">
                  <li>{t('ppSection2Item1')}</li>
                  <li>{t('ppSection2Item2')}</li>
                  <li>{t('ppSection2Item3')}</li>
                  <li>{t('ppSection2Item4')}</li>
                  <li>{t('ppSection2Item5')}</li>
                  <li>{t('ppSection2Item6')}</li>
                  <li>{t('ppSection2Item7')}</li>
                  <li>{t('ppSection2Item8')}</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">
                  {t('ppSection3Title')}
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  <p>
                    {t('ppSection3Text1')}
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      {t('ppSection3Item1')}
                    </li>
                    <li>
                      {t('ppSection3Item2')}
                    </li>
                    <li>
                      {t('ppSection3Item3')}
                    </li>
                    <li>
                      {t('ppSection3Item4')}
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">
                  {t('ppSection4Title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  {t('ppSection4Text')}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">
                  {t('ppSection5Title')}
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  <p>{t('ppSection5Text1')}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{t('ppSection5Item1')}</li>
                    <li>{t('ppSection5Item2')}</li>
                    <li>{t('ppSection5Item3')}</li>
                    <li>{t('ppSection5Item4')}</li>
                    <li>{t('ppSection5Item5')}</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">
                  {t('ppSection6Title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  {t('ppSection6Text')}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">
                  {t('ppSection7Title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  {t('ppSection7Text')}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">
                  {t('ppSection8Title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  {t('ppSection8Text')}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">
                  {t('ppSection9Title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  {t('ppSection9Text')}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">
                  {t('ppSection10Title')}
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  <p>{t('ppSection10Text')}</p>
                  <p>
                    <strong className="text-gray-800 dark:text-gray-200">{t('emailSupport')}:</strong>{' '}
                    <a href={t('hqEmailLink')} className="text-red-600 dark:text-red-400 hover:underline font-bold">
                      {t('hqEmailLabel')}
                    </a>
                  </p>
                  <p>
                    <strong className="text-gray-800 dark:text-gray-200">{t('phoneSupport')}:</strong>{' '}
                    <a href={t('hqPhoneLink')} className="text-red-600 dark:text-red-400 hover:underline font-bold">
                      {t('hqPhoneLabel')}
                    </a>
                  </p>
                  <p>
                    <strong className="text-gray-800 dark:text-gray-200">{t('officeAddress')}:</strong> {t('hqAddressLabel')}
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

export default PrivacyPolicy;

