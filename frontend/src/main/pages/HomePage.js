import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function HomePage() {
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Recommendation Request Manager</h1>
        <p>
          Our webapp allows a simple process for students to submit requests for
          letters of recommendation to professors, and allows professors to
          manage their requests.
        </p>
      </div>
    </BasicLayout>
  );
}
