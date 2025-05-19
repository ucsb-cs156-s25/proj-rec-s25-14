import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
  cellToAxiosParamsUpdateStatus,
} from "main/utils/RecommendationRequestUtils";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

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
    cellToAxiosParamsUpdateStatus,
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
    statusUpdateMutation.mutate({ cell, newStatus: "ACCEPTED" });
    window.location.reload(); // refresh the page
  };

  const denyCallback = async (cell) => {
    statusUpdateMutation.mutate({ cell, newStatus: "DENIED" });
    window.location.reload();
  };

  const completeCallback = async (cell) => {
    statusUpdateMutation.mutate({ cell, newStatus: "COMPLETED" });
    window.location.reload();
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
      // turn into readable format mm/dd/yyyy
      Cell: ({ value }) => {
        return formatDate(value);
      },
    },
    {
      Header: "Last Modified Date",
      accessor: "lastModifiedDate",
      // turn into readable format mm/dd/yyyy
      Cell: ({ value }) => {
        return formatDate(value);
      },
    },
    {
      Header: "Completion Date",
      accessor: "completionDate",
      // turn into readable format mm/dd/yyyy
      Cell: ({ value }) => {
        return formatDate(value);
      },
    },
    {
      Header: "Due Date",
      accessor: "dueDate",
      // turn into readable format mm/dd/yyyy
      Cell: ({ value }) => {
        return formatDate(value);
      },
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
    // if status = PENDING, show Accept and Deny buttons
    if ((cell) => cell.row.values.status === "PENDING") {
      columns.push(
        ButtonColumn(
          "Accept",
          "success",
          acceptCallback,
          "RecommendationRequestTable",
          ),
          ButtonColumn(
            "Deny",
            "danger",
            denyCallback,
            "RecommendationRequestTable",
          )
      )
    }
    else if ((cell) => cell.row.values.status === "ACCEPTED") {
      columns.push(
        ButtonColumn(
          "Completed",
          "primary",
          completeCallback,
          "RecommendationRequestTable",
        ),
        ButtonColumn(
          "Deny",
          "danger",
          denyCallback,
          "RecommendationRequestTable",
        )
      );
    }
  }

    return (
    <OurTable
      data={requests}
      columns={columns}
      testid={"RecommendationRequestTable"}
    />
  );
}
