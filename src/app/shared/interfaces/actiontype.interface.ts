export interface ActionTypeInterface {
  id: string;
  description: string;             // once this is selected, it defaults the description field for the node
  actionData: string;              // gets copied over, then
  inputs: InputInterface[];        // 0 or more of these
  expectedDurationMinutes: number; // Default value for an action
}

export interface InputInterface {
  name: string;         // For example, the name of the service
  description: string;  // Fro example, Whitelisting this service
  valueReference: string;     // User filled in when user adds/edits an action node - How to get this input, a default value
  validation: string;   // What should this input look like
}
