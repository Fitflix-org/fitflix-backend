// src/config/db.js
// This file provides a singleton instance of PrismaClient.
// Using a singleton prevents multiple database connections, which can
// lead to issues like "too many connections" errors, especially during
// development with hot-reloading.

const { PrismaClient } = require('@prisma/client');

let prisma;

// In production, create a new instance directly.
// In development, use a global variable to reuse the instance across hot reloads.
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Check if global.prisma already exists to reuse the instance
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = prisma;
