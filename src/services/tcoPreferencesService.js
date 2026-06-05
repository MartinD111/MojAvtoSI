/**
 * TCO Preferences Service
 * Manages user preferences for TCO calculations (age, annual kilometers)
 * Stores in Firestore and localStorage with sync
 */

import { db, auth } from '../firebase.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { key as lsKey } from '../config/storageKeys.js';

const STORAGE_KEY = lsKey('tco_preferences');
const FIRESTORE_COLLECTION = 'users';

// Default preferences
const DEFAULT_PREFERENCES = {
    age: 35,
    annualMiles: 15000,
    state: 'SI',
};

/**
 * Get user's TCO preferences from localStorage or Firestore
 */
export async function getTCOPreferences() {
    const user = auth.currentUser;

    // Try localStorage first (fastest)
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (e) {
            console.warn('[TCOPreferences] Invalid localStorage data');
        }
    }

    // If logged in, fetch from Firestore
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, FIRESTORE_COLLECTION, user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const prefs = {
                    age: data.tcoPreferences?.age || DEFAULT_PREFERENCES.age,
                    annualMiles: data.tcoPreferences?.annualMiles || DEFAULT_PREFERENCES.annualMiles,
                    state: data.tcoPreferences?.state || DEFAULT_PREFERENCES.state,
                };
                // Cache in localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
                return prefs;
            }
        } catch (e) {
            console.warn('[TCOPreferences] Could not fetch from Firestore:', e.message);
        }
    }

    // Return defaults if not found
    return DEFAULT_PREFERENCES;
}

/**
 * Save user's TCO preferences to Firestore and localStorage
 */
export async function saveTCOPreferences(preferences) {
    const user = auth.currentUser;

    // Validate preferences
    const validated = {
        age: Math.max(16, Math.min(120, preferences.age || 35)),
        annualMiles: Math.max(100, Math.min(200000, preferences.annualMiles || 15000)),
        state: preferences.state || 'SI',
    };

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));

    // Save to Firestore if logged in
    if (user) {
        try {
            const userRef = doc(db, FIRESTORE_COLLECTION, user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                // Update existing document
                await setDoc(
                    userRef,
                    { tcoPreferences: validated },
                    { merge: true }
                );
            } else {
                // Create new document
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    tcoPreferences: validated,
                    createdAt: new Date(),
                });
            }
        } catch (e) {
            console.error('[TCOPreferences] Could not save to Firestore:', e.message);
            // Continue anyway - localStorage is enough
        }
    }

    return validated;
}

/**
 * Clear preferences (for logout)
 */
export function clearTCOPreferences() {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get preferences for display/editing
 */
export function getPreferencesForUI() {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (e) {
            return DEFAULT_PREFERENCES;
        }
    }
    return DEFAULT_PREFERENCES;
}
