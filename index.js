const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'jade');
app.set('views', './views');

app.use(express.static(path.join(__dirname, '/')));

app.get('/', (req, res) => {
	res.render('dashboard_main');
});

app.get('/dashboard', (req, res) => {
	res.render('dashboard_main');
});

app.listen(5000);
