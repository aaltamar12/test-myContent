import { useEffect, useState } from "react";
import Menu from "../components/Menu";
import UpdateStatusModal from "../components/UpdateStatusModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRow, setSelectedRow] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [logs, setLogs] = useState([]);
  const [leadId, setLeadId] = useState("");
  const [rowId, setRowId] = useState("");
  const [loading, setLoading] = useState(true);
  const [uniqueNames, setUniqueNames] = useState([]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  async function fetchLogs() {
    const response = await fetch("/api/logs");
    const result = await response.json();
    setLogs(result);
  }

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/getSheetData");
      const result = await response.json();
      setAllRows(result);

      // Find unique names
      const allNames = result.map((row) => row[8]);
      const uniqueNames = [...new Set(allNames)];

      setUniqueNames(uniqueNames);

      const rows = leadId ? result.filter((row) => row[8] === leadId) : result;
      setData(rows);
      setLoading(false);
    }

    fetchData();
    fetchLogs();
  }, [leadId, isModalOpen]);

  // Calcula el índice del primer y último elemento de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Calcula el número total de páginas
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Genera los números de página con puntos suspensivos
  const getPageNumbers = () => {
    let pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
    } else {
      const halfMaxVisible = Math.floor(maxVisiblePages / 2);
      const leftPart =
        currentPage - halfMaxVisible > 1 ? currentPage - halfMaxVisible : 1;
      const rightPart =
        currentPage + halfMaxVisible < totalPages
          ? currentPage + halfMaxVisible
          : totalPages;

      if (leftPart > 1) {
        pageNumbers.push(1);
        if (leftPart > 2) {
          pageNumbers.push("...");
        }
      }

      for (let i = leftPart; i <= rightPart; i++) {
        pageNumbers.push(i);
      }

      if (rightPart < totalPages) {
        if (rightPart < totalPages - 1) {
          pageNumbers.push("...");
        }
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div>
      <UpdateStatusModal
        isOpen={isModalOpen}
        rowId={rowId}
        selectedRow={selectedRow}
        allRows={allRows}
        onRequestClose={() => setIsModalOpen(false)}
      />
      <div>
        <Menu />
        <label className="flex gap-2 p-4 bg-slate-600 text-white">
          Closer:
          <select
            className="bg-slate-600"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
          >
            <option disabled selected value="">
              Seleccione una opción
            </option>
            {uniqueNames.map((closerName) => {
              return <option value={closerName}>{closerName}</option>;
            })}
          </select>
        </label>
        <div className="flex gap-5">
          <div>
            {loading ? (
              <p>Cargando...</p>
            ) : (
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Agendacion</th>
                      <th>Email</th>
                      <th>UTM Source</th>
                      <th>UTM Campaign</th>
                      <th>UTM Medium</th>
                      <th>UTM Term</th>
                      <th>UTM Content</th>
                      <th>Status</th>
                      <th>Closer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((row, index) => (
                      <tr key={index}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{row[0]}</td>
                        <td>{row[1]}</td>
                        <td>{row[2]}</td>
                        <td>{row[3]}</td>
                        <td>{row[4]}</td>
                        <td>{row[5]}</td>
                        <td>{row[6]}</td>
                        <td>
                          <div
                            className={`${
                              !row[7] && "text-red-500"
                            } hover:cursor-pointer hover:text-green-500`}
                            onClick={() => {
                              setIsModalOpen(true);
                              setRowId(index);
                              setSelectedRow(row);
                            }}
                          >
                            {row[7] || "Cambiar estado"}
                          </div>
                        </td>
                        <td>{row[8]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  {data.length > itemsPerPage && (
                    <div>
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </button>{" "}
                      {getPageNumbers().map((number, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(number)}
                          style={{
                            margin: "0 5px",
                            fontWeight:
                              currentPage === number ? "bold" : "normal",
                          }}
                        >
                          {number}
                        </button>
                      ))}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={indexOfLastItem >= data.length}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col bg-gray-100 w-full justify-start items-center gap-4 p-5">
            <h1>Registro de cambios</h1>
            <div className="text-left w-full">
              {logs &&
                logs.map((log, index) => {
                  return (
                    <h6>
                      id: {index} {log}
                    </h6>
                  );
                })}
            </div>
          </div>
        </div>
        <style jsx>{`
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
          }
        `}</style>
      </div>
    </div>
  );
}
