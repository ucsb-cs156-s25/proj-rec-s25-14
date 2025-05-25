import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";

import { useBackend } from "main/utils/useBackend";
import { useCurrentUser } from "main/utils/currentUser";

const AdminRequestsPage = () => {
  const { data: currentUser } = useCurrentUser();
  const {
    data: all,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/recommendationrequest/admin/all"],
    { method: "GET", url: "/api/recommendationrequest/admin/all" },
    [],
  );

  return (
    <BasicLayout>
      <h2>All Requests</h2>
      <RecommendationRequestTable requests={all} currentUser={currentUser} />
    </BasicLayout>
  );
};

export default AdminRequestsPage;
