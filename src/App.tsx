import { useState } from 'react';

import FeatureView from './components/FeatureView';

function App() {

  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  const [showDirectory, setShowDirectory] = useState(false);

  const showFeature = (building: string) => {
    console.log("Building clicked:", building);
    setSelectedBuilding(building);
  };

  const closeFeature = () => {
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


      {/* DIRECTORY BUTTON */}
      <div className="directory-btn-container">

        <button
          type="button"
          className="floating-directory-btn"
          onClick={() => setShowDirectory(true)}
        >
          Campus Directory
        </button>

      </div>


      {/* temporary for later full equipment modal - later feature
      cause i didnt get it to work yet :/*/}
      {showDirectory && (

        <div className="report-modal">

          <div className="report-modal-content directory-content-box">

            <button
              className="close-button"
              onClick={() => setShowDirectory(false)}
            />

            <h2>Campus Equipment Directory</h2>

            <p>
              Live status and crowding for all elevators
              and escalators on campus.
            </p>

          </div>

        </div>

      )}

    </div>

  );
}

export default App;