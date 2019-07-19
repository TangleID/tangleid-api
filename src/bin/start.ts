import { createApp } from '../app';
const port = process.env.NODE_PORT || 3001;

createApp().then(app => {
  app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`🚀 Server ready at port http://localhost:${port}`);
  });
}).catch(error => {
  // tslint:disable-next-line:no-console
  console.log(error);
});
