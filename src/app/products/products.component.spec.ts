import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductsComponent } from './products.component';
import { MaterialModule } from '../material/material.module';
import { ProductServiceStub } from '@shared/services/product.service.mock';
import { ProductService } from '@shared/services/product.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        BrowserAnimationsModule,
        MaterialModule
      ],
      declarations: [
        ProductsComponent
      ],
      providers: [{ provide: ProductService, useClass: ProductServiceStub }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the products component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getProducts on component Init', () => {
    spyOn(component.productService, 'getProductsHttp').and.callThrough();
    component.ngOnInit();
    expect(component.dataSource.data.length).toEqual(2);
    expect(component.hasData).toBeTrue();
    expect(component.waiting).toBeFalse();
  });

});
