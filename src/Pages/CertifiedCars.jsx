import React from 'react';
import { Helmet } from 'react-helmet-async';
import ManagedByAutofinder from '../Components/ManagedByAutofinder';

function CertifiedCars() {
  return (
    <>
      <Helmet>
        <title>Autofinder Certified Cars | Managed By Autofinder</title>
        <meta
          name="description"
          content="Browse Autofinder Certified cars that are fully managed by Autofinder. Premium inspected cars with trusted listings."
        />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-2 transition-colors">
        <div className="container mx-auto px-4">
          <div className="mb-4 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
              Autofinder Certified Cars
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore cars that are <span className="font-semibold">Managed By Autofinder</span>. These listings are
              handled end‑to‑end by Autofinder to provide you with a safer and more reliable buying experience.
            </p>
          </div>

          {/* Managed By Autofinder listings (same data source as home section) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900 p-4 md:p-6 transition-colors">
            <ManagedByAutofinder />
          </div>
        </div>
      </div>
    </>
  );
}

export default CertifiedCars;

















