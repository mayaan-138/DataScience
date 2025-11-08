// Sample data for initializing the database
// Run this manually through the admin panel or Firebase Console

export const sampleLectures = [
  {
    topic_name: 'Statistics',
    description: 'Learn the fundamentals of statistics including probability, distributions, and hypothesis testing.',
    total_videos: 6,
    video_links: [
      {
        title: 'Introduction to Statistics',
        url: 'https://www.youtube.com/watch?v=uhxtUt_-GyM',
      },
      {
        title: 'Probability Basics',
        url: 'https://www.youtube.com/watch?v=w2v-LD4d6oE',
      },
      {
        title: 'Normal Distribution',
        url: 'https://www.youtube.com/watch?v=mtbJbDwqWLE',
      },
      {
        title: 'Hypothesis Testing',
        url: 'https://www.youtube.com/watch?v=HmADoMqOZ-M',
      },
      {
        title: 'Confidence Intervals',
        url: 'https://www.youtube.com/watch?v=uhxtUt_-GyM',
      },
      {
        title: 'Statistical Tests',
        url: 'https://www.youtube.com/watch?v=w2v-LD4d6oE',
      },
    ],
  },
  {
    topic_name: 'Machine Learning',
    description: 'Master machine learning algorithms including regression, classification, and clustering.',
    total_videos: 8,
    video_links: [
      {
        title: 'Introduction to Machine Learning',
        url: 'https://www.youtube.com/watch?v=aircAruvnKk',
      },
      {
        title: 'Linear Regression',
        url: 'https://www.youtube.com/watch?v=zPG4NjIkCjc',
      },
      {
        title: 'Logistic Regression',
        url: 'https://www.youtube.com/watch?v=yIYKR4sgzI8',
      },
      {
        title: 'Decision Trees',
        url: 'https://www.youtube.com/watch?v=7VeUPuFGJHk',
      },
      {
        title: 'Random Forest',
        url: 'https://www.youtube.com/watch?v=J4Wdy0Wc_xQ',
      },
      {
        title: 'Support Vector Machines',
        url: 'https://www.youtube.com/watch?v=efR1C6CvhmE',
      },
      {
        title: 'K-Means Clustering',
        url: 'https://www.youtube.com/watch?v=4b5d3muPQmA',
      },
      {
        title: 'Model Evaluation',
        url: 'https://www.youtube.com/watch?v=aircAruvnKk',
      },
    ],
  },
  {
    topic_name: 'Deep Learning',
    description: 'Explore neural networks, deep learning architectures, and advanced AI techniques.',
    total_videos: 10,
    video_links: [
      {
        title: 'Neural Networks Basics',
        url: 'https://www.youtube.com/watch?v=aircAruvnKk',
      },
      {
        title: 'Backpropagation',
        url: 'https://www.youtube.com/watch?v=Ilg3gGewQ5U',
      },
      {
        title: 'Convolutional Neural Networks',
        url: 'https://www.youtube.com/watch?v=YRhxdVk_sIs',
      },
      {
        title: 'Recurrent Neural Networks',
        url: 'https://www.youtube.com/watch?v=WCUNPb-5EYI',
      },
      {
        title: 'LSTM Networks',
        url: 'https://www.youtube.com/watch?v=WCUNPb-5EYI',
      },
    ],
  },
  {
    topic_name: 'Generative AI',
    description: 'Learn about Generative AI, LLMs, and modern AI applications.',
    total_videos: 5,
    video_links: [
      {
        title: 'Introduction to Generative AI',
        url: 'https://www.youtube.com/watch?v=G2fqAlgmoPo',
      },
      {
        title: 'Large Language Models',
        url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
      },
      {
        title: 'Transformer Architecture',
        url: 'https://www.youtube.com/watch?v=U0s0f995w14',
      },
      {
        title: 'Fine-tuning LLMs',
        url: 'https://www.youtube.com/watch?v=G2fqAlgmoPo',
      },
      {
        title: 'AI Applications',
        url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
      },
    ],
  },
];

export const sampleProjects = [
  {
    title: 'House Price Prediction',
    description: 'Build a regression model to predict house prices using features like area, bedrooms, location, etc.',
    difficulty: 'Beginner',
    dataset_link: 'https://www.kaggle.com/datasets/yasserh/housing-prices-dataset',
    status: 'pending',
  },
  {
    title: 'Customer Segmentation',
    description: 'Use clustering algorithms to segment customers based on purchasing behavior and demographics.',
    difficulty: 'Intermediate',
    dataset_link: 'https://www.kaggle.com/datasets/carrie1/ecommerce-data',
    status: 'pending',
  },
  {
    title: 'Image Classification',
    description: 'Build a CNN model to classify images into different categories using deep learning.',
    difficulty: 'Advanced',
    dataset_link: 'https://www.kaggle.com/datasets/puneet6060/intel-image-classification',
    status: 'pending',
  },
];
