/**
 * Total Cost of Ownership (TCO) Engine
 * Production-grade financial simulation for vehicle ownership costs
 *
 * Calculates real monthly ownership cost across all cost vectors:
 * financing, insurance, fuel/energy, maintenance, taxes, and residual value
 */

// ============================================================================
// FINANCING CALCULATIONS
// ============================================================================

/**
 * Calculate monthly financing cost for new vehicle (lease)
 * Uses simplified lease model with money factor and residual
 */
export function calculateLeasePayment(params) {
  const {
    msrp,
    downPayment = 0,
    term = 36, // months
    moneyFactor = 0.0012, // ~2.9% APR equivalent
    residualRate = 0.55,
  } = params;

  if (!msrp || msrp <= 0) return { monthly: 0, components: {} };

  const capitalized = msrp - downPayment;
  const residual = msrp * residualRate;
  const depreciationFee = (capitalized - residual) / term;
  const financeFee = (capitalized + residual) * moneyFactor;

  return {
    monthly: depreciationFee + financeFee,
    components: {
      depreciationFee,
      financeFee,
      downPayment,
      term,
      residualValue: residual,
    },
  };
}

/**
 * Calculate monthly loan payment for used vehicle
 * Standard amortized loan with APR
 */
export function calculateLoanPayment(params) {
  const {
    price,
    downPayment = 0,
    term = 60, // months
    apr = 0.065, // 6.5% default for used
  } = params;

  if (!price || price <= 0 || term <= 0) return { monthly: 0, components: {} };

  const principal = price - downPayment;
  const monthlyRate = apr / 12;

  if (monthlyRate === 0) {
    return {
      monthly: principal / term,
      components: { principal, downPayment, term, apr, totalInterest: 0 },
    };
  }

  const monthly =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, term))) /
    (Math.pow(1 + monthlyRate, term) - 1);

  const totalInterest = monthly * term - principal;

  return {
    monthly,
    components: {
      principal,
      downPayment,
      term,
      apr,
      totalInterest,
      totalPayment: monthly * term,
    },
  };
}

/**
 * Route to correct financing model based on vehicle age
 */
function getFinancingCost(vehicle, finance) {
  const isNew = vehicle.isNew !== false;

  if (isNew) {
    return calculateLeasePayment({
      msrp: vehicle.msrp || vehicle.price,
      downPayment: finance.downPayment,
      term: finance.term,
      residualRate: vehicle.residualRate || 0.55,
      moneyFactor: finance.moneyFactor,
    });
  } else {
    return calculateLoanPayment({
      price: vehicle.price,
      downPayment: finance.downPayment,
      term: finance.term,
      apr: finance.apr,
    });
  }
}

// ============================================================================
// INSURANCE CALCULATIONS
// ============================================================================

/**
 * Calculate annual insurance premium with age/vehicle multipliers
 */
export function calculateInsurance(params) {
  const {
    baseAnnual = 1200, // base insurance cost
    age = 35,
    vehicleValue = 25000,
    vehicleType = "sedan", // sedan, suv, sports, truck
    isNew = true,
  } = params;

  let multiplier = 1.0;

  // Age multiplier (young drivers pay more)
  if (age < 25) multiplier *= 1.6;
  else if (age < 35) multiplier *= 1.2;
  else if (age > 65) multiplier *= 1.15;

  // Vehicle type (sports cars more expensive)
  const typeMultipliers = {
    sports: 1.4,
    suv: 1.1,
    truck: 1.05,
    sedan: 1.0,
    coupe: 1.3,
    default: 1.0,
  };
  multiplier *= typeMultipliers[vehicleType] || typeMultipliers.default;

  // New vehicle discount (better safety features)
  if (isNew) multiplier *= 0.95;

  // Value-based component (liability limits scale with vehicle value)
  const valueMultiplier = Math.min(vehicleValue / 25000, 2.0);

  const annual = baseAnnual * multiplier * valueMultiplier;
  const monthly = annual / 12;

  return {
    monthly,
    annual,
    components: {
      baseAnnual,
      ageMultiplier: age,
      vehicleTypeMultiplier: vehicleType,
      finalMultiplier: multiplier * valueMultiplier,
    },
  };
}

// ============================================================================
// FUEL / ENERGY CALCULATIONS
// ============================================================================

