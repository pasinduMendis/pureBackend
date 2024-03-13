module.exports = {
    dev: {
      allowedOrigins: ['*'],
      errorMessage: 'Not allowed by CORS in development',
    },
    prod: {
      allowedOrigins: ['https://rent.purepm.co'], // Replace with your specific production domain
      errorMessage: 'Not allowed by CORS in production',
    },
  };