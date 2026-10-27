import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DoctorDetail } from './doctor-detail';

describe('DoctorDetail', () => {
  let component: DoctorDetail;
  let fixture: ComponentFixture<DoctorDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorDetail],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
