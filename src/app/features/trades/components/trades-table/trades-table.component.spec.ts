import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradesTableComponent } from './trades-table.component';
import { WebsocketModule } from 'src/app/websocket/websocket.module';
import { TradesTableModule } from './trades-table.module';
import { AppStoreModule } from 'src/app/store/store.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TradesTableContainerComponent', () => {
  let component: TradesTableComponent;
  let fixture: ComponentFixture<TradesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TradesTableModule,
        WebsocketModule.forRoot(),
        AppStoreModule,
        HttpClientTestingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TradesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
