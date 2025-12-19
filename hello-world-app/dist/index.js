"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Hello world endpoint
app.get('/', (_req, res) => {
    res.status(200).send('hello world');
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Hello world endpoint: http://localhost:${PORT}/`);
    console.log(`Health check endpoint: http://localhost:${PORT}/health`);
});
//# sourceMappingURL=index.js.map