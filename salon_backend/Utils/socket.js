const socketio = require('socket.io');

let io;

const init = (server) => {
    io = socketio(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket Connected: ${socket.id}`);

        socket.on('join_salon', (salonId) => {
            socket.join(salonId);
            console.log(`Socket ${socket.id} joined salon: ${salonId}`);
        });

        // Real-time Like/Unlike Handlers
        socket.on('product_like_toggle', async ({ productId, customerId, salonId }) => {
            if (!productId || !customerId) return;
            const { handleProductLikeToggle } = require('../Controllers/productController');
            await handleProductLikeToggle(productId, customerId, salonId);
        });

        socket.on('outlet_like_toggle', async ({ outletId, customerId }) => {
            if (!outletId || !customerId) return;
            const { handleOutletLikeToggle } = require('../Controllers/outletController');
            await handleOutletLikeToggle(outletId, customerId);
        });

        socket.on('disconnect', () => {
            console.log(`Socket Disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { init, getIO };
