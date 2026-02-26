import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '../Context/LanguageContext';

function About() {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('aboutTitle')} - Auto Finder</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-6 transition-colors">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('aboutTitle')}</h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-6 mb-6 transition-colors">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('welcomeToAutoFinder')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg leading-relaxed">
              {t('aboutDesc1')}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg leading-relaxed">
              {t('aboutDesc2')}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              {t('aboutDesc3')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: t('ourMission'), desc: t('ourMissionDesc') },
              { title: t('ourVision'), desc: t('ourVisionDesc') },
              { title: t('ourValues'), desc: t('ourValuesDesc') }
            ].map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-6 hover:shadow-lg transition-all">
                <h3 className="text-xl font-semibold mb-3 text-red-600 dark:text-red-500">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default About;

