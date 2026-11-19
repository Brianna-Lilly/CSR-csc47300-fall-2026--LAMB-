/*equipment directory pop up
see reportmodal for use */

import {
  buildingData,
  calculateEquipmentStatus,
  getCrowdingLabel,
  getEquipmentKey,
  isEscalator,
} from "../data/buildingData";

interface DirectoryModalProps {
  onClose: () => void;
}

interface DirectoryEntry {
  key: string;
  buildingTitle: string;
  floorNum: number;
  equipmentName: string;
  working: string;
  crowding: string;
}

function DirectoryModal({ onClose }: DirectoryModalProps) {
  const seen = new Set<string>();
  const items: DirectoryEntry[] = [];

  Object.keys(buildingData).forEach((buildingID) => {
    const building = buildingData[buildingID];

    building.floors.forEach((floorNum) => {
      const eqData =
        building.equipment[floorNum] || building.equipment.default;

      const allEquipmentOnFloor = [
        ...(eqData.frontElevators || []),
        ...(eqData.middleElevators || []),
        ...(eqData.backElevators || []),
        ...(eqData.escalators || []),
      ];

      allEquipmentOnFloor.forEach((equipmentName) => {
        const key = getEquipmentKey(buildingID, floorNum, equipmentName);
        if (seen.has(key)) return;
        seen.add(key);

        const status = calculateEquipmentStatus(key);
        items.push({
          key,
          buildingTitle: building.title,
          floorNum,
          equipmentName,
          working: status.working,
          crowding: status.crowding,
        });
      });
    });
  });

  return (
    <div className="report-modal" style={{ display: "flex" }}>
      <div className="report-modal-content directory-content-box">
        <button
          type="button"
          className="close-button"
          onClick={onClose}
        />
        <h2>Campus Equipment Directory</h2>
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          Live status and crowding for all elevators and escalators on campus.
        </p>

        <div id="directory-list-container" style={{ marginTop: "15px" }}>
          {items.map((item) => {
            const isOutOfService = item.working === "no";
            const workingText = isOutOfService
              ? "Out of Service"
              : "In Service";
            const workingColor = isOutOfService ? "#991b1b" : "#16a34a";

            return (
              <div key={item.key} className="directory-item-card">

                <div className="directory-item-info" style={{ gap: "6px" }}>
                <span className="directory-building-title">
                    {item.buildingTitle}
                    {isEscalator(item.equipmentName)
                    ? ` (Floor ${item.floorNum})`
                    : ""}
                </span>{" "}
                <span className="directory-equipment-name">
                    <strong>{item.equipmentName}</strong>
                </span>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: workingColor,
                      fontSize: "0.85rem",
                    }}
                  >
                    {workingText}
                  </span>
                  <span
                    className={`status-badge ${
                      item.crowding === "heavy" ? "busy" : "normal"
                    }`}
                    style={{ fontSize: "0.75rem" }}
                  >
                    {getCrowdingLabel(item.crowding)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DirectoryModal;