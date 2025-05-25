import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "main/pages/HomePage";
import ProfilePage from "main/pages/ProfilePage";
import AdminUsersPage from "main/pages/AdminUsersPage";
import AdminRequestsPage from "main/pages/AdminRequestsPage";

import PendingRequestsPage from "main/pages/Requests/PendingRequestsPage";
import CompletedRequestsPage from "main/pages/Requests/CompletedRequestsPage";
import StatisticsPage from "main/pages/Requests/StatisticsPage";
import StudentProfilePage from "main/pages/StudentProfilePage";

import { hasRole, useCurrentUser } from "main/utils/currentUser";

import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import RequestTypeIndexPage from "main/pages/RequestType/RequestTypeIndexPage";
import RequestTypeCreatePage from "main/pages/RequestType/RequestTypeCreatePage";
import RequestTypeEditPage from "main/pages/RequestType/RequestTypeEditPage";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";

function App() {
  const { data: currentUser } = useCurrentUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/profile" element={<ProfilePage />} />
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route exact path="/admin/users" element={<AdminUsersPage />} />
            <Route
              exact
              path="/admin/requests"
              element={<AdminRequestsPage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_STUDENT") && (
          <>
            <Route
              exact
              path="/studentprofile"
              element={<StudentProfilePage />}
            />
            <Route
              exact
              path="/recommendationrequest/post"
              element={<RecommendationRequestCreatePage />}
            />
            <Route
              exact
              path="/recommendationrequest/requester/all"
              element={<RecommendationRequestTable />}
            />
            <Route
              exact
              path="/requests/edit/:id"
              element={<RequestTypeEditPage />}
            />
          </>
        )}
        {(hasRole(currentUser, "ROLE_PROFESSOR") ||
          hasRole(currentUser, "ROLE_STUDENT")) && (
          <>
            <Route
              exact
              path="/requests/pending"
              element={<PendingRequestsPage />}
            />
            <Route
              exact
              path="/requests/completed"
              element={<CompletedRequestsPage />}
            />
            <Route
              exact
              path="/requests/statistics"
              element={<StatisticsPage />}
            />
          </>
        )}

        {(hasRole(currentUser, "ROLE_PROFESSOR") ||
          hasRole(currentUser, "ROLE_ADMIN")) && (
          <>
            <Route
              exact
              path="/settings/requesttypes"
              element={<RequestTypeIndexPage />}
            />
            <Route
              exact
              path="/settings/requesttypes/create"
              element={<RequestTypeCreatePage />}
            />
            <Route
              exact
              path="/settings/requesttypes/create/:id"
              element={<RequestTypeEditPage />}
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
