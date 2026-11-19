import { useState } from 'react';

import {
  buildingData,
  type EquipmentLists
} from '../data/buildings';

interface FeatureViewProps {
  buildingID: string;
  onClose: () => void;
}

function FeatureView({ buildingID, onClose }: FeatureViewProps) {

  const building = buildingData[buildingID];

  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  if (!building) return null;

  // Get equipment for the selected floor
  const equipment: EquipmentLists | null = selectedFloor !== null
    ? building.equipment[selectedFloor] || building.equipment.default
    : null;

  return (
    <div className="feature-view">

      <div className="feature-content">

        {/* close button */}
        <button
          className="close-button"
          onClick={onClose}
        />

        {/* BUILDING NAME */}
        <h2>{building.title}</h2>

        <div id="feature-description">

          {/* FLOOR SELECTION */}
          {selectedFloor === null ? (

            <>
              <p>Select a floor:</p>

              <div className="elevator-panel">

                {building.floors.map((floor) => (

                  <button
                    key={floor}
                    className="elevator-btn"
                    onClick={() => setSelectedFloor(floor)}
                  >
                    {floor}
                  </button>

                ))}

              </div>

            </>

          ) : (

            /* SELECTED FLOOR */
            <div className="floor-split-container">

              {/* FLOOR BUTTONS */}
              <div className="split-left">

                <p style={{
                  marginTop: 0,
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  Floors
                </p>

                <div
                  className="elevator-panel"
                  style={{
                    margin: 0,
                    padding: '10px',
                    gridTemplateColumns: 'repeat(2, 40px)'
                  }}
                >

                  {building.floors.map((floor) => (

                    <button
                      key={floor}
                      className={
                        floor === selectedFloor
                          ? 'elevator-btn active-floor-btn'
                          : 'elevator-btn'
                      }
                      style={{
                        width: '40px',
                        height: '40px',
                        fontSize: '14px'
                      }}
                      onClick={() => setSelectedFloor(floor)}
                    >
                      {floor}
                    </button>

                  ))}

                </div>

              </div>

              {/* EQUIPMENT LAYOUT */}
              <div className="split-right">

                <div
                  className="floorplan-view-box"
                  style={{ marginTop: 0 }}
                >

                  <div className="custom-layout-grid">

                    <EquipmentLayout
                      buildingID={buildingID}
                      equipment={equipment!}
                    />

                  </div>

                </div>

                <button
                  style={{
                    marginTop: '10px',
                    width: '100%',
                    padding: '6px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedFloor(null)}
                >
                  Back to Floor Selection
                </button>

              </div>

            </div>

          )}

          {/* REPORT BUTTON (doesnt work yet)*/}
          <button
            id="open-report-button"
            type="button"
          >
            Report Status
          </button>

        </div>

      </div>

    </div>
  );
}


// Building equipment LAYOUT 
//(aka how many floors/ equipment in each floor): see data folder
interface EquipmentLayoutProps {
  buildingID: string;
  equipment: EquipmentLists;
}

function EquipmentLayout({
  buildingID,
  equipment
}: EquipmentLayoutProps) {

  return (

    <>
      {/* MARSHAK */}
      {buildingID === 'Marshak' && (

        <>
          {Array.from({
            length: Math.max(
              equipment.frontElevators?.length || 0,
              equipment.middleElevators?.length || 0
            )
          }).map((_, index) => (

            <div className="equipment-row-marshak" key={index}>

              <EquipmentNode
                name={equipment.frontElevators?.[index]}
                crowding="unknown"
              />
              

              <div />

              <EquipmentNode
                name={equipment.middleElevators?.[index]}
                crowding="unknown"
              />

            </div>

          ))}
        </>

      )}

      {/* NAC */}
      {buildingID === 'NAC' && (

        <>

          {equipment.frontElevators &&
            equipment.frontElevators.length > 0 && (

            <div className="equipment-row-pair nac-gap-large">

              {equipment.frontElevators.map((name) => (
                <EquipmentNode key={name} name={name} crowding="unknown" />
              ))}

            </div>

          )}

          {equipment.escalators &&
            equipment.escalators.length > 0 && (

            <div className="equipment-row-escalator nac-gap-small">

              {equipment.escalators.map((name) => (
                <EquipmentNode key={name} name={name} crowding="unknown" />
              ))}

            </div>

          )}

          {equipment.middleElevators &&
            equipment.middleElevators.length > 0 && (

            <>
              <div className="equipment-row-pair nac-gap-50">

                {equipment.middleElevators.slice(0, 2).map((name) => (
                  <EquipmentNode key={name} name={name} crowding="unknown" />
                ))}

              </div>

              <div className="equipment-row-pair nac-gap-large">

                {equipment.middleElevators.slice(2, 4).map((name) => (
                  <EquipmentNode key={name} name={name} crowding="unknown" />
                ))}

              </div>
            </>

          )}

          {equipment.backElevators &&
            equipment.backElevators.length > 0 && (

            <div className="equipment-row-pair">

              {equipment.backElevators.map((name) => (
                <EquipmentNode key={name} name={name} crowding="unknown" />
              ))}

            </div>

          )}

        </>

      )}

      {/* SHEPARD */}
      {buildingID === 'Shepard' && (

        <div className="equipment-row-pair">

          {equipment.frontElevators?.map((name) => (
            <EquipmentNode key={name} name={name} crowding="unknown" />
          ))}

        </div>

      )}

    </>

  );
}


//individual equipments levels
type CrowdingLevel = "unknown" | "low" | "moderate" | "heavy";

interface EquipmentNodeProps {
  name?: string;
  crowding: CrowdingLevel;
}

function EquipmentNode({ name, crowding }: EquipmentNodeProps) {

  if (!name) return null;

  const crowdingLabels: Record<CrowdingLevel, string> = {
    unknown: "Crowding Unknown",
    low: "🐑 Low Traffic",
    moderate: "🐑🐑🐑 Moderate",
    heavy: "🐑🐑🐑🐑🐑 Heavy"
  };

  const badgeClass =
    crowding === "heavy" ? "busy" : "normal";

  return (
    <div className="map-node elevator-node">

      <span>{name}</span>

      <span className={`status-badge ${badgeClass}`}>
        {crowdingLabels[crowding]}
      </span>

    </div>
  );
}

export default FeatureView;