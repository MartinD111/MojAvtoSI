export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

export const SEARCH_RADIUS_OPTIONS = [
  { value: 10, label: '10 mi' },
  { value: 25, label: '25 mi' },
  { value: 50, label: '50 mi' },
  { value: 100, label: '100 mi' },
  { value: 250, label: '250 mi' },
  { value: 500, label: '500+ mi' },
];

export function isValidZip(zip) {
  return typeof zip === 'string' && /^\d{5}$/.test(zip);
}

export function populateStateSelect(selectEl, { allLabel = 'All States', selected = '' } = {}) {
  if (!selectEl) return;
  selectEl.innerHTML = '';
  const allOpt = document.createElement('option');
  allOpt.value = '';
  allOpt.textContent = allLabel;
  selectEl.appendChild(allOpt);
  US_STATES.forEach(({ code, name }) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = `${code} — ${name}`;
    if (code === selected) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

export function populateRadiusSelect(selectEl, { anyLabel = 'Any distance', selected = '' } = {}) {
  if (!selectEl) return;
  selectEl.innerHTML = '';
  const any = document.createElement('option');
  any.value = '';
  any.textContent = anyLabel;
  selectEl.appendChild(any);
  SEARCH_RADIUS_OPTIONS.forEach(({ value, label }) => {
    const opt = document.createElement('option');
    opt.value = String(value);
    opt.textContent = label;
    if (String(value) === String(selected)) opt.selected = true;
    selectEl.appendChild(opt);
  });
}
