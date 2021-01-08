const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('static'));

const drawnPaths = [];

io.on('connection', socket => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    drawnPaths.forEach(drawnPath => {
        socket.emit('drawpath', drawnPath);
    });

    socket.on('drawpath', e => {
        drawnPaths.push(e);
        socket.broadcast.emit('drawpath', e);
    });

    socket.on('clear', e => {
        drawnPaths.length = 0;
        socket.broadcast.emit('clear', e);
    });

    socket.on('undo', e => {
        const lastPath = drawnPaths.pop();
        socket.emit('undo', lastPath.pathData);
    });
});

const port = process.env.SHARED_CANVAS_PORT || process.env.PORT || 8080
const httpServer = http.listen(port, () => {
    console.log(`Listening on ${port}`);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT');
    io.close();
    httpServer.close();
});