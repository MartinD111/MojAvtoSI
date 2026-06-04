/**
 * TCO Settings Page
 * Allow users to configure their ownership cost preferences
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import TCOPreferencesPanel from '../components/TCOPreferencesPanel.jsx';
import { auth } from '../firebase.js';
import { t } from '../core/i18n.js';

export async function initTCOSettingsPage() {
    const container = document.getElementById('app-container');
    if (!container) return;

    const user = auth.currentUser;
    if (!user) {
        window.location.hash = '/prijava';
        return;
    }

    // Render container
    container.innerHTML = `
        <div style="min-height:100vh;padding:2rem 1rem;">
            <div style="max-width:700px;margin:0 auto;">
                <!-- Header -->
                <div style="display:flex;align-items:center;gap:1rem;margin-bottom:3rem;">
                    <a href="#/dashboard" style="flex-shrink:0;width:40px;height:40px;border-radius:50%;background:#f1f5f9;border:1.5px solid #e2e8f0;display:flex;align-items:center;justify-content:center;text-decoration:none;color:#475569;transition:all 0.2s;" onmouseover="this.style.background='#e2e8f0';this.style.borderColor='#cbd5e1'" onmouseout="this.style.background='#f1f5f9';this.style.borderColor='#e2e8f0'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></a>
                    <div>
                        <h1 style="margin:0;font-size:1.8rem;font-weight:700;color:#1e293b;">
                            ${t('tco_settings_title') || 'TCO Settings'}
                        </h1>
                        <p style="margin:0.25rem 0 0;color:#64748b;font-size:0.9rem;">
                            ${t('tco_settings_subtitle') || 'Configure your vehicle cost estimates'}
                        </p>
                    </div>
                </div>

                <!-- Preferences Panel -->
                <div id="tco-settings-root"></div>
            </div>
        </div>
    `;

    // Mount React component
    const settingsRoot = document.getElementById('tco-settings-root');
    ReactDOM.createRoot(settingsRoot).render(
        React.createElement(TCOPreferencesPanel, {
            onSave: () => {
                // Notify parent app that preferences were updated
                if (window.updateTCOPreferences) {
                    window.updateTCOPreferences();
                }
            }
        })
    );
}
