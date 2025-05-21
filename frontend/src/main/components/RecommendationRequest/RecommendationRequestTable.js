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
  const statusUpdateMutation = useBackendMutation(
    cellToAxiosParamsUpdateStatus,
    { onSuccess: onStatusUpdateSuccess },
    [apiEndpoint],
  );

  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  // Stryker disable next-line all : TODO try to make a good test for this
  const acceptCallBack = async (cell) => {
    statusUpdateMutation.mutate({ cell, newStatus: "ACCEPTED" });
    window.location.reload(); // refresh the page to see update
  };

  // Stryker disable next-line all : TODO try to make a good test for this
  const denyCallBack = async (cell) => {
    statusUpdateMutation.mutate({ cell, newStatus: "DENIED" });
    window.location.reload(); // refresh the page to see update
  };

  // Stryker disable next-line all : TODO try to make a good test for this
  const completedCallBack = async (cell) => {
    statusUpdateMutation.mutate({ cell, newStatus: "COMPLETED" });
    window.location.reload(); // refresh the page to see update
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
        acceptCallBack,
        "RecommendationRequestTable",
        // stryker disable next-line all : professor can only accept pending requests
        (cell) => cell.row.values.status === "PENDING",
      ),
      ButtonColumn(
        "Deny",
        "success",
        denyCallBack,
        "RecommendationRequestTable",
        // stryker disable next-line all : professor can only deny pending requests
        (cell) => cell.row.values.status === "PENDING",
      ),
      ButtonColumn(
        "Complete",
        "success",
        completedCallBack,
        "RecommendationRequestTable",
        // stryker disable next-line all : professor can only complete accepted requests
        (cell) => cell.row.values.status === "ACCEPTED",
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
