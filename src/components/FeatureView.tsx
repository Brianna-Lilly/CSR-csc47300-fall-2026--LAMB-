import { useEffect, useState } from 'react';

import {
  buildingData,
  getCrowdingLabel,
  getEquipmentKey,
  getStatus,
  isEscalator,
  type EquipmentLists,
  type StatusMap
} from '../data/buildingData';
import { useStatuses } from '../data/useStatuses';
import ReportModal from './ReportModal';

interface FeatureViewProps {
  buildingID: string;
  onClose: () => void;
}

function FeatureView({ buildingID, onClose }: FeatureViewProps) {

  const building = buildingData[buildingID];

  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [doorOpen, setDoorOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportEquipment, setReportEquipment] = useState<string | null>(null);
  const { statuses, loading, error, refresh } = useStatuses();

  // Open elevator doors after a floor is selected
  useEffect(() => {
    if (selectedFloor === null) {
      setDoorOpen(false);
      return;
    }

    setDoorOpen(false);
    const frame = requestAnimationFrame(() => {
      setDoorOpen(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedFloor]);

  if (!building) return null;

  // Get equipment for the selected floor
  const equipment: EquipmentLists | null = selectedFloor !== null
    ? building.equipment[selectedFloor] || building.equipment.default
    : null;

  const openReport = (name: string | null) => {
    setReportEquipment(name);
    setShowReport(true);
  };

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

        {error && <p className="status-error">{error}</p>}

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

                {/* ELEVATOR DOORS OVER FLOORPLAN */}
                <div className="floorplan-door-wrapper">

                  <div className={`elevator-door-overlay ${doorOpen ? 'open' : ''}`}>
                    <div className="elevator-door left" />
                    <div className="elevator-door right" />
                  </div>

                  <div
                    className="floorplan-view-box"
                    style={{ marginTop: 0 }}
                  >

                    <div className="custom-layout-grid">

                      <EquipmentLayout
                        buildingID={buildingID}
                        floor={selectedFloor}
                        equipment={equipment!}
                        statuses={statuses}
                        loading={loading}
                        onSelect={openReport}
                      />

                    </div>

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

          <button
            id="open-report-button"
            type="button"
            onClick={() => openReport(null)}
          >
            Report Status
          </button>

        </div>

      </div>

      {showReport && (
        <ReportModal
          buildingID={buildingID}
          floor={selectedFloor}
          equipment={reportEquipment}
          onClose={() => setShowReport(false)}
          onSubmitted={refresh}
        />
      )}

    </div>
  );
}


// Building equipment LAYOUT
//(aka how many floors/ equipment in each floor): see data folder
interface EquipmentLayoutProps {
  buildingID: string;
  floor: number;
  equipment: EquipmentLists;
  statuses: StatusMap;
  loading: boolean;
  onSelect: (name: string) => void;
}

function EquipmentLayout({
  buildingID,
  floor,
  equipment,
  statuses,
  loading,
  onSelect
}: EquipmentLayoutProps) {

  const node = (name?: string) => (
    <EquipmentNode
      key={name}
      name={name}
      status={name ? getStatus(statuses, getEquipmentKey(buildingID, floor, name)) : null}
      loading={loading}
      onSelect={onSelect}
    />
  );

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
              {node(equipment.frontElevators?.[index])}
              <div />
              {node(equipment.middleElevators?.[index])}
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
              {equipment.frontElevators.map(node)}
            </div>

          )}

          {equipment.escalators &&
            equipment.escalators.length > 0 && (

            <div className="equipment-row-escalator nac-gap-small">
              {equipment.escalators.map(node)}
            </div>

          )}

          {equipment.middleElevators &&
            equipment.middleElevators.length > 0 && (

            <>
              <div className="equipment-row-pair nac-gap-50">
                {equipment.middleElevators.slice(0, 2).map(node)}
              </div>

              <div className="equipment-row-pair nac-gap-large">
                {equipment.middleElevators.slice(2, 4).map(node)}
              </div>
            </>

          )}

          {equipment.backElevators &&
            equipment.backElevators.length > 0 && (

            <div className="equipment-row-pair">
              {equipment.backElevators.map(node)}
            </div>

          )}

        </>

      )}

      {/* SHEPARD */}
      {buildingID === 'Shepard' && (

        <div className="equipment-row-pair">
          {equipment.frontElevators?.map(node)}
        </div>

      )}

    </>

  );
}


//individual equipment
interface EquipmentNodeProps {
  name?: string;
  status: { working: string; crowding: string } | null;
  loading: boolean;
  onSelect: (name: string) => void;
}

function EquipmentNode({ name, status, loading, onSelect }: EquipmentNodeProps) {

  if (!name || !status) return null;

  const { working, crowding } = status;
  const down = working === "no";

  const typeClass = isEscalator(name) ? "escalator-node" : "elevator-node";

  return (
    <div
      className={`map-node ${typeClass} ${down ? "out-of-service" : ""}`}
      title="Click to report status"
      onClick={() => onSelect(name)}
    >

      <span>{name}</span>

      {loading ? (
        <span className="status-badge normal">Loading...</span>
      ) : (
        <>
          <span className={`status-badge ${down ? "busy" : "normal"}`}>
            {down ? "Out of Service" : "In Service"}
          </span>

          {!down && (
            <span className={`status-badge ${crowding === "heavy" ? "busy" : "normal"}`}>
              {getCrowdingLabel(crowding)}
            </span>
          )}
        </>
      )}

    </div>
  );
}

export default FeatureView;