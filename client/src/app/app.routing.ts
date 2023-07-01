import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { AuthGuard } from './_helpers';
import { MyhomeComponent } from './myhome/myhome.component';
import { LogoutComponent } from './logout/logout/logout.component';
import { AudioInComponent } from './_components/audio-in/audio-in.component';
import { FileInComponent } from './_components/file-in/file-in.component';

const routes: Routes = [
    { path: '', component: MyhomeComponent, canActivate: [AuthGuard] },
    // { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'logout', component: LogoutComponent },
    // { path: 'audio-test', component: AudioInComponent },
    { path: 'file-test', component: FileInComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes);
