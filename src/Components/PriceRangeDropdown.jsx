import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const PriceRangeDropdown = ({
    priceFrom,
    priceTo,
    onFromChange,
    onToChange,
    suggestions = [],
    onGoClick,
    label = "Lacs"
}) => {
    const { t } = useLanguage();
    const [showFromSuggestions, setShowFromSuggestions] = useState(false);
    const [showToSuggestions, setShowToSuggestions] = useState(false);
    const fromRef = useRef(null);
    const toRef = useRef(null);
    const dropdownFromRef = useRef(null);
    const dropdownToRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (fromRef.current && !fromRef.current.contains(event.target) &&
                dropdownFromRef.current && !dropdownFromRef.current.contains(event.target)) {
                setShowFromSuggestions(false);
            }
            if (toRef.current && !toRef.current.contains(event.target) &&
                dropdownToRef.current && !dropdownToRef.current.contains(event.target)) {
                setShowToSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatWithCommas = (value) => {
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const convertToLacs = (value) => {
        if (!value || isNaN(value)) return '';
        const num = parseInt(value);
        if (num >= 10000000) {
            return (num / 10000000).toFixed(1) + ' ' + t('crore');
        }
        if (num >= 100000) {
            return (num / 100000).toFixed(1) + ' ' + t('lacs');
        }
        return (num / 1000).toFixed(0) + ' ' + t('thousand');
    };

    return (
        <div className="w-full">
            <div className="flex gap-1.5 items-center w-full relative">
                <div className="flex-1 relative" ref={fromRef}>
                    <input
                        type="number"
                        placeholder={t('from')}
                        value={priceFrom}
                        onFocus={() => {
                            setShowFromSuggestions(true);
                            setShowToSuggestions(false);
                        }}
                        onChange={(e) => onFromChange(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    {showFromSuggestions && suggestions.length > 0 && (
                        <div
                            ref={dropdownFromRef}
                            className="absolute left-0 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-200"
                        >
                            {suggestions.map((val) => (
                                <div
                                    key={`from-${val}`}
                                    onClick={() => {
                                        onFromChange(val.toString());
                                        setShowFromSuggestions(false);
                                    }}
                                    className="px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                    {formatWithCommas(val)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 relative" ref={toRef}>
                    <input
                        type="number"
                        placeholder={t('to')}
                        value={priceTo}
                        onFocus={() => {
                            setShowToSuggestions(true);
                            setShowFromSuggestions(false);
                        }}
                        onChange={(e) => onToChange(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    {showToSuggestions && suggestions.length > 0 && (
                        <div
                            ref={dropdownToRef}
                            className="absolute left-0 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-200"
                        >
                            {suggestions.map((val) => (
                                <div
                                    key={`to-${val}`}
                                    onClick={() => {
                                        onToChange(val.toString());
                                        setShowToSuggestions(false);
                                    }}
                                    className="px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                    {formatWithCommas(val)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={onGoClick || (() => { })}
                    className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-semibold transition whitespace-nowrap flex-shrink-0"
                >
                    {t('go')}
                </button>
            </div>
            {(priceFrom || priceTo) && (
                <div className="mt-1 text-[10px] text-red-600 dark:text-red-500 font-medium italic">
                    {priceFrom ? convertToLacs(priceFrom) : '0'} {t('to')} {priceTo ? convertToLacs(priceTo) : t('any')}
                </div>
            )}
        </div>
    );
};

export default PriceRangeDropdown;
