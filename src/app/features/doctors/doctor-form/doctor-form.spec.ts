import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DoctorForm } from './doctor-form';

describe('DoctorForm', () => {
  let component: DoctorForm;
  let fixture: ComponentFixture<DoctorForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
