import app from "./app";
import config from "./config/config";   


    
// Root route for Render health checks
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Airfilms API - Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        apiBase: `${req.protocol}://${req.get('host')}${config.apiPrefix}`,
        version: config.apiVersion || 'v1'
    });
});

// Start the server
app.listen(config.port, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${config.port}`);
    console.log(`📱 API disponible en: http://localhost:${config.port}`);
    console.log(`🌍 Entorno: ${config.nodeEnv}`);
    console.log(`📚 API Base: http://localhost:${config.port}${config.apiPrefix}`);
    console.log(`🔧 API_PREFIX configurado como: "${config.apiPrefix}"`);
    console.log(`🔧 NODE_ENV: ${config.nodeEnv}`);
    console.log(`🔧 API_VERSION: ${config.apiVersion}`);
});