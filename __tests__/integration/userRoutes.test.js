import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import healthRoute from '../../src/routes/healthRoute.js';
import sequelize from '../../src/config/database.js';

dotenv.config();

const app = express();
app.use('/healthz', healthRoute);

describe('GET /healthz', () => {
  beforeAll(async () => {
    // Ensure database connection before running tests
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  });

  afterAll(async () => {
    // Close database connection after tests
    await sequelize.close();
  });

  it('should return 200 when database is healthy', async () => {
    const response = await request(app).get('/healthz');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
  });

  it('should return 400 when query parameters are present', async () => {
    const response = await request(app).get('/healthz?param=value');
    expect(response.status).toBe(400);
    expect(response.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
  });

  it('should return 400 when body is present', async () => {
    const response = await request(app)
      .get('/healthz')
      .send({ someData: 'value' });
    expect(response.status).toBe(400);
    expect(response.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
  });

  it('should return 405 for non-GET methods', async () => {
    const methods = ['post', 'put', 'delete', 'patch'];
    for (const method of methods) {
      const response = await request(app)[method]('/healthz');
      expect(response.status).toBe(405);
      expect(response.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
    }
  });
});