import { Routes } from '@angular/router';
import { DoctorList } from './features/doctors/doctor-list/doctor-list';
import { DoctorForm } from './features/doctors/doctor-form/doctor-form';
import { DoctorDetail } from './features/doctors/doctor-detail/doctor-detail';
import { Dashboard } from './features/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: Dashboard
  },
  {
    path: 'doctors',
    component: DoctorList
  },
  {
    path: 'doctors/add',
    component: DoctorForm
  },
  {
    path: 'doctors/edit/:id',
    component: DoctorForm
  },
  {
    path: 'doctors/:id',
    component: DoctorDetail
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

