import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { calculateTCO } from '../services/tcoEngine.js';
import { getTCOPreferences } from '../services/tcoPreferencesService.js';
import { key as lsKey } from '../config/storageKeys.js';
import './CostPanel.css';

const MONTH_OPTIONS = [12, 24, 36, 48, 60, 72, 84];

const CATEGORIES = [
    { key: 'financing', label: 'Financiranje', icon: '🏦' },
    { key: 'insurance', label: 'Zavarovanje', icon: '🛡️' },
    { key: 'energy', label: 'Gorivo/Energija', icon: '⛽' },
    { key: 'maintenance', label: 'Vzdrževanje', icon: '🔧' },
    { key: 'taxes', label: 'Davki in dajatve', icon: '📋' },
    { key: 'residual', label: 'Preostala vrednost', icon: '♻️' }
];

// Display currency conversion (engine works in USD-derived base figures)
const usdToEur = 0.91;
const eur = (v) => `€${Math.round(v * usdToEur).toLocaleString('sl-SI')}`;

export default function CostPanel({ price, powerKw, fuelType, mpg, kWhPer100km, isNew = true, make = '', category = '', vin = '' }) {
    if (!price || !powerKw) return null;

    const [isExpanded, setIsExpanded] = useState(false);
    const [downPayment, setDownPayment] = useState(Math.round(price * 0.15));
    const [months, setMonths] = useState(isNew ? 36 : 60);
    const [userAge, setUserAge] = useState(35);
    const [excludedCategories, setExcludedCategories] = useState(() => {
        try {
            const cached = localStorage.getItem(lsKey('tco_excluded'));
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            return [];
        }
    });
    const [showToggles, setShowToggles] = useState(false);

    // Load user preferences from TCO preferences service
    useEffect(() => {
        getTCOPreferences().then(prefs => {
            setUserAge(prefs.age || 35);
        }).catch(e => {
            console.log('[CostPanel] Could not load preferences:', e.message);
        });
    }, []);

    useEffect(() => {
        localStorage.setItem(lsKey('tco_excluded'), JSON.stringify(excludedCategories));
    }, [excludedCategories]);

    const toggleCategory = (key) => {
        setExcludedCategories(prev => 
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const maxDownPayment = Math.round(price * 0.5);
    const downPct = Math.round((downPayment / price) * 100);

    const tco = useMemo(() => {
        const isPowertrain = fuelType?.toLowerCase().includes('elektro') || fuelType?.toLowerCase().includes('ev');
        const isHybrid = fuelType?.toLowerCase().includes('hibrid');

        const vehicle = {
            isNew,
            price,
            msrp: price,
            mpg: mpg || 25,
            kWhPer100km: kWhPer100km || (isPowertrain ? 18 : 0),
            powertrain: isPowertrain ? 'EV' : isHybrid ? 'Hybrid' : 'ICE',
            annualMiles: 15000,
            residualRate: isNew ? 0.55 : 0.65,
            category: category || 'sedan',
        };

        const user = {
            age: userAge,
            annualMiles: 15000,
        };

        const finance = {
            downPayment,
            term: months,
            apr: 0.065,
            moneyFactor: 0.0012,
        };

        const external = {
            fuelPrice: 3.5,
            electricityPrice: 0.14,
            taxRate: 0.22,
            baseInsurance: 1200,
        };

        return calculateTCO(vehicle, user, finance, external);
    }, [price, fuelType, mpg, kWhPer100km, isNew, downPayment, months, userAge, category]);

    const finalTco = useMemo(() => {
        if (!tco) return null;

        let sum = 0;
        if (!excludedCategories.includes('financing')) sum += tco.breakdown.financing.monthly;
        if (!excludedCategories.includes('insurance')) sum += tco.breakdown.insurance.monthly;
        if (!excludedCategories.includes('energy')) sum += tco.breakdown.energy.monthly;
        if (!excludedCategories.includes('maintenance')) sum += tco.breakdown.maintenance.monthly;
        if (!excludedCategories.includes('taxes')) sum += tco.breakdown.taxes.monthly;
        if (!excludedCategories.includes('residual')) sum += tco.breakdown.residual.monthly;

        const totalMonthly = Math.max(0, sum);
        const totalAnnual = totalMonthly * 12;
        const annualMiles = 15000;
        const costPerMile = totalAnnual / annualMiles;

        return {
            ...tco,
            totalMonthly,
            totalAnnual,
            costPerMile
        };
    }, [tco, excludedCategories]);

    const renderRow = (icon, label, value, key) => {
        const isExcluded = excludedCategories.includes(key);
        return (
            <div className={`cost-panel__breakdown-row ${isExcluded ? 'cost-panel__breakdown-row--excluded' : ''}`}>
                <span>{icon} {label}</span>
                <span>
                    {isExcluded ? (
                        <>
                            <span className="cost-panel__value-strike">{eur(value)}</span>
                            <span className="cost-panel__value-zero">€0</span>
                        </>
                    ) : (
                        eur(value)
                    )}
                </span>
            </div>
        );
    };

    return (
        <div className="cost-panel glass-card">
            <div className="cost-panel__collapsed" onClick={() => setIsExpanded(v => !v)}>
                <div className="cost-panel__total-label">Realni mesečni strošek</div>
                <div className="cost-panel__total-value">~ {eur(finalTco.totalMonthly)}</div>
                <div className="cost-panel__subtext">ocena lastništva na mesec</div>
                <div className="cost-panel__toggle">
                    {isExpanded ? 'Skrij razčlenitev' : 'Prikaži razčlenitev'}
                    <span className={`cost-panel__chevron ${isExpanded ? 'cost-panel__chevron--up' : ''}`}>›</span>
                </div>
            </div>

            <div className={`cost-panel__expanded ${isExpanded ? 'cost-panel__expanded--open' : ''}`}>
                <div className="cost-panel__slider-group">
                    <div className="cost-panel__slider-header">
                        <span>Polog</span>
                        <span className="cost-panel__slider-value">
                            €{downPayment.toLocaleString('sl-SI')} ({downPct}%)
                        </span>
                    </div>
                    <input
                        type="range"
                        className="cost-panel__range"
                        min={0}
                        max={maxDownPayment}
                        step={100}
                        value={downPayment}
                        onChange={e => setDownPayment(Number(e.target.value))}
                    />
                    <div className="cost-panel__slider-limits">
                        <span>€0</span>
                        <span>€{maxDownPayment.toLocaleString('sl-SI')}</span>
                    </div>
                </div>

                <div className="cost-panel__slider-group">
                    <div className="cost-panel__slider-header">
                        <span>Doba financiranja</span>
                        <select 
                            className="cost-panel__select"
                            value={months} 
                            onChange={e => setMonths(Number(e.target.value))}
                        >
                            {MONTH_OPTIONS.map(m => (
                                <option key={m} value={m}>{m} mesecev</option>
                            ))}
                        </select>
                    </div>
                    <input
                        type="range"
                        className="cost-panel__range"
                        min={12}
                        max={84}
                        step={12}
                        value={months}
                        onChange={e => setMonths(Number(e.target.value))}
                    />
                    <div className="cost-panel__slider-limits">
                        <span>12 mesecev</span>
                        <span>84 mesecev</span>
                    </div>
                </div>

                <div className="cost-panel__breakdown-header">
                    <span className="cost-panel__section-title">Mesečni stroški</span>
                    <button 
                        type="button"
                        className="cost-panel__edit-btn"
                        onClick={() => setShowToggles(true)}
                    >
                        <span className="cost-panel__edit-icon">⚙️</span>
                        Prilagodi izračun
                    </button>
                </div>

                {showToggles && createPortal(
                    <div className="cost-panel__modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowToggles(false); }}>
                        <div className="cost-panel__modal glass-card">
                            <div className="cost-panel__modal-header">
                                <h3 className="cost-panel__modal-title">Prilagodi izračun stroškov</h3>
                                <button 
                                    type="button" 
                                    className="cost-panel__modal-close"
                                    onClick={() => setShowToggles(false)}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="cost-panel__modal-body">
                                <p className="cost-panel__modal-desc">
                                    Izberite, katere stroškovne komponente naj se vključijo v končni izračun realnega mesečnega stroška:
                                </p>
                                <div className="cost-panel__toggles-grid">
                                    {CATEGORIES.map(cat => {
                                        const isIncluded = !excludedCategories.includes(cat.key);
                                        return (
                                            <label key={cat.key} className="cost-panel__toggle-label">
                                                <div className="cost-panel__toggle-switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={isIncluded}
                                                        onChange={() => toggleCategory(cat.key)}
                                                    />
                                                    <span className="cost-panel__toggle-slider"></span>
                                                </div>
                                                <span className="cost-panel__toggle-text">
                                                    {cat.icon} {cat.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="cost-panel__modal-footer">
                                <button 
                                    type="button" 
                                    className="cost-panel__modal-btn-confirm"
                                    onClick={() => setShowToggles(false)}
                                >
                                    Potrdi in zapri
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                <div className="cost-panel__breakdown">
                    {renderRow('🏦', 'Financiranje', tco.breakdown.financing.monthly, 'financing')}
                    {renderRow('🛡️', 'Zavarovanje', tco.breakdown.insurance.monthly, 'insurance')}
                    {renderRow('⛽', 'Gorivo/Energija', tco.breakdown.energy.monthly, 'energy')}
                    {renderRow('🔧', 'Vzdrževanje', tco.breakdown.maintenance.monthly, 'maintenance')}
                    {renderRow('📋', 'Davki in dajatve', tco.breakdown.taxes.monthly, 'taxes')}
                    {tco.breakdown.residual.monthly !== 0 && 
                        renderRow('♻️', 'Preostala vrednost', tco.breakdown.residual.monthly, 'residual')
                    }
                    <div className="cost-panel__breakdown-row cost-panel__breakdown-row--total">
                        <span>Skupni mesečni strošek</span>
                        <span>{eur(finalTco.totalMonthly)}</span>
                    </div>
                </div>

                <div className="cost-panel__metrics">
                    <div className="cost-panel__metric">
                        <span className="cost-panel__metric-label">Strošek na km</span>
                        <span className="cost-panel__metric-value">{eur(finalTco.costPerMile / 1.609)}</span>
                    </div>
                    <div className="cost-panel__metric">
                        <span className="cost-panel__metric-label">Letni strošek</span>
                        <span className="cost-panel__metric-value">{eur(finalTco.totalAnnual)}</span>
                    </div>
                </div>

                <p className="cost-panel__disclaimer">
                    To je informativna ocena, izračunana na podlagi tipičnih scenarijev lastništva.
                    Dejanski stroški se razlikujejo glede na način vožnje, razmere na trgu in vaše zavarovalne pogoje.
                    Pogoji financiranja so zgolj informativni in odvisni od izbranega ponudnika.
                </p>
            </div>
        </div>
    );
}
