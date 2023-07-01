import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/_services';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent {

  constructor(private authService: AuthenticationService, private router: Router) { }

  ngOnInit() {
    // Call the logout method on the authentication service
    this.authService.logout();

    // Navigate to the login page
    this.router.navigate(['/login']);
  }

}
