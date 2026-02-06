[
  {
    id: "55bb9b046cecc70d31620f158632d533",
    value: {
      actionRequests: [
        {
          name: "refund",
          args: { emails: ["john.doe@example.com", "mike.chen@example.com"] },
          description:
            'Tool execution pending approval\n\nTool: refund\nArgs: {\n  "emails": [\n    "john.doe@example.com",\n    "mike.chen@example.com"\n  ]\n}',
        },
      ],
      reviewConfigs: [
        {
          actionName: "refund",
          allowedDecisions: ["approve", "edit", "reject"],
        },
      ],
    },
  },
];
