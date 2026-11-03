import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from '../../Components/navbar/navbar';
import { Footer } from '../../Components/footer/footer';


@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet,
    Navbar,
    Footer],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.css',
})
export class UserLayout {}
