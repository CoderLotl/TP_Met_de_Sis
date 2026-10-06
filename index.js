import express from 'express';
import router from './api/router/router.js';

const app = express();
const port = 3000;

// parseo de body JSON (llena req.body para los POST).
app.use(express.json());
// serve de archivos estáticos del front.
app.use(express.static('front/dist'));
// router
app.use(router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});