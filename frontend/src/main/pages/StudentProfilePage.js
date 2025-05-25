import { Row, Col, Button } from "react-bootstrap";
import RoleBadge from "main/components/Profile/RoleBadge";
import { useCurrentUser } from "main/utils/currentUser";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { hasRole } from "main/utils/currentUser";
import { useBackend } from "main/utils/useBackend";
import { Inspector } from "react-inspector";
import { useNavigate } from "react-router-dom";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";

const StudentProfilePage = () => {
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();

  const {
    data: requests,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/recommendationrequest/requester/all"],
    // Stryker disable next-line all
    { method: "GET", url: "/api/recommendationrequest/requester/all" },
    // Stryker disable next-line all
    [],
  );

  if (!hasRole(currentUser, "ROLE_STUDENT")) {
    return <p>Students only.</p>;
  }

  const { email, pictureUrl, fullName } = currentUser.root.user;

  return (
    <BasicLayout>
      <Row className="align-items-center profile-header mb-5 text-center text-md-left">
        <Col md={2}>
          <img
            src={pictureUrl}
            alt="Profile"
            className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
            data-testid="profile-picture"
          />
        </Col>
        <Col md>
          <h2 data-testid="profile-name">{fullName}</h2>
          <p className="lead text-muted" data-testid="profile-email">
            {email}
          </p>
          <RoleBadge role={"ROLE_STUDENT"} currentUser={currentUser} />
        </Col>
      </Row>

      <Row className="text-left mb-4">
        <Inspector data={currentUser.root} />
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 data-testid="requests-header">My Recommendation Requests</h1>
        <Button
          variant="primary"
          // Stryker disable next-line all
          onClick={() => navigate("/recommendationrequest/post")}
          data-testid="create-request-button"
        >
          Create New Request
        </Button>
      </div>

      <div data-testid="RecommendationRequestTable">
        <RecommendationRequestTable
          requests={requests}
          currentUser={currentUser}
          // Stryker disable next-line all
          showActions={true}
        />
      </div>
    </BasicLayout>
  );
};

export default StudentProfilePage;
