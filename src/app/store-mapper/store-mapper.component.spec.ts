import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreMapperComponent } from './store-mapper.component';

describe('StoreMapperComponent', () => {
  let component: StoreMapperComponent;
  let fixture: ComponentFixture<StoreMapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreMapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreMapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
