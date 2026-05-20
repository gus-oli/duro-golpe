process.env.DATABASE_URL = 'postgresql://duro_golpe:duro_golpe_dev@127.0.0.1:5432/duro_golpe'
process.env.REDIS_URL = 'redis://127.0.0.1:6379'
process.env.JWT_SECRET = 'x'.repeat(32)
process.env.WEBHOOK_SECRET = 'y'.repeat(16)
process.env.BASE_URL = 'http://127.0.0.1:3001'
process.env.FRONTEND_URL = 'http://127.0.0.1:3000'
process.env.NODE_ENV = 'test'