/**
 * Calculate monthly fuel cost for ICE vehicles
 */
export function calculateFuelCost(params) {
  const {
    mpg = 25,
    annualMiles = 12000,
    fuelPrice = 3.5, // $/gallon
  } = params;

  if (!mpg || mpg <= 0 || !annualMiles) return { monthly: 0, components: {} };

  const gallonsPerYear = annualMiles / mpg;
  const annualCost = gallonsPerYear * fuelPrice;
  const monthly = annualCost / 12;

  return {
    monthly,
    components: {
      gallonsPerYear,
      annualCost,
      mpg,
      annualMiles,
      fuelPrice,
    },
  };
}

/**
 * Calculate monthly electricity cost for EV vehicles
 * kWh per 100 km is standard EV metric
 */
export function calculateElectricityCost(params) {
  const {
    kWhPer100km = 20, // typical EV: 15-25
    annualMiles = 12000,
    electricityPrice = 0.14, // $/kWh US average
  } = params;

  if (!kWhPer100km || kWhPer100km <= 0 || !annualMiles) {
    return { monthly: 0, components: {} };
  }

  const kmPerYear = annualMiles * 1.60934;
  const kWhPerYear = (kmPerYear / 100) * kWhPer100km;
  const annualCost = kWhPerYear * electricityPrice;
  const monthly = annualCost / 12;

  return {
    monthly,
    components: {
      kWhPerYear,
      annualCost,
      kWhPer100km,
      annualMiles,
      electricityPrice,
    },
  };
}

/**
 * Route to correct fuel calculation based on powertrain
 */
function getEnergyCost(vehicle, external) {
  if (vehicle.powertrain === "EV" || vehicle.kWhPer100km) {
    return calculateElectricityCost({
      kWhPer100km: vehicle.kWhPer100km,
      annualMiles: vehicle.annualMiles,
      electricityPrice: external.electricityPrice,
    });
  } else {
    return calculateFuelCost({
      mpg: vehicle.mpg,
      annualMiles: vehicle.annualMiles,
      fuelPrice: external.fuelPrice,
    });
  }
}

// ============================================================================
// MAINTENANCE CALCULATIONS
// ============================================================================

/**
 * Estimate monthly maintenance cost
 * Heuristic model based on vehicle age and mileage
 */
export function calculateMaintenance(params) {
  const {
    price = 25000,
    age = 0, // years since purchase
    annualMiles = 12000,
    isNew = true,
    powertrain = "ICE",
  } = params;

  // Base maintenance as % of vehicle price per year
  let baseMaintenance = price * 0.05; // 5% per year

  // Age factor (older vehicles cost more)
  let ageFactor = 1.0;
  if (age < 3) ageFactor = 0.5; // Warranty period
  else if (age < 5) ageFactor = 0.8;
  else if (age < 8) ageFactor = 1.2;
  else if (age < 12) ageFactor = 1.5;
  else ageFactor = 2.0;

  // Mileage factor (higher mileage = more maintenance)
  const totalMiles = annualMiles * age;
  let mileageFactor = 1.0;
  if (totalMiles > 100000) mileageFactor = 1.4;
  else if (totalMiles > 80000) mileageFactor = 1.25;
  else if (totalMiles > 50000) mileageFactor = 1.1;

  // Powertrain adjustments
  let powertrainFactor = 1.0;
  if (powertrain === "EV") powertrainFactor = 0.6; // EVs have lower maintenance
  else if (powertrain === "Hybrid") powertrainFactor = 0.75;

  // New vehicles are cheaper to maintain initially
  const newVehicleDiscount = isNew ? 0.7 : 1.0;

  const annualCost = baseMaintenance * ageFactor * mileageFactor * powertrainFactor * newVehicleDiscount;
  const monthly = annualCost / 12;

  return {
    monthly,
    components: {
      baseMaintenance,
      ageFactor,
      mileageFactor,
      powertrainFactor,
      newVehicleDiscount,
      annualCost,
    },
  };
}

// ============================================================================
// TAX CALCULATIONS
// ============================================================================

/**
 * Calculate sales tax (one-time, converted to monthly)
 */
function calculateSalesTax(params) {
  const { price, taxRate = 0.08, term = 60 } = params;
  const tax = price * taxRate;
  return tax / term; // Spread over financing term
}

