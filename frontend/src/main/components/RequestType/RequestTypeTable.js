import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/RequestTypeUtils";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function RequestTypeTable({ requesttype, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/requesttypes/create/${cell.row.values.id}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/requesttypes/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    {
      Header: "Request Type",
      accessor: "requestType",
    },
  ];

  //Only admins and professors should be able to see and use the delete and edit buttons
  if (
    hasRole(currentUser, "ROLE_ADMIN") ||
    hasRole(currentUser, "ROLE_PROFESSOR")
  ) {
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "RequestTypeTable"),
    );
  }

  if (
    hasRole(currentUser, "ROLE_ADMIN") ||
    hasRole(currentUser, "ROLE_PROFESSOR")
  ) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "RequestTypeTable"),
    );
  }

  return (
    <OurTable
      data={requesttype}
      columns={columns}
      testid={"RequestTypeTable"}
    />
  );
}
