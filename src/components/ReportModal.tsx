import { useState, type FormEvent } from "react";

import {
  buildingData,
  getEquipmentKey,
  getEquipmentOnFloor,
  submitReport,
} from "../data/buildingData";

interface ReportModalProps {
  buildingID: string;
  floor: number | null;
  equipment: string | null;
  onClose: () => void;
  onSubmitted: () => void;
}

function ReportModal({
  buildingID,
  floor,
  equipment,
  onClose,
  onSubmitted,
}: ReportModalProps) {
  const building = buildingData[buildingID];

  const [selectedFloor, setSelectedFloor] = useState(floor ?? building.floors[0]);
  const options = getEquipmentOnFloor(buildingID, selectedFloor);

  const [selectedEquipment, setSelectedEquipment] = useState(
    equipment && options.includes(equipment) ? equipment : options[0] || ""
  );
  const [email, setEmail] = useState("");
  const [working, setWorking] = useState("unknown");
  const [crowding, setCrowding] = useState("unknown");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const changeFloor = (value: number) => {
    setSelectedFloor(value);
    const list = getEquipmentOnFloor(buildingID, value);
    if (!list.includes(selectedEquipment)) {
      setSelectedEquipment(list[0] || "");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (working === "unknown" && crowding === "unknown") {
      setMessage("Let us know if it's working or how crowded it is.");
      return;
    }

    setSending(true);
    setMessage("");

    let result;
    try {
      result = await submitReport({
        key: getEquipmentKey(buildingID, selectedFloor, selectedEquipment),
        email: email.trim(),
        working,
        crowding,
        details: details.trim(),
      });
    } catch {
      setMessage("Couldn't send your report. Check your connection and try again.");
      return;
    } finally {
      setSending(false);
    }

    const statusText = working === "no" ? "out of service" : "back in service";

    if (result === "changed") {
      setMessage(`Thanks! ${selectedEquipment} is now marked ${statusText}.`);
    } else if (result === "pending") {
      setMessage(
        `Thanks! One more person needs to report it ${statusText} before the status changes.`
      );
    } else {
      setMessage("Thanks for the update!");
    }

    setSubmitted(true);
    onSubmitted();
  };

  return (
    <div className="report-modal" style={{ display: "flex" }}>
      <div className="report-modal-content">
        <button type="button" className="close-button" onClick={onClose} />

        <h2>Report Status</h2>
        <p style={{ fontSize: "0.9rem", color: "#555", margin: 0 }}>
          {building.title}
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="report-floor">Floor</label>
          <select
            id="report-floor"
            value={selectedFloor}
            onChange={(e) => changeFloor(Number(e.target.value))}
            disabled={submitted}
          >
            {building.floors.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <label htmlFor="report-equipment">Elevator / Escalator</label>
          <select
            id="report-equipment"
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            disabled={submitted}
          >
            {options.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <label htmlFor="report-working">Is it working?</label>
          <select
            id="report-working"
            value={working}
            onChange={(e) => setWorking(e.target.value)}
            disabled={submitted}
          >
            <option value="unknown">Not sure</option>
            <option value="yes">Yes, it's working</option>
            <option value="no">No, it's out of service</option>
          </select>

          <label htmlFor="report-crowding">How crowded is it?</label>
          <select
            id="report-crowding"
            value={crowding}
            onChange={(e) => setCrowding(e.target.value)}
            disabled={submitted}
          >
            <option value="unknown">Not sure</option>
            <option value="low">🐑 Low</option>
            <option value="moderate">🐑🐑🐑 Moderate</option>
            <option value="heavy">🐑🐑🐑🐑🐑 Heavy</option>
          </select>

          <label htmlFor="report-email">Email</label>
          <input
            id="report-email"
            type="email"
            required
            placeholder="you@citymail.cuny.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitted}
          />

          <label htmlFor="report-details">Details (optional)</label>
          <textarea
            id="report-details"
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            disabled={submitted}
          />

          {message && <p id="report-message">{message}</p>}

          <button
            type="submit"
            className="report-submit"
            disabled={submitted || sending || !selectedEquipment}
          >
            {submitted ? "Submitted" : sending ? "Sending..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;
