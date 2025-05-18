import { toast } from "react-toastify";

export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/recommendationrequest",
    method: "DELETE",
    params: {
      id: cell.row.values.id,
    },
  };
}

export function onStatusUpdateSuccess(message) {
  console.log(message);
  toast(message);
}

// for updating status of recommendation request
export function cellToAxiosParamsUpdateStatus(cell, newStatus) {
  return {
    url: "/api/recommendationrequest/professor",
    method: "PUT",
    params: {
      id: cell.row.values.id,
    },
    data: {
      ...cell.row.original,
      status: newStatus
    }
  };
}
