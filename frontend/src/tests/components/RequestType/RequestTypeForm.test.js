import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { BrowserRouter as Router } from "react-router-dom";

import RequestTypeForm from "main/components/RequestType/RequestTypeForm";
import { requestTypeFixtures } from "fixtures/requestTypeFixtures";

import { QueryClient, QueryClientProvider } from "react-query";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("RequestTypeForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["Request Type"];
  const testId = "RequestTypeForm";

  test("that submitAction is called when Submit is clicked", async () => {
    const mockSubmit = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RequestTypeForm submitAction={mockSubmit} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId(`${testId}-submit`)).toBeInTheDocument();
    const submitButton = screen.getByTestId(`${testId}-submit`);
    const requestTypeInput = await screen.findByTestId(`${testId}-requestType`);

    fireEvent.change(requestTypeInput, {
      target: { value: "RequestType" },
    });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(mockSubmit).toHaveBeenCalledWith(
        {
          requestType: "RequestType",
        },
        expect.anything(),
      ),
    );
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RequestTypeForm initialContents={requestTypeFixtures.oneType} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();

    expect(screen.getByLabelText("Id")).toHaveValue(
      String(requestTypeFixtures.oneType.id),
    );
    expect(screen.getByLabelText("Request Type")).toHaveValue(
      requestTypeFixtures.oneType.requestType,
    );
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RequestTypeForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RequestTypeForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Request Type is required/);

    const requestInput = screen.getByTestId(`${testId}-requestType`);
    fireEvent.change(requestInput, { target: { value: "a".repeat(256) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument();
    });
  });
});
