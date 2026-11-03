import mongoose from 'mongoose';

const HomeContentSchema = new mongoose.Schema({
  heroSlides: [
    {
      image: String,
      alt: String,
      eyebrow: String,
      title: String,
      highlight: String,
      description: String
    }
  ],

  collections: [
    {
      name: String,
      image: String,
      categoryKey: String
    }
  ]
});

export default mongoose.model('HomeContent', HomeContentSchema);    