import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { MemoryRouter, useNavigate } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import StudentProfilePage from "main/pages/StudentProfilePage";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import mockConsole from "jest-mock-console";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("StudentProfilePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/recommendationrequest/requester/all")
      .reply(200, recommendationRequestFixtures.threeRecommendations);
    axiosMock
      .onGet("/api/recommendationrequest/professor/all")
      .reply(200, recommendationRequestFixtures.threeRecommendations);

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });
  test("renders correctly for student user", async () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.studentUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/recommendationrequest/requester/all")
      .reply(200, recommendationRequestFixtures.threeRecommendations);
    axiosMock.onGet("/api/requesttypes/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const mockNavigate = jest.fn();
    useNavigate.mockImplementation(() => mockNavigate);

    await waitFor(() => {
      const table = screen.getByTestId("RecommendationRequestTable");
      expect(table).toBeInTheDocument();
    });

    expect(screen.getAllByText("Edit").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Delete").length).toBeGreaterThan(0);

    const editButtons = screen.getAllByText("Edit");
    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(editButtons[0]);
    fireEvent.click(deleteButtons[0]);

    await screen.findByTestId("create-request-button");

    const createButton = screen.getByTestId("create-request-button");
    fireEvent.click(createButton);

    expect(screen.getByTestId("role-badge-student")).toBeInTheDocument();
  });

  test("renders correctly for non-student user", async () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Students only.")).toBeInTheDocument();
    });
  });

  test("renders empty table when backend unavailable", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/recommendationrequest/requester/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/recommendationrequest/requester/all",
    );
    restoreConsole();
  });
});
