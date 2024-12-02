const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Proxy requests to /api
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/',
      changeOrigin: true,
      secure: false,
      ws: true, // For WebSocket support
    })
  );

  // Proxy requests to /accounts
  app.use(
    '/accounts',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  );
  
   // Proxy requests to /accounts
   app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  );

   // Proxy requests to /accounts
   app.use(
    '/forgot-password',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  );

   // Proxy requests to /accounts
   app.use(
    '/verify-otp',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  );

   // Proxy requests to /accounts
   app.use(
    '/verify-otp',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  );

   // Proxy requests to /accounts
   app.use(
    '/register',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  );

 // Proxy requests to /accounts
 app.use(
    '/login',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  );

   // Proxy requests to /accounts
 app.use(
    '/user/:id',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

   // Proxy requests to /accounts
 app.use(
    '/user/:id/update-password',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

   // Proxy requests to /accounts
 app.use(
    '/role',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

   // Proxy requests to /accounts
 app.use(
    '/reset-password',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

   // Proxy requests to /accounts
 app.use(
    '/add-account',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

   // Proxy requests to /accounts
 app.use(
    '/delete-account',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

   // Proxy requests to /accounts
 app.use(
    '/search',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

    // Proxy requests to /accounts
 app.use(
    '/add-patient',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  )

app.use(
    '/patients',
    createProxyMiddleware({
        target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
        changeOrigin: true,
        secure: false,
    })
)

app.use(
    '/patients/:id',
    createProxyMiddleware({
        target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
        changeOrigin: true,
        secure: false,
    })
)
      // Proxy requests to /accounts
      app.use(
        '/xrayResultUpload',
        createProxyMiddleware({
          target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
          changeOrigin: true,
          secure: false,
        })
      )

   // Proxy requests to /accounts
   app.use(
    '/xrayResultUpload',
    createProxyMiddleware({
      target: 'https://cmrms-full.onrender.com/', // Adjust the target as needed
      changeOrigin: true,
      secure: false,
    })
  ) 

};