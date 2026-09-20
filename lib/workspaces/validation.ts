export type WorkspaceNameValidationResult =
  | {
      success: true;
      data: {
        name: string;
      };
    }
  | {
      success: false;
      errors: {
        name?: string;
      };
    };

export function validateWorkspaceName(
  input: unknown
): WorkspaceNameValidationResult {
  if (
    !input ||
    typeof input !== "object" ||
    !("name" in input) ||
    typeof input.name !== "string"
  ) {
    return {
      success: false,
      errors: {
        name: "Workspace name is required.",
      },
    };
  }

  const name = input.name.trim();

  if (name.length < 2) {
    return {
      success: false,
      errors: {
        name: "Workspace name must be at least 2 characters.",
      },
    };
  }

  if (name.length > 60) {
    return {
      success: false,
      errors: {
        name: "Workspace name must be 60 characters or fewer.",
      },
    };
  }

  return {
    success: true,
    data: {
      name,
    },
  };
}
