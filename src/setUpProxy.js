const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Proxy requests to /api
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001/',
      changeOrigin: true,
      secure: false,
      ws: true, // For WebSocket support
    })
  );

  // Proxy requests to /accounts
  app.use(
    '/accounts',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  );
  
   // Proxy requests to /accounts
   app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  );

   // Proxy requests to /accounts
   app.use(
    '/forgot-password',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  );

   // Proxy requests to /accounts
   app.use(
    '/verify-otp',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  );

   // Proxy requests to /accounts
   app.use(
    '/verify-otp',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  );

   // Proxy requests to /accounts
   app.use(
    '/register',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  );

 // Proxy requests to /accounts
 app.use(
    '/login',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  );

   // Proxy requests to /accounts
 app.use(
    '/user/:id',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

   // Proxy requests to /accounts
 app.use(
    '/user/:id/update-password',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

   // Proxy requests to /accounts
 app.use(
    '/role',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

   // Proxy requests to /accounts
 app.use(
    '/reset-password',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

   // Proxy requests to /accounts
 app.use(
    '/add-account',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

   // Proxy requests to /accounts
 app.use(
    '/delete-account',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

   // Proxy requests to /accounts
 app.use(
    '/search',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

    // Proxy requests to /accounts
 app.use(
    '/add-patient',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

app.use(
    '/patients',
    createProxyMiddleware({
        target: 'http://localhost:3001/', // Adjust the target as needed
        changeOrigin: true,
        secure: false,
    })
)

app.use(
    '/patients/:id',
    createProxyMiddleware({
        target: 'http://localhost:3001/', // Adjust the target as needed
        changeOrigin: true,
        secure: false,
    })
)
      // Proxy requests to /accounts
      app.use(
        '/xrayResultUpload',
        createProxyMiddleware({
          target: 'http://localhost:3001/', // Adjust the target as needed
          changeOrigin: true,
          secure: false,
        })
      )

   // Proxy requests to /accounts
   app.use(
    '/xrayResultUpload',
    createProxyMiddleware({
      target: 'http://localhost:3001/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  ) 

};