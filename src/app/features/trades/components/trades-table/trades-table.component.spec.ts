import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradesTableComponent } from './trades-table.component';

describe('TradesTableContainerComponent', () => {
  let component: TradesTableComponent;
  let fixture: ComponentFixture<TradesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TradesTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
