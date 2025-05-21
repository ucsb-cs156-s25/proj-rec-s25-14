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

// for updating status of recommendation request
export function cellToAxiosParamsUpdateStatus({ cell, newStatus }) {
  const params = {
    url: "/api/recommendationrequest/professor",
    method: "PUT",
    params: {
      id: cell.row.values.id,
    },
    data: {
      status: newStatus,
    },
  };
  return params;
}

export function onStatusUpdateSuccess(message) {
  console.log(message);
  toast(message);
}
