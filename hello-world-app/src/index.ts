import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Hello world endpoint
app.get('/', (_req: Request, res: Response): void => {
  res.status(200).send('hello world');
});

// Start the server
app.listen(PORT, (): void => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Hello world endpoint: http://localhost:${PORT}/`);
  console.log(`Health check endpoint: http://localhost:${PORT}/health`);
});