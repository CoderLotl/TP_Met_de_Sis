import express from 'express';
import cookieParser from 'cookie-parser';
import router from './api/router/router.js';

const app = express();
const port = process.env.PORT || 3000;

// parseo de body JSON (llena req.body para los POST).
app.use(express.json());
// parseo de cookies (llena req.cookies).
app.use(cookieParser());
// serve de archivos estáticos del front.
app.use(express.static('front/dist'));
// router
app.use(router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});