export interface EquipmentLists {
  frontElevators?: string[];
  escalators?: string[];
  middleElevators?: string[];
  backElevators?: string[];
}

export interface BuildingInfo {
  title: string;
  description: string;
  floors: number[];
  equipment: {
    default: EquipmentLists;
    [floorNum: number]: EquipmentLists;
  };
}

export interface BuildingDataMap {
  [key: string]: BuildingInfo;
}

export type ReportResult = "changed" | "pending" | "none";

export const buildingData: BuildingDataMap = {
  NAC: {
    title: "North Academic Center",
    description: "Information about the NAC",
    floors: [1, 2, 3, 4, 5, 6, 7, 8],
    equipment: {
      1: {
        frontElevators: ["Front Elevator 1", "Front Elevator 2"],
        escalators: ["Escalator Up"],
        middleElevators: [
          "Middle Elevator 1",
          "Middle Elevator 2",
          "Middle Elevator 3",
          "Middle Elevator 4",
        ],
        backElevators: ["Back Elevator 1", "Back Elevator 2"],
      },
      default: {
        frontElevators: ["Front Elevator 1", "Front Elevator 2"],
        escalators: ["Escalator Up", "Escalator Down"],
        middleElevators: [
          "Middle Elevator 1",
          "Middle Elevator 2",
          "Middle Elevator 3",
          "Middle Elevator 4",
        ],
        backElevators: ["Back Elevator 1", "Back Elevator 2"],
      },
      8: {
        frontElevators: ["Front Elevator 1", "Front Elevator 2"],
        escalators: [],
        middleElevators: [
          "Middle Elevator 1",
          "Middle Elevator 2",
          "Middle Elevator 3",
          "Middle Elevator 4",
        ],
        backElevators: ["Back Elevator 1", "Back Elevator 2"],
      },
    },
  },
  Shepard: {
    title: "Shepard Hall",
    description: "Information about Shepard Hall",
    floors: [1, 2, 3, 4, 5, 6, 7],
    equipment: {
      default: {
        frontElevators: ["Elevator 1", "Elevator 2"],
        escalators: [],
        middleElevators: [],
        backElevators: [],
      },
    },
  },
  Marshak: {
    title: "Marshak Science Building",
    description: "Information about Marshak",
    floors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    equipment: {
      default: {
        frontElevators: ["Left Side 1", "Left Side 2", "Left Side 3"],
        escalators: [],
        middleElevators: ["Right Side 1", "Right Side 2", "Right Side 3"],
        backElevators: [],
      },
    },
  },
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function isEscalator(name: string): boolean {
  return name.toLowerCase().includes("escalator");
}

export function getEquipmentKey(
  buildingID: string,
  floor: number | null,
  equipment: string
): string {
  if (isEscalator(equipment)) {
    return `${buildingID}|${floor}|${equipment}`;
  }
  return `${buildingID}|${equipment}`;
}

export function getEquipmentOnFloor(buildingID: string, floor: number): string[] {
  const building = buildingData[buildingID];
  if (!building) return [];

  const eq = building.equipment[floor] || building.equipment.default;
  return [
    ...(eq.frontElevators || []),
    ...(eq.middleElevators || []),
    ...(eq.backElevators || []),
    ...(eq.escalators || []),
  ];
}

export interface EquipmentState {
  working: string;
  crowding: string;
}

export type StatusMap = Record<string, EquipmentState>;

export interface NewReport {
  key: string;
  email: string;
  working: string;
  crowding: string;
  details: string;
}

export function getStatus(statuses: StatusMap, key: string): EquipmentState {
  return statuses[key] || { working: "yes", crowding: "low" };
}

export async function fetchStatuses(): Promise<StatusMap> {
  const res = await fetch(`${API_URL}/api/status`);
  if (!res.ok) throw new Error("Couldn't load equipment status");
  return res.json();
}

export async function submitReport(report: NewReport): Promise<ReportResult> {
  const res = await fetch(`${API_URL}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report),
  });
  if (!res.ok) throw new Error("Couldn't send report");
  const data = await res.json();
  return data.result;
}

export function getCrowdingLabel(crowding: string): string {
  const crowdingLabels: { [key: string]: string } = {
    unknown: "Crowding Unknown",
    low: "🐑 Low Traffic",
    moderate: "🐑🐑🐑 Moderate",
    heavy: "🐑🐑🐑🐑🐑 Heavy",
  };
  return crowdingLabels[crowding] || crowdingLabels.unknown;
}
