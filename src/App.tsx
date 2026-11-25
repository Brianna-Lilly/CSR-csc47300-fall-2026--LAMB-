import { useEffect, useState } from 'react';
import FeatureView from './components/FeatureView';
import DirectoryModal from './components/DirectoryModal';

const NIGHT_MODE_KEY = 'lambNightMode';

function getInitialNightMode(): boolean {
  try {
    return window.localStorage.getItem(NIGHT_MODE_KEY) === 'true';
  } catch {
    return false;
  }
}

function App() {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [showDirectory, setShowDirectory] = useState<boolean>(false);
  const [nightMode, setNightMode] = useState<boolean>(getInitialNightMode);

  useEffect(() => {
    document.body.classList.toggle('night-mode', nightMode);
    try {
      window.localStorage.setItem(NIGHT_MODE_KEY, String(nightMode));
    } catch {
      // Ignore storage write errors in restricted browser modes
    }
  }, [nightMode]);

  const showFeature = (building: string): void => {
    setSelectedBuilding(building);
  };

  const closeFeature = (): void => {
    setSelectedBuilding(null);
  };

  return (
    <div className="container">
      {/* LEFT SIDE - MAP */}
      <div className="side">
        <div className="map-container">
          <img src="/images/CCNYMap.png" alt="CCNY Map" />

          <div
            className="building building-s"
            onClick={() => showFeature('Shepard')}
          >
            <img src="/images/barn3.png" alt="Shepard" />
          </div>

          <div
            className="building building-m"
            onClick={() => showFeature('Marshak')}
          >
            <img src="/images/barn2.png" alt="Marshak" />
          </div>

          <div
            className="building building-n"
            onClick={() => showFeature('NAC')}
          >
            <img src="/images/barn1.png" alt="NAC" />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - BUILDING NAMES */}
      <div className="side">
        <div
          className="title title-s"
          onClick={() => showFeature('Shepard')}
        >
          Shepard Hall
        </div>

        <div
          className="title title-m"
          onClick={() => showFeature('Marshak')}
        >
          Marshak Science Building
        </div>

        <div
          className="title title-n"
          onClick={() => showFeature('NAC')}
        >
          North Academic Center
        </div>
      </div>

      {/* BUILDING POP-UP */}
      {selectedBuilding && (
        <FeatureView
          key={selectedBuilding}
          buildingID={selectedBuilding}
          onClose={closeFeature}
        />
      )}

      {/* DIRECTORY & NIGHT MODE BUTTONS */}
      <div className="directory-btn-container">
        <img
          src={
            nightMode
              ? '/images/Lamb_Icon_Asleep.png'
              : '/images/Lamb_Icon_Awake.png'
          }
          alt={nightMode ? 'Sleeping lamb icon' : 'Awake lamb icon'}
          className="mode-lamb-icon"
        />

        <button
          type="button"
          className="floating-directory-btn"
          onClick={() => setNightMode((prev) => !prev)}
        >
          {nightMode ? 'Day Mode' : 'Night Mode'}
        </button>

        <button
          type="button"
          className="floating-directory-btn"
          onClick={() => setShowDirectory(true)}
        >
          Campus Directory
        </button>
      </div>

      {/* CAMPUS DIRECTORY MODAL */}
      {showDirectory && (
        <DirectoryModal onClose={() => setShowDirectory(false)} />
      )}
    </div>
  );
}

export default App;