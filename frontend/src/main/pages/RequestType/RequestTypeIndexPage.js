import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function RequestTypeIndexPage() {
  // Stryker disable all : placeholder for future implementation
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Index page not yet implemented</h1>
        <p>
          <a href="/settings/requesttypes/create">Create</a>
        </p>
        <p>
          <a href="/settings/requesttypes/create/:id">Edit</a>
        </p>
      </div>
    </BasicLayout>
  );
}
