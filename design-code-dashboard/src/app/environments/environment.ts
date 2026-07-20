export const environment = {
  production: false,
  // Use HTTP in Development to avoid Swagger/browser "Failed to fetch" from untrusted HTTPS certs.
  // After `dotnet dev-certs https --trust`, you may switch to: 'https://localhost:5001/api'
  apiUrl: 'http://localhost:5000/api',
};
