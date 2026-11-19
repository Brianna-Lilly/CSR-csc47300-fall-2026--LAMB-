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

export interface ReportItem {
  key: string;
  email: string;
  crowding: string;
  working: string;
  details: string;
  timestamp: number;
}

export interface EquipmentStatusObject {
  working: string;
  confirmedAt: number;
}

export interface EquipmentStatusMap {
  [key: string]: EquipmentStatusObject;
}

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

const REPORTS_KEY = "campusEquipmentReports";
const STATUS_KEY = "campusEquipmentStatus";

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

export function getReports(): ReportItem[] {
  return JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
}

export function getEquipmentStatus(): EquipmentStatusMap {
  return JSON.parse(localStorage.getItem(STATUS_KEY) || "{}");
}

export function saveEquipmentStatus(statuses: EquipmentStatusMap): void {
  localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));
}

export function calculateEquipmentStatus(key: string): {
  working: string;
  crowding: string;
} {
  const now = Date.now();
  const statuses = getEquipmentStatus();
  const reports = getReports().filter((report) => report.key === key);

  let working = statuses[key];

  if (!working || now - working.confirmedAt >= 24 * 60 * 60 * 1000) {
    working = {
      working: "yes",
      confirmedAt: 0,
    };
    statuses[key] = working;
    saveEquipmentStatus(statuses);
  }

  const recentCrowding = reports.filter(
    (report) =>
      report.crowding !== "unknown" && now - report.timestamp < 30 * 60 * 1000
  );

  let crowding = "unknown";

  if (recentCrowding.length > 0) {
    const counts: { [key: string]: number } = {};

    recentCrowding.forEach((report) => {
      counts[report.crowding] = (counts[report.crowding] || 0) + 1;
    });

    const highestCount = Math.max(...Object.values(counts));
    const tiedLevels = Object.keys(counts).filter(
      (level) => counts[level] === highestCount
    );

    const latest = recentCrowding
      .filter((report) => tiedLevels.includes(report.crowding))
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    crowding = latest.crowding;
  }

  return {
    working: working.working,
    crowding,
  };
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