import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
  cellToAxiosParamsUpdateStatus,
  onStatusUpdateSuccess,
} from "main/utils/RecommendationRequestUtils";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function RecommendationRequestTable({ requests, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/requests/edit/${cell.row.values.id}`);
  };

  // Stryker disable all : hard to test for query caching

  // when delete success, invalidate the correct query key (depending on user role)
  const apiEndpoint = hasRole(currentUser, "ROLE_PROFESSOR")
    ? "/api/recommendationrequest/professor/all"
    : "/api/recommendationrequest/requester/all";

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    [apiEndpoint],
  );

  // when status updates, mutate 
  const statusUpdateMutation = useBackendMutation(
    (cell, newStatus) => cellToAxiosParamsUpdateStatus(cell, newStatus),
    { onSuccess: onStatusUpdateSuccess },
    [apiEndpoint],
  );

  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };


  // ADDING NEW STATTUS BUTTONS FOR PROFESSORS: Accept and Deny (for PENDING requests), 
  // and Completed (for ACCEPTED requests)
  const acceptCallback = async (cell) => {
    statusUpdateMutation.mutate(cell, "ACCEPTED");
  };

  const denyCallback = async (cell) => {
    statusUpdateMutation.mutate(cell, "DENIED");
  };

  const completeCallback = async (cell) => {
    statusUpdateMutation.mutate(cell, "COMPLETED");
  };

  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    {
      Header: "Professor Name",
      accessor: "professor.fullName",
    },
    {
      Header: "Professor Email",
      accessor: "professor.email",
    },
    {
      Header: "Requester Name",
      accessor: "requester.fullName",
    },
    {
      Header: "Requester Email",
      accessor: "requester.email",
    },
    {
      Header: "Recommendation Type",
      accessor: "recommendationType",
    },
    {
      Header: "Details",
      accessor: "details",
    },
    {
      Header: "Status",
      accessor: "status",
    },
    {
      Header: "Date Accepted/Denied",
      accessor: "dateAcceptedOrDenied",
    },
    {
      Header: "Submission Date",
      accessor: "submissionDate",
    },
    {
      Header: "Last Modified Date",
      accessor: "lastModifiedDate",
    },
    {
      Header: "Completion Date",
      accessor: "completionDate",
    },
    {
      Header: "Due Date",
      accessor: "dueDate",
    },
  ];

  //since all admins have the role of a user, we can just check if the current user has the role ROLE_USER
  if (hasRole(currentUser, "ROLE_USER")) {
    columns.push(
      ButtonColumn(
        "Delete",
        "danger",
        deleteCallback,
        "RecommendationRequestTable",
      ),
    );
  }

  if (
    hasRole(currentUser, "ROLE_USER") &&
    !hasRole(currentUser, "ROLE_ADMIN")
  ) {
    columns.push(
      ButtonColumn(
        "Edit",
        "primary",
        editCallback,
        "RecommendationRequestTable",
      ),
    );
  }

  if (hasRole(currentUser, "ROLE_PROFESSOR")) {
    columns.push(
      ButtonColumn(
        "Accept",
        "success",
        acceptCallback,
        "RecommendationRequestTable",
        (cell) => cell.row.values.status === "PENDING"
      ),
      ButtonColumn(
        "Deny",
        "danger",
        denyCallback,
        "RecommendationRequestTable",
        (cell) => cell.row.values.status === "PENDING"
      ),
      ButtonColumn(
        "Check when Completed",
        "primary",
        completeCallback,
        "RecommendationRequestTable",
        (cell) => cell.row.values.status === "ACCEPTED"
      ),
    );
  }

  return (
    <OurTable
      data={requests}
      columns={columns}
      testid={"RecommendationRequestTable"}
    />
  );
}
