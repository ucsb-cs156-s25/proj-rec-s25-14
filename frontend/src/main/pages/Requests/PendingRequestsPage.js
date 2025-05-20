import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "main/utils/useBackend";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { useCurrentUser } from "main/utils/currentUser";
import { hasRole } from "main/utils/currentUser";

export default function PendingRequestsPage() {
  const { data: currentUser } = useCurrentUser();

  // make sure professors can see all pending requests for them
  // and regular users can see all requests they've made
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

  // filter requests such that only status = PENDING or ACCEPTED records are shown
  const pendingRequests = requests.filter(
    (request) => request.status === "PENDING" || request.status === "ACCEPTED"
  );

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