/**
 * Calculate registration/title fees (one-time)
 */
function calculateRegistrationFees(params) {
  const { price, state = "CA", term = 60 } = params;

  // State registration fees (simplified)
  const stateFees = {
    CA: Math.min(price * 0.0065, 400),
    TX: 28 + price * 0.006,
    FL: 135 + price * 0.06,
    NY: Math.min(price * 0.04, 1000),
    default: Math.min(price * 0.02, 300),
  };

  const fees = stateFees[state] || stateFees.default;
  return fees / term; // Spread over term
}

/**
 * Calculate recurring annual property/registration taxes
 * Some states tax vehicle value annually
 */
function calculatePropertyTax(params) {
  const { price, state = "CA", taxMode = "monthly" } = params;

  // Annual property tax rates by state (simplified)
  const propertyTaxRates = {
    CA: 0, // California has no personal property tax on vehicles
    TX: 0.006, // 0.6% of value
    NY: 0.045, // 4.5% of value
    VA: 0.03, // 3% of value
    default: 0.02, // 2% average
  };

  const annualTax = price * (propertyTaxRates[state] || propertyTaxRates.default);

  if (taxMode === "upfront") return annualTax / 12; // Monthly equivalent
  if (taxMode === "monthly") return annualTax / 12; // Already monthly
  return 0; // full_price mode - no monthly component
}

/**
 * Route tax calculations by mode
 */
function getTaxCost(vehicle, external) {
  const { price } = vehicle;
  const { taxRate = 0.08, state = "CA", taxMode = "monthly", term = 60 } = external;

  let monthly = 0;

  if (taxMode === "monthly" || taxMode === "upfront") {
    monthly += calculateSalesTax({ price, taxRate, term });
    monthly += calculateRegistrationFees({ price, state, term });
    monthly += calculatePropertyTax({ price, state, taxMode });
  }

  return {
    monthly,
    components: {
      salesTax: calculateSalesTax({ price, taxRate, term }) * term,
      registrationFees: calculateRegistrationFees({ price, state, term }) * term,
      propertyTax: calculatePropertyTax({ price, state, taxMode }),
      taxMode,
      state,
    },
  };
}

// ============================================================================
// RESIDUAL VALUE EFFECT
// ============================================================================

/**
 * Calculate monthly benefit from residual value
 * Used vehicles: expected resale value reduces true cost
 * New vehicles: lease residual already handled in financing
 */
export function calculateResidualCredit(params) {
  const {
    price,
    residualRate = 0.5, // % of original price retained
    term = 60,
    isNew = false,
  } = params;

  if (isNew) return { monthly: 0, components: {} }; // Lease already factors this

  const expectedResale = price * residualRate;
  const depreciation = price - expectedResale;
  const monthly = -depreciation / term; // Negative = benefit

  return {
    monthly,
    components: {
      purchasePrice: price,
      expectedResaleValue: expectedResale,
      totalDepreciation: depreciation,
      residualRate,
      term,
    },
  };
}

// ============================================================================
// MAIN TCO ENGINE
// ============================================================================

/**
 * Calculate complete Total Cost of Ownership
 * Returns detailed breakdown suitable for React UI rendering
 */
