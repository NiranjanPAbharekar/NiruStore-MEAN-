import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HomeContent from './model/HomeContent.js';

dotenv.config();

async function seedHomeContent() {
  try {
    await mongoose.connect(process.env.MongoDB_URL);

    await HomeContent.deleteMany({});

    await HomeContent.create({
      heroSlides: [
        {
          image: 'assets/Carousel/WatchHead.jpg',
          alt: 'Luxury Watches',
          eyebrow: 'Timeless Collection',
          title: 'Elevate Your',
          highlight: 'Time',
          description: 'Discover premium watches.'
        },
        {
          image: 'assets/Carousel/PerfumeHead.jpg',
          alt: 'Luxury Perfume',
          eyebrow: 'Signature Fragrance',
          title: 'A Scent That',
          highlight: 'Defines You',
          description: 'Explore sophisticated fragrances.'
        },
        {
          image: 'assets/Carousel/ShoesHead.jpg',
          alt: 'Luxury Shoes',
          eyebrow: 'Luxury Footwear',
          title: 'Walk With',
          highlight: 'Confidence',
          description: 'Discover premium footwear.'
        },
        {
          image: 'assets/Carousel/FashionHead.jpg',
          alt: 'Luxury Fashion',
          eyebrow: 'Haute Couture',
          title: 'Elevate Your',
          highlight: 'Style',
          description: 'Discover luxury fashion.'
        },
        {
          image: 'assets/Carousel/AccessoriesHead.jpg',
          alt: 'Luxury Accessories',
          eyebrow: 'Perfect Details',
          title: 'Complete Your',
          highlight: 'Look',
          description: 'Discover accessories for your style.'
        }
      ],

      collections: [
        {
          name: 'Watches',
          image: 'assets/home/WatchHome.jpg',
          categoryKey: 'watches'
        },
        {
          name: 'Perfumes',
          image: 'assets/home/PerfumeHome.jpg',
          categoryKey: 'perfumes'
        },
        {
          name: 'Shoes',
          image: 'assets/home/ShoesHome.jpg',
          categoryKey: 'shoes'
        },
        {
          name: 'Men Fashion',
          image: 'assets/home/MenFashionHome.jpg',
          categoryKey: 'men-fashion'
        },
        {
          name: 'Women Fashion',
          image: 'assets/home/WomenFashionHome.jpg',
          categoryKey: 'women-fashion'
        },
        {
          name: 'Accessories',
          image: 'assets/home/AccessoriesHome.jpg',
          categoryKey: 'accessories'
        }
      ]
    });

    console.log('Home content saved to MongoDB!');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedHomeContent();