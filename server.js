const app = require('./Config/app');

const port = process.env.PORT || 3000;
const server = app.listen(port , ()=>{
    console.log(`App running on port http://localhost:${port}`);
})