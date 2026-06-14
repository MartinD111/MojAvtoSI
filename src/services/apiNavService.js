import { PLATFORM } from '../config/platform.js';

export class ApiNavService {
  static async fetchNavigation() {
    const file = PLATFORM.id === 'avto'
      ? 'json/navigation.json'
      : `json/navigation.${PLATFORM.id}.json`;
    try {
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error('Failed to fetch navigation API');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Navigaton API Error:', error);
      // Fallback navigation in case the fetch fails
      return {
        navItems: [
          { id: 'home', label: 'Domov', icon: 'home', href: '#/' },
          { id: 'oglasi', label: 'Oglasi', icon: 'newspaper', href: '#/iskanje' }
        ],
        userNavItems: []
      };
    }
  }
}
