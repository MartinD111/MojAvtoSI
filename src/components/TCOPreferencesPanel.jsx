import React, { useState, useEffect } from 'react';
import { getTCOPreferences, saveTCOPreferences } from '../services/tcoPreferencesService.js';
import './TCOPreferencesPanel.css';

const SI_REGIONS = [
    'Osrednjeslovenska', 'Podravska', 'Savinjska', 'Gorenjska', 'Goriška',
    'Obalno-kraška', 'Jugovzhodna Slovenija', 'Pomurska', 'Posavska',
    'Primorsko-notranjska', 'Koroška', 'Zasavska',
];

export default function TCOPreferencesPanel({ onSave }) {
    const [age, setAge] = useState(35);
    const [annualMiles, setAnnualMiles] = useState(15000);
    const [region, setRegion] = useState('Osrednjeslovenska');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const prefs = await getTCOPreferences();
            setAge(prefs.age);
            setAnnualMiles(prefs.annualMiles);
            if (prefs.region) setRegion(prefs.region);
        } catch (e) {
            console.error('Error loading preferences:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveTCOPreferences({
                age,
                annualMiles,
                state: region,
                region,
            });
            setMessage('✅ Nastavitve so uspešno shranjene!');
            setTimeout(() => setMessage(''), 3000);
            if (onSave) onSave();
        } catch (e) {
            setMessage('❌ Napaka pri shranjevanju nastavitev');
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="tco-prefs-loading">Nalaganje nastavitev...</div>;
    }

    return (
        <div className="tco-prefs-panel">
            <div className="tco-prefs-header">
                <h2>💰 Nastavitve izračuna stroškov (TCO)</h2>
                <p className="tco-prefs-subtitle">Prilagodite ocene stroškov vozila</p>
            </div>

            <div className="tco-prefs-form">
                {/* Age */}
                <div className="tco-prefs-field">
                    <label className="tco-prefs-label">
                        <span className="tco-prefs-icon">👤</span>
                        Vaša starost
                    </label>
                    <div className="tco-prefs-input-group">
                        <input
                            type="number"
                            min="16"
                            max="120"
                            value={age}
                            onChange={(e) => setAge(Number(e.target.value))}
                            className="tco-prefs-number-input"
                        />
                        <span className="tco-prefs-unit">let</span>
                    </div>
                    <div className="tco-prefs-hint">
                        {age < 25 && '⚠️ Mlajši vozniki plačujejo višje zavarovalne premije'}
                        {age >= 25 && age < 65 && '✅ Standardne zavarovalne premije'}
                        {age >= 65 && '⚠️ Starejši vozniki plačujejo nekoliko več'}
                    </div>
                </div>

                {/* Annual kilometers */}
                <div className="tco-prefs-field">
                    <label className="tco-prefs-label">
                        <span className="tco-prefs-icon">🛣️</span>
                        Letni kilometri
                    </label>
                    <div className="tco-prefs-input-group">
                        <input
                            type="number"
                            min="100"
                            max="200000"
                            value={annualMiles}
                            onChange={(e) => setAnnualMiles(Number(e.target.value))}
                            className="tco-prefs-number-input"
                        />
                        <span className="tco-prefs-unit">km/leto</span>
                    </div>
                    <div className="tco-prefs-hint">
                        {annualMiles <= 8000 && '✅ Zelo nizka kilometrina'}
                        {annualMiles > 8000 && annualMiles <= 15000 && '✅ Povprečje (SLO povprečje: ~15.000)'}
                        {annualMiles > 15000 && annualMiles <= 25000 && '⚠️ Nad povprečjem'}
                        {annualMiles > 25000 && '⚠️ Visoka kilometrina'}
                    </div>
                </div>

                {/* Region */}
                <div className="tco-prefs-field">
                    <label className="tco-prefs-label">
                        <span className="tco-prefs-icon">📍</span>
                        Regija
                    </label>
                    <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="tco-prefs-select"
                    >
                        {SI_REGIONS.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                    <div className="tco-prefs-hint">Vpliva na zavarovalne premije in stroške registracije</div>
                </div>
            </div>

            {/* Message */}
            {message && <div className="tco-prefs-message">{message}</div>}

            {/* Save Button */}
            <div className="tco-prefs-actions">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="tco-prefs-btn-save"
                >
                    {isSaving ? '⏳ Shranjujem...' : '💾 Shrani nastavitve'}
                </button>
                <p className="tco-prefs-footer">
                    Te nastavitve se uporabljajo za izračun realnih mesečnih stroškov lastništva pri vseh oglasih vozil.
                </p>
            </div>
        </div>
    );
}
