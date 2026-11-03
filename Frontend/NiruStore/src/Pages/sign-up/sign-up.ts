import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule,ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../Service/auth-service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp implements OnInit, OnDestroy {
  passwordMatchValidator(form: FormGroup) {
  const password = form.get('password')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;

  return password === confirmPassword
    ? null
    : { passwordMismatch: true };
}

SignUp:FormGroup;
constructor(private fb:FormBuilder,private authService:AuthService) {
  this.SignUp=this.fb.group({
    fullName:["",[Validators.required,Validators.minLength(5)]],
    email:["",[Validators.required,Validators.email]],
    password:["",[Validators.required,Validators.minLength(6),Validators.pattern(/^(?=.*[@#$%&!?*]).{6,}$/)]],
    confirmPassword:["",[Validators.required,]],
    acceptTerms:[false,[Validators.requiredTrue]]

  },{
    validators: this.passwordMatchValidator
  }
)
}
submitForm() {
  if (this.SignUp.invalid) {
    this.SignUp.markAllAsTouched();
    alert('Please fill all the required fields correctly.');
    return;
  }

  this.onSubmit();
}
onSubmit(){
 this.authService.register(this.SignUp.value).subscribe({
next:(data)=>{
  console.log(data)
},
error:(err)=>{
  console.log(err)
}
 });
  console.log("form value:", this.SignUp.value);


}
  images: string[] = [
    'assets/login/Perfume1.jpg',
    'assets/login/Perfume2.jpg',
    'assets/login/Perfume3.jpg',
    'assets/login/watch1.jpg',
    'assets/login/watch2.jpg',
    'assets/login/watch3.jpg',
  ];

  currentSlide = 0;

  intervalId: any;

  showPassword = false;
  showConfirmPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }


  user = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  };

  acceptTerms = false;





  ngOnInit(): void {
    this.startSlider();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

 
  startSlider() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 3500);
  }

  nextSlide() {
    this.currentSlide =
      (this.currentSlide + 1) % this.images.length;
  }

  previousSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.images.length) %
      this.images.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

 

}