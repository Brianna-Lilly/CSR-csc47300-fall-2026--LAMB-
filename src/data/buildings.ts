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
  
  export const buildingData: Record<string, BuildingInfo> = {
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
            "Middle Elevator 4"
          ],
          backElevators: ["Back Elevator 1", "Back Elevator 2"]
        },
  
        default: {
          frontElevators: ["Front Elevator 1", "Front Elevator 2"],
          escalators: ["Escalator Up", "Escalator Down"],
          middleElevators: [
            "Middle Elevator 1",
            "Middle Elevator 2",
            "Middle Elevator 3",
            "Middle Elevator 4"
          ],
          backElevators: ["Back Elevator 1", "Back Elevator 2"]
        },
  
        8: {
          frontElevators: ["Front Elevator 1", "Front Elevator 2"],
          escalators: [],
          middleElevators: [
            "Middle Elevator 1",
            "Middle Elevator 2",
            "Middle Elevator 3",
            "Middle Elevator 4"
          ],
          backElevators: ["Back Elevator 1", "Back Elevator 2"]
        }
      }
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
          backElevators: []
        }
      }
    },
  
    Marshak: {
      title: "Marshak Science Building",
      description: "Information about Marshak",
      floors: [
        1, 2, 3, 4, 5, 6, 7,
        8, 9, 10, 11, 12, 13
      ],
  
      equipment: {
        default: {
          frontElevators: [
            "Left Side 1",
            "Left Side 2",
            "Left Side 3"
          ],
          escalators: [],
          middleElevators: [
            "Right Side 1",
            "Right Side 2",
            "Right Side 3"
          ],
          backElevators: []
        }
      }
    }
  };