import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from "../../Components/navbar/navbar";
import { Footer } from "../../Components/footer/footer";



interface Contact {

  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;

}

interface FAQ {

  question: string;
  answer: string;
  open: boolean;

}

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, FormsModule, RouterLink, Navbar, Footer],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css',
})
export class ContactUs {
  // ==========================
  // Contact Form Model
  // ==========================

  contact: Contact = {

    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''

  };



  // ==========================
  // FAQ Data
  // ==========================

  faqs: FAQ[] = [

    {
      question: 'How long does delivery take?',
      answer: 'Orders are usually delivered within 3–7 business days depending on your location.',
      open: true
    },

    {
      question: 'Can I return my order?',
      answer: 'Yes. Products can be returned within 7 days if they are unused and in their original packaging.',
      open: false
    },

    {
      question: 'Do you provide Cash on Delivery?',
      answer: 'Yes, Cash on Delivery is available in most serviceable locations across India.',
      open: false
    },

    {
      question: 'Are your products original?',
      answer: 'Absolutely. Every product sold on NiruStore is 100% genuine and quality checked.',
      open: false
    },

    {
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking ID via email and SMS.',
      open: false
    }

  ];



  // ==========================
  // FAQ Toggle
  // ==========================

  toggleFAQ(index: number): void {

    this.faqs[index].open = !this.faqs[index].open;

  }



  // ==========================
  // Submit Form
  // ==========================

  submitForm(): void {

    if (
      !this.contact.name ||
      !this.contact.email ||
      !this.contact.message
    ) {

      alert('Please fill all required fields.');

      return;

    }

    console.log('Contact Form Submitted');

    console.log(this.contact);

    alert('Thank you! Your message has been sent successfully.');

    this.resetForm();

  }



  // ==========================
  // Reset Form
  // ==========================

  resetForm(): void {

    this.contact = {

      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''

    };

  }
}
