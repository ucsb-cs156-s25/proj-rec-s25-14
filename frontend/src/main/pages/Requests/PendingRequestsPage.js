import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "main/utils/useBackend";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { useCurrentUser } from "main/utils/currentUser";
import { hasRole } from "main/utils/currentUser";

export default function PendingRequestsPage() {
  const { data: currentUser } = useCurrentUser();

  const apiEndpoint = hasRole(currentUser, "ROLE_PROFESSOR")
    ? "/api/recommendationrequest/professor/all"
    : "/api/recommendationrequest/requester/all";

  const {
    data: requests,
    error: _error,
    status: _status,
  } = useBackend(
    [apiEndpoint],
    {
      method: "GET",
      url: apiEndpoint,
    },
    [],
  );

  // Filter requests for professors to only show PENDING and ACCEPTED records
  const pendingRequests = requests?.filter(
    (request) => request.status === "PENDING" || request.status === "ACCEPTED",
  ) || [];

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Pending Requests</h1>
        <div data-testid="RecommendationRequestTable">
          <RecommendationRequestTable
            requests={pendingRequests}
            currentUser={currentUser}
          />
        </div>
      </div>
    </BasicLayout>
  );
}
