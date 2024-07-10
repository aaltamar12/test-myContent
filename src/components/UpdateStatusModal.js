import { useEffect, useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#__next");

const arraysContainSameElements = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;

  const countMap = {};

  // Contar elementos en arr1
  arr1.forEach((item) => {
    countMap[item] = (countMap[item] || 0) + 1;
  });

  // Restar elementos en arr2
  arr2.forEach((item) => {
    if (!countMap[item]) return false;
    countMap[item]--;
  });

  // Verificar si todos los elementos están balanceados
  return Object.values(countMap).every((count) => count === 0);
};

export default function UpdateStatusModal({
  isOpen,
  onRequestClose,
  rowId,
  allRows,
  selectedRow,
}) {
  const [leadId, setLeadId] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const searchRow = () => {
    const found = allRows.findIndex((row) =>
      arraysContainSameElements(row, selectedRow)
    );
    return found;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const foundRowId = searchRow();
    const response = await fetch("/api/getSheetData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        row: foundRowId,
        value: status,
        rowId,
        selectedRow,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(data.message);
      resetModal();
    } else {
      setMessage(data.error);
    }
  };

  const resetModal = () => {
    setStatus("");
    setMessage("");
    onRequestClose();
  };

  return (
    <Modal
      style={{
        content: {
          top: "40%",
          left: "40%",
          height: "210px",
          width: "400px",
        },
      }}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Actualizar Estado"
    >
      <h2 className="text-center bold">Actualizar Estado</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label>Row ID: {rowId + 1}</label>

        <div className="flex gap-2">
          Status:
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option disabled selected value="">
              Seleccione una opción
            </option>
            <option value="Contacted">Contacted</option>
            <option value="Waiting for response">Waiting for response</option>
            <option value="In call">In call</option>
            <option value="Win">Win</option>
            <option value="Lose">Lose</option>
          </select>
        </div>
        <br />
        <div className="flex justify-center gap-5">
          <div className="flex items-center">
            <button
              className="bg-teal-600 text-white rounded-md p-2 pl-4 pr-4"
              type="submit"
            >
              Submit
            </button>
            {message && <p>{message}</p>}
          </div>
          <button
            className="bg-red-500 text-white rounded-md p-2 pl-4 pr-4"
            onClick={onRequestClose}
          >
            Close
          </button>
        </div>
      </form>
    </Modal>
  );
}
