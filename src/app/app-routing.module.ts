import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageMasterComponent } from './components/package-master/package-master.component';
import { PackageListingComponent } from './components/package-listing/package-listing.component';
import { AppointmentComponent } from './components/appointment/appointment.component';

const routes: Routes = [
  { path: '', redirectTo: '/packages', pathMatch: 'full' },
  { path: 'packages', component: PackageListingComponent },
  { path: 'package/new', component: PackageMasterComponent },
  { path: 'package/edit/:id', component: PackageMasterComponent },
  { path: 'appointment', component: AppointmentComponent },
  { path: '**', redirectTo: '/packages' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }