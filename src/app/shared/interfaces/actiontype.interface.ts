export interface ActionTypeInterface {
  id: string;
  description: string;
  actionData: string;
  inputs: InputInterface[];
  expectedDurationMinutes: number; // Default value for an action
}

export interface InputInterface {
  name: string;         // For example, the name of the service
  description: string;  // Fro example, Whitelisting this service
  valueRef: string;     // User filled in when user adds/edits an action node - How to get this input, a default value
  validation: string;   // What should this input look like
}
