import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';

function FAQ() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: t('q1'),
      answer: t('a1')
    },
    {
      question: t('q2'),
      answer: t('a2')
    },
    {
      question: t('q3'),
      answer: t('a3')
    },
    {
      question: t('q4'),
      answer: t('a4')
    },
    {
      question: t('q5'),
      answer: t('a5')
    }
  ];

  return (
    <>
      <Helmet>
        <title>{t('faqTitle')} - Auto Finder</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-6 transition-colors">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('faqTitle')}</h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 transition-colors">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${openIndex === index ? 'transform rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default FAQ;