export function calculateTCO(vehicle, user, finance, external = {}) {
  // Apply safe defaults
  const safeVehicle = {
    isNew: true,
    price: 25000,
    msrp: 25000,
    mpg: 25,
    kWhPer100km: 0,
    annualMiles: 12000,
    residualRate: 0.5,
    powertrain: "ICE",
    category: "sedan",
    ...vehicle,
  };

  const safeUser = {
    age: 35,
    state: "SI",
    ...user,
  };

  const safeFinance = {
    downPayment: 0,
    term: safeVehicle.isNew ? 36 : 60,
    apr: 0.065,
    moneyFactor: 0.0012,
    ...finance,
  };

  const safeExternal = {
    fuelPrice: 3.5,
    electricityPrice: 0.14,
    taxRate: 0.08,
    taxMode: "monthly",
    baseInsurance: 1200,
    state: safeUser.state,
    ...external,
  };

  // Calculate all components
  const financing = getFinancingCost(safeVehicle, safeFinance);
  const insurance = calculateInsurance({
    baseAnnual: safeExternal.baseInsurance,
    age: safeUser.age,
    vehicleValue: safeVehicle.price,
    vehicleType: safeVehicle.category,
    isNew: safeVehicle.isNew,
  });
  const energy = getEnergyCost(safeVehicle, safeExternal);
  const maintenance = calculateMaintenance({
    price: safeVehicle.price,
    age: 0, // New purchase
    annualMiles: safeUser.annualMiles,
    isNew: safeVehicle.isNew,
    powertrain: safeVehicle.powertrain,
  });
  const taxes = getTaxCost(safeVehicle, safeExternal);
  const residual = calculateResidualCredit({
    price: safeVehicle.price,
    residualRate: safeVehicle.residualRate,
    term: safeFinance.term,
    isNew: safeVehicle.isNew,
  });

  // Spread miscellaneous fees over term
  const feesMonthly = (external.fees || 0) / safeFinance.term;

  // Calculate total
  const totalMonthly =
    financing.monthly +
    insurance.monthly +
    energy.monthly +
    maintenance.monthly +
    taxes.monthly +
    feesMonthly +
    residual.monthly;

  // Calculate annual for reference
  const totalAnnual = totalMonthly * 12;

  // Cost per mile
  const annualMiles = safeUser.annualMiles || 12000;
  const costPerMile = totalAnnual / annualMiles;

  return {
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalAnnual: Math.round(totalAnnual * 100) / 100,
    costPerMile: Math.round(costPerMile * 10000) / 10000,

    breakdown: {
      financing: {
        monthly: Math.round(financing.monthly * 100) / 100,
        label: safeVehicle.isNew ? "Lease Payment" : "Loan Payment",
        components: financing.components,
      },
      insurance: {
        monthly: Math.round(insurance.monthly * 100) / 100,
        label: "Insurance",
        components: insurance.components,
      },
      energy: {
        monthly: Math.round(energy.monthly * 100) / 100,
        label: safeVehicle.powertrain === "EV" ? "Electricity" : "Fuel",
        components: energy.components,
      },
      maintenance: {
        monthly: Math.round(maintenance.monthly * 100) / 100,
        label: "Maintenance & Repairs",
        components: maintenance.components,
      },
      taxes: {
        monthly: Math.round(taxes.monthly * 100) / 100,
        label: "Taxes & Fees",
        components: taxes.components,
      },
      registration: {
        monthly: Math.round(feesMonthly * 100) / 100,
        label: "Registration",
        components: { fees: external.fees || 0, term: safeFinance.term },
      },
      residual: {
        monthly: Math.round(residual.monthly * 100) / 100,
        label: "Residual Value Credit",
        components: residual.components,
      },
    },

    metadata: {
      vehicle: safeVehicle,
      user: safeUser,
      finance: safeFinance,
      external: safeExternal,
      assumptions: {
        downPaymentPercent: ((safeFinance.downPayment / safeVehicle.price) * 100).toFixed(1),
        financingTerm: safeFinance.term,
        estimatedAnnualMiles: annualMiles,
        taxMode: safeExternal.taxMode,
      },
    },
  };
}

// ============================================================================
// COMPARISON & SENSITIVITY ANALYSIS
// ============================================================================

/**
 * Compare TCO between multiple vehicles
 */
export function compareTCO(vehicles, user, finance, external) {
  return vehicles.map((vehicle, idx) => ({
    id: vehicle.id || idx,
    name: vehicle.name || `Vehicle ${idx + 1}`,
    tco: calculateTCO(vehicle, user, finance, external),
  }));
}

/**
 * Sensitivity analysis: How does TCO change with different parameters?
 */
export function tcoSensitivityAnalysis(baseVehicle, baseUser, baseFinance, baseExternal, parameter, range) {
  return range.map((value) => {
    const modified = { ...baseVehicle };
    modified[parameter] = value;

    return {
      [parameter]: value,
      totalMonthly: calculateTCO(modified, baseUser, baseFinance, baseExternal).totalMonthly,
    };
  });
}

export default {
  calculateTCO,
  calculateLeasePayment,
  calculateLoanPayment,
  calculateInsurance,
  calculateFuelCost,
  calculateElectricityCost,
  calculateMaintenance,
  calculateResidualCredit,
  compareTCO,
  tcoSensitivityAnalysis,
};
