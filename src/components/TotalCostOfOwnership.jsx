import React, { useState, useMemo } from 'react';
import { calculateTCO } from '../services/tcoEngine';
import './TotalCostOfOwnership.css';

/**
 * Total Cost of Ownership Calculator Component
 * Displays comprehensive monthly ownership cost breakdown
 */
export default function TotalCostOfOwnership({
  vehicle,
  user,
  finance,
  external,
  onCompare,
}) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Calculate TCO with memoization to avoid recalculation
  const tco = useMemo(
    () => calculateTCO(vehicle, user, finance, external),
    [vehicle, user, finance, external]
  );

  const handleToggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="tco-container">
      {/* Main Cost Display */}
      <div className="tco-main-display">
        <div className="tco-monthly-cost">
          <div className="tco-label">Monthly Cost</div>
          <div className="tco-amount">${tco.totalMonthly.toFixed(0)}</div>
          <div className="tco-subtext">
            {tco.costPerMile.toFixed(2)}¢ per mile
          </div>
        </div>

        <div className="tco-action-buttons">
          <button className="tco-btn-primary" onClick={onCompare}>
            Compare Vehicles
          </button>
          <button
            className="tco-btn-secondary"
            onClick={() => setShowAssumptions(!showAssumptions)}
          >
            View Assumptions
          </button>
        </div>
      </div>

      {/* Annual Cost Reference */}
      <div className="tco-annual-reference">
        <div className="tco-stat">
          <span className="tco-stat-label">Annual Cost</span>
          <span className="tco-stat-value">${tco.totalAnnual.toFixed(0)}</span>
        </div>
        <div className="tco-stat">
          <span className="tco-stat-label">Financing Term</span>
          <span className="tco-stat-value">
            {tco.metadata.finance.term} months
          </span>
        </div>
        <div className="tco-stat">
          <span className="tco-stat-label">Annual Miles</span>
          <span className="tco-stat-value">
            {tco.metadata.assumptions.estimatedAnnualMiles.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Cost Breakdown by Category */}
      <div className="tco-breakdown">
        <h3 className="tco-breakdown-title">Cost Breakdown</h3>

        {Object.entries(tco.breakdown).map(([key, item]) => (
          <div key={key} className="tco-line-item">
            <div
              className="tco-line-header"
              onClick={() => handleToggleSection(key)}
            >
              <div className="tco-line-info">
                <span className="tco-line-label">{item.label}</span>
                <span className="tco-line-expand-icon">
                  {expandedSection === key ? '−' : '+'}
                </span>
              </div>
              <span className="tco-line-amount">
                ${item.monthly.toFixed(0)}/mo
              </span>
            </div>

            {/* Expanded Details */}
            {expandedSection === key && (
              <div className="tco-line-details">
                {key === 'financing' && (
                  <>
                    <DetailRow
                      label={tco.vehicle.isNew ? 'Depreciation Fee' : 'Principal'}
                      value={item.components.depreciationFee || item.components.principal}
                    />
                    {tco.vehicle.isNew && (
                      <DetailRow
                        label="Finance Fee"
                        value={item.components.financeFee}
                      />
                    )}
                    {!tco.vehicle.isNew && (
                      <DetailRow
                        label="Interest Rate"
                        value={`${(item.components.apr * 100).toFixed(1)}%`}
                      />
                    )}
                    <DetailRow
                      label="Down Payment"
                      value={item.components.downPayment}
                    />
                  </>
                )}

                {key === 'insurance' && (
                  <>
                    <DetailRow
                      label="Base Annual"
                      value={item.components.baseAnnual}
                    />
                    <DetailRow
                      label="Age Impact"
                      value={`Age ${tco.user.age}`}
                    />
                    <DetailRow
                      label="Vehicle Type"
                      value={tco.vehicle.category}
                    />
                  </>
                )}

                {key === 'energy' && (
                  <>
                    {tco.vehicle.powertrain === 'EV' ? (
                      <>
                        <DetailRow
                          label="Consumption"
                          value={`${item.components.kWhPer100km} kWh/100km`}
                        />
                        <DetailRow
                          label="Annual Usage"
                          value={`${item.components.kWhPerYear.toLocaleString()} kWh`}
                        />
                        <DetailRow
                          label="Electricity Rate"
                          value={`$${item.components.electricityPrice}/kWh`}
                        />
                      </>
                    ) : (
                      <>
                        <DetailRow
                          label="EPA Rating"
                          value={`${item.components.mpg} MPG`}
                        />
                        <DetailRow
                          label="Annual Usage"
                          value={`${item.components.gallonsPerYear.toLocaleString()} gallons`}
                        />
                        <DetailRow
                          label="Fuel Price"
                          value={`$${item.components.fuelPrice}/gallon`}
                        />
                      </>
                    )}
                  </>
                )}

                {key === 'maintenance' && (
                  <>
                    <DetailRow
                      label="Age Factor"
                      value={item.components.ageFactor.toFixed(2)}
                    />
                    <DetailRow
                      label="Mileage Factor"
                      value={item.components.mileageFactor.toFixed(2)}
                    />
                    <DetailRow
                      label="Powertrain"
                      value={tco.vehicle.powertrain}
                    />
                    <DetailRow
                      label="Annual Cost"
                      value={item.components.annualCost}
                    />
                  </>
                )}

                {key === 'taxes' && (
                  <>
                    <DetailRow
                      label="Tax Rate"
                      value={`${(item.components.taxRate || 0.08 * 100).toFixed(1)}%`}
                    />
                    <DetailRow
                      label="State"
                      value={item.components.state}
                    />
                    <DetailRow
                      label="Tax Mode"
                      value={item.components.taxMode}
                    />
                  </>
                )}

                {key === 'residual' && item.monthly !== 0 && (
                  <>
                    <DetailRow
                      label="Purchase Price"
                      value={item.components.purchasePrice}
                    />
                    <DetailRow
                      label="Expected Resale"
                      value={item.components.expectedResaleValue}
                    />
                    <DetailRow
                      label="Residual Rate"
                      value={`${(item.components.residualRate * 100).toFixed(0)}%`}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Assumptions Section */}
      {showAssumptions && (
        <div className="tco-assumptions">
          <h3>Calculation Assumptions</h3>
          <div className="tco-assumptions-grid">
            <div>
              <strong>Vehicle</strong>
              <p>Price: ${tco.vehicle.price.toLocaleString()}</p>
              <p>Type: {tco.vehicle.isNew ? 'New' : 'Used'}</p>
              <p>Residual Rate: {(tco.vehicle.residualRate * 100).toFixed(0)}%</p>
            </div>
            <div>
              <strong>Financing</strong>
              <p>
                Down Payment: $
                {tco.metadata.finance.downPayment.toLocaleString()} (
                {tco.metadata.assumptions.downPaymentPercent}%)
              </p>
              <p>Term: {tco.metadata.finance.term} months</p>
              <p>
                Rate:{' '}
                {tco.vehicle.isNew
                  ? `${(tco.metadata.finance.moneyFactor * 10000).toFixed(2)} money factor`
                  : `${(tco.metadata.finance.apr * 100).toFixed(1)}% APR`}
              </p>
            </div>
            <div>
              <strong>User Profile</strong>
              <p>Age: {tco.user.age}</p>
              <p>Region: {tco.user.state || 'SI'}</p>
            </div>
            <div>
              <strong>External Factors</strong>
              <p>Annual Miles: {tco.metadata.assumptions.estimatedAnnualMiles.toLocaleString()}</p>
              <p>Fuel Price: ${tco.external.fuelPrice}/gal</p>
              <p>Tax Mode: {tco.external.taxMode}</p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="tco-disclaimer">
        <p>
          <strong>Disclaimer:</strong> This TCO estimate is based on typical ownership
          scenarios and historical data. Actual costs will vary based on driving patterns,
          maintenance choices, interest rates, insurance rates, and market conditions.
          Use this as a starting point for comparison, not an exact prediction.
        </p>
      </div>
    </div>
  );
}

/**
 * Helper component for detail rows
 */
function DetailRow({ label, value }) {
  const formattedValue =
    typeof value === 'number' && value > 1
      ? `$${value.toFixed(0)}`
      : String(value);

  return (
    <div className="tco-detail-row">
      <span className="tco-detail-label">{label}</span>
      <span className="tco-detail-value">{formattedValue}</span>
    </div>
  );
}
