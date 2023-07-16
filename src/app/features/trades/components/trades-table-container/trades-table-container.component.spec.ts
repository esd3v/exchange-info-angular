import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradesTableContainerComponent } from './trades-table-container.component';

describe('TradesTableContainerComponent', () => {
  let component: TradesTableContainerComponent;
  let fixture: ComponentFixture<TradesTableContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TradesTableContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradesTableContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
