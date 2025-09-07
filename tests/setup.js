// Jest setup file for tests
// Mock global objects and functions needed for tests

// Polyfill TextEncoder/TextDecoder for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Supabase globally
global.supabase = {
    createClient: () => ({
        from: (table) => ({
            insert: (data) => ({ 
                select: () => ({ 
                    single: () => ({ 
                        data: { 
                            id: 'test-id-' + Date.now(),
                            ...data[0],
                            created_at: new Date().toISOString()
                        }, 
                        error: null 
                    }) 
                }) 
            }),
            select: (fields) => ({ 
                eq: (field, value) => ({ 
                    order: (field, options) => ({ 
                        data: [], 
                        error: null 
                    }) 
                }) 
            }),
            upsert: (data) => ({ select: () => ({ data: data, error: null }) })
        }),
        rpc: (func, params) => ({ data: true, error: null }),
        channel: (name) => ({
            on: (event, callback) => ({ subscribe: () => ({}) })
        })
    })
};

// Mock browser APIs
global.fetch = jest.fn();
global.btoa = (str) => Buffer.from(str).toString('base64');
global.atob = (str) => Buffer.from(str, 'base64').toString();

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock console methods to reduce noise during tests
console.log = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();