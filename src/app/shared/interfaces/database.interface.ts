/**
 * Base type for database resources
 * Database resource interfaces all inherit from this interface
 * ID formats:
 * Product: 'PRODUCTNAME'
 * ReleasePlan: 'PRODUCTNAME:RELEASEPLANNAME'
 * Node: 'PRODUCTNAME:RELEASEPLANNAME.NODENAME'
 */

export interface DatabaseInterface {
  id: string;          // ID of this resource, format depends on the type of record
  parentId: string | null; // Id of the parent resource, i.e the product record for this releaseplan
  name: string;        // name of this resource, must be unique for the parent, not changeable
  description: string; // Free-form text describing this resource
  selfLink: string;    // Link to do a 'GET', 'PUT' or 'DELETE' on this resource
}
