import React, { useState, useMemo, useEffect } from 'react';
import { calculateTCO } from '../services/tcoEngine.js';
import { getTCOPreferences } from '../services/tcoPreferencesService.js';
import './CostPanel.css';

const MONTH_OPTIONS = [12, 24, 36, 48, 60, 72, 84];

// Display currency conversion (engine works in USD-derived base figures)
const usdToEur = 0.91;
const eur = (v) => `€${Math.round(v * usdToEur).toLocaleString('sl-SI')}`;

export default function CostPanel({ price, powerKw, fuelType, mpg, kWhPer100km, isNew = true, make = '', category = '', vin = '' }) {
    if (!price || !powerKw) return null;

    const [isExpanded, setIsExpanded] = useState(false);
    const [downPayment, setDownPayment] = useState(Math.round(price * 0.15));
    const [months, setMonths] = useState(isNew ? 36 : 60);
    const [userAge, setUserAge] = useState(35);

    // Load user preferences from TCO preferences service
    useEffect(() => {
        getTCOPreferences().then(prefs => {
            setUserAge(prefs.age || 35);
        }).catch(e => {
            console.log('[CostPanel] Could not load preferences:', e.message);
        });
    }, []);

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

    return (
        <div className="cost-panel glass-card">
            <div className="cost-panel__collapsed" onClick={() => setIsExpanded(v => !v)}>
                <div className="cost-panel__total-label">Realni mesečni strošek</div>
                <div className="cost-panel__total-value">~ {eur(tco.totalMonthly)}</div>
                <div className="cost-panel__subtext">ocena lastništva na mesec</div>
                <div className="cost-panel__toggle">
                    {isExpanded ? 'Skrij razčlenitev' : 'Prikaži razčlenitev'}
                    <span className={`cost-panel__chevron ${isExpanded ? 'cost-panel__chevron--up' : ''}`}>›</span>
                </div>
            </div>

            {isExpanded && (
                <div className="cost-panel__expanded">
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
                            <span className="cost-panel__slider-value">{months} mesecev</span>
                        </div>
                        <div className="cost-panel__month-btns">
                            {MONTH_OPTIONS.map(m => (
                                <button
                                    key={m}
                                    className={`cost-panel__month-btn ${months === m ? 'cost-panel__month-btn--active' : ''}`}
                                    onClick={() => setMonths(m)}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="cost-panel__breakdown">
                        <div className="cost-panel__breakdown-row">
                            <span>🏦 Financiranje</span>
                            <span>{eur(tco.breakdown.financing.monthly)}</span>
                        </div>
                        <div className="cost-panel__breakdown-row">
                            <span>🛡️ Zavarovanje</span>
                            <span>{eur(tco.breakdown.insurance.monthly)}</span>
                        </div>
                        <div className="cost-panel__breakdown-row">
                            <span>⛽ Gorivo/Energija</span>
                            <span>{eur(tco.breakdown.energy.monthly)}</span>
                        </div>
                        <div className="cost-panel__breakdown-row">
                            <span>🔧 Vzdrževanje</span>
                            <span>{eur(tco.breakdown.maintenance.monthly)}</span>
                        </div>
                        <div className="cost-panel__breakdown-row">
                            <span>📋 Davki in dajatve</span>
                            <span>{eur(tco.breakdown.taxes.monthly)}</span>
                        </div>
                        {tco.breakdown.residual.monthly !== 0 && (
                            <div className="cost-panel__breakdown-row">
                                <span>♻️ Preostala vrednost</span>
                                <span>{eur(tco.breakdown.residual.monthly)}</span>
                            </div>
                        )}
                        <div className="cost-panel__breakdown-row cost-panel__breakdown-row--total">
                            <span>Skupni mesečni strošek</span>
                            <span>{eur(tco.totalMonthly)}</span>
                        </div>
                    </div>

                    <div className="cost-panel__metrics">
                        <div className="cost-panel__metric">
                            <span className="cost-panel__metric-label">Strošek na km</span>
                            <span className="cost-panel__metric-value">{eur(tco.costPerMile / 1.609)}</span>
                        </div>
                        <div className="cost-panel__metric">
                            <span className="cost-panel__metric-label">Letni strošek</span>
                            <span className="cost-panel__metric-value">{eur(tco.totalAnnual)}</span>
                        </div>
                    </div>

                    <p className="cost-panel__disclaimer">
                        To je informativna ocena, izračunana na podlagi tipičnih scenarijev lastništva.
                        Dejanski stroški se razlikujejo glede na način vožnje, razmere na trgu in vaše zavarovalne pogoje.
                        Pogoji financiranja so zgolj informativni in odvisni od izbranega ponudnika.
                    </p>
                </div>
            )}
        </div>
    );
}
