import { of, BehaviorSubject } from 'rxjs';

export class ProductServiceStub {
  productSource = new BehaviorSubject<{}>({});
  productLookup = this.productSource.asObservable();
  getProductsHttp() {
    return of({
      data: [
        {
          id: 'region_build.ec2',
          description: '',
          parentId: 'region_build',
          name: 'ec2',
          selfLink: '/api/v1/data/namespace/region_build.ec2',
          parentLink: '/api/v1/data/namespace/region_build',
          namespacesLink: '/api/v1/data/namespace/region_build.ec2/namespaces',
          automationTriggersLink: '/api/v1/data/namespace/region_build.ec2/automationTriggers',
          automationTemplatesLink: '/api/v1/data/namespace/region_build.ec2/automationTemplates',
          actionSequenceTemplatesLink: '/api/v1/data/namespace/region_build.ec2/actionSequenceTemplates'
        },
        {
          id: 'region_build.s3',
          description: '',
          parentId: 'region_build',
          name: 's3',
          selfLink: '/api/v1/data/namespace/region_build.s3',
          parentLink: '/api/v1/data/namespace/region_build',
          namespacesLink: '/api/v1/data/namespace/region_build.s3/namespaces',
          automationTriggersLink: '/api/v1/data/namespace/region_build.s3/automationTriggers',
          automationTemplatesLink: '/api/v1/data/namespace/region_build.s3/automationTemplates',
          actionSequenceTemplatesLink: '/api/v1/data/namespace/region_build.s3/actionSequenceTemplates'
        }
      ]
    });
  }
}
