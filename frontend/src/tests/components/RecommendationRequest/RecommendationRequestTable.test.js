import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { hasRole } from "main/utils/currentUser";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("UserTable tests", () => {
  const queryClient = new QueryClient();

  test("Has the expected column headers and content for ordinary user", () => {
    const currentUser = currentUserFixtures.userOnly;

    expect(hasRole(currentUser, "ROLE_USER")).toBe(true);
    expect(hasRole(currentUser, "ROLE_ADMIN")).toBe(false);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "Professor Name",
      "Professor Email",
      "Requester Name",
      "Requester Email",
      "Recommendation Type",
      "Details",
      "Status",
      "Submission Date",
      "Last Modified Date",
      "Completion Date",
      "Due Date",
    ];
    const expectedFields = [
      "id",
      "professor.fullName",
      "professor.email",
      "requester.fullName",
      "requester.email",
      "recommendationType",
      "details",
      "status",
      "submissionDate",
      "lastModifiedDate",
      "completionDate",
      "dueDate",
    ];
    const testId = "RecommendationRequestTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "3",
    );

    const editButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    expect(editButton).toHaveClass("btn btn-primary");

    const deleteButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
  });

  test("Has the expected column headers and content for adminUser", () => {
    const currentUser = currentUserFixtures.adminUser;

    expect(hasRole(currentUser, "ROLE_ADMIN")).toBe(true);
    expect(hasRole(currentUser, "ROLE_USER")).toBe(true);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "Professor Name",
      "Professor Email",
      "Requester Name",
      "Requester Email",
      "Recommendation Type",
      "Details",
      "Status",
      "Submission Date",
      "Last Modified Date",
      "Completion Date",
      "Due Date",
    ];
    const expectedFields = [
      "id",
      "professor.fullName",
      "professor.email",
      "requester.fullName",
      "requester.email",
      "recommendationType",
      "details",
      "status",
      "submissionDate",
      "lastModifiedDate",
      "completionDate",
      "dueDate",
    ];
    const testId = "RecommendationRequestTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "3",
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");

    const editButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page for user", async () => {
    const currentUser = currentUserFixtures.userOnly;

    expect(hasRole(currentUser, "ROLE_USER")).toBe(true);
    expect(hasRole(currentUser, "ROLE_ADMIN")).toBe(false);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });

    const editButton = screen.getByTestId(
      `RecommendationRequestTable-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/requests/edit/2"),
    );
  });

  //Added for mutation coverage for the case in which the user is neither a user nor an admin
  test("A user with no roles has expected content", () => {
    const currentUser = currentUserFixtures.notLoggedIn;

    expect(hasRole(currentUser, "ROLE_USER")).toBe(undefined);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const testId = "RecommendationRequestTable";

    const editButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).not.toBeInTheDocument();

    const deleteButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).not.toBeInTheDocument();
  });

  //for user
  test("Delete button calls delete callback (for user)", async () => {
    // arrange
    const currentUser = currentUserFixtures.userOnly;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/recommendationrequest")
      .reply(200, { message: "Recommendation Request deleted" });

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered

    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });

    const deleteButton = screen.getByTestId(
      `RecommendationRequestTable-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act - click the delete button
    fireEvent.click(deleteButton);

    // assert - check that the delete endpoint was called

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
  });

  //for admin
  test("Delete button calls delete callback (admin)", async () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/recommendationrequest")
      .reply(200, { message: "Recommendation Request deleted" });

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered

    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });

    const deleteButton = screen.getByTestId(
      `RecommendationRequestTable-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act - click the delete button
    fireEvent.click(deleteButton);

    // assert - check that the delete endpoint was called

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
  });

  // test accept button changes status to accepted
  test("Denied button calls deny callback (professor) and updates status to denied", async () => {
    // arrange
    const currentUser = currentUserFixtures.professorUser;
    expect(hasRole(currentUser, "ROLE_PROFESSOR")).toBe(true);
    expect(hasRole(currentUser, "ROLE_USER")).toBe(true);
    expect(hasRole(currentUser, "ROLE_ADMIN")).toBe(false);

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onPut("/api/recommendationrequest")
      .reply(200, { message: "Recommendation Request updated" });

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.pendingRecommendation}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered
    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    const denyButton = screen.getByTestId(
      `RecommendationRequestTable-cell-row-0-col-Deny-button`,
    );
    expect(denyButton).toBeInTheDocument();
    expect(denyButton).toHaveClass("btn-success");

    // act - click the deny button
    fireEvent.click(denyButton);

    // assert - check that the deny endpoint was called
    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
    expect(axiosMock.history.put[0].data).toEqual(
      JSON.stringify({ status: "DENIED" }),
    );
  });

  // test deny button changes status to denied
  test("Accept button calls accept callback (professor) and updates status to accepted", async () => {
    // arrange
    const currentUser = currentUserFixtures.professorUser;
    expect(hasRole(currentUser, "ROLE_PROFESSOR")).toBe(true);

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onPut("/api/recommendationrequest")
      .reply(200, { message: "Recommendation Request updated" });

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.pendingRecommendation}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered
    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    const acceptButton = screen.getByTestId(
      `RecommendationRequestTable-cell-row-0-col-Accept-button`,
    );
    expect(acceptButton).toBeInTheDocument();
    expect(acceptButton).toHaveClass("btn-success");

    // act - click the accept button
    fireEvent.click(acceptButton);

    // assert - check that the accept endpoint was called

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
    expect(axiosMock.history.put[0].data).toEqual(
      JSON.stringify({ status: "ACCEPTED" }),
    );
  });

  // test complete button changes status to completed
  test("Complete button calls complete callback (professor) and updates status to completed", async () => {
    // arrange
    const currentUser = currentUserFixtures.professorUser;
    expect(hasRole(currentUser, "ROLE_PROFESSOR")).toBe(true);

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onPut("/api/recommendationrequest")
      .reply(200, { message: "Recommendation Request updated" });

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.acceptedRecommendation}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered
    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    const completeButton = screen.getByTestId(
      `RecommendationRequestTable-cell-row-0-col-Complete-button`,
    );
    expect(completeButton).toBeInTheDocument();
    expect(completeButton).toHaveClass("btn-success");

    // act - click the complete button
    fireEvent.click(completeButton);

    // assert - check that the complete endpoint was called

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
    expect(axiosMock.history.put[0].data).toEqual(
      JSON.stringify({ status: "COMPLETED" }),
    );
  });

  // testing that accept, deny, complete buttons are only shown for users that are professors
  test("Accept, Deny, Complete buttons are only shown for users with ROLE_PROFESSOR", async () => {
    // arrange - negative test with non-professor
    const currentUser = currentUserFixtures.userOnly;
    expect(hasRole(currentUser, "ROLE_PROFESSOR")).toBe(false);
    expect(hasRole(currentUser, "ROLE_USER")).toBe(true);
    expect(hasRole(currentUser, "ROLE_ADMIN")).toBe(false);

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.pendingRecommendation}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    const acceptButton = screen.queryByTestId(
      `RecommendationRequestTable-cell-row-0-col-Accept-button`,
    );
    const denyButton = screen.queryByTestId(
      `RecommendationRequestTable-cell-row-0-col-Deny-button`,
    );
    const completeButton = screen.queryByTestId(
      `RecommendationRequestTable-cell-row-0-col-Complete-button`,
    );
    expect(acceptButton).not.toBeInTheDocument();
    expect(denyButton).not.toBeInTheDocument();
    expect(completeButton).not.toBeInTheDocument();
  });
});
