import React from "react";
import RequestTypeTable from "main/components/RequestType/RequestTypeTable";
import { recommendationTypeFixtures } from "fixtures/recommendationTypeFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/RequestType/RequestTypeTable",
  component: RequestTypeTable,
};

const Template = (args) => {
  return <RequestTypeTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  requesttype: [],
};

export const FourTypes = Template.bind({});
FourTypes.args = {
  requesttype: recommendationTypeFixtures.fourTypes,
  currentUser: currentUserFixtures.adminUser,
};

FourTypes.parameters = {
  msw: [
    http.delete("/api/requesttypes", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
