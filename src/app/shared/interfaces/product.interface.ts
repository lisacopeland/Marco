export interface ProductInterface {
  productId: string;   // product name which must be unique
  name: string;        // Product name - must be unique and cannot be changed
  description: string; // Description of this product
  selfLink: string;    // url to PUT (this object), DELETE (this object)
  planLink: string;    // url for plans under this product, GET (all plans) POST(new plan), DELETE(all plans)
}
