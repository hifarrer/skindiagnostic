# Railway deployment (web app)

## Custom domain: "Application failed to respond"

If the app works at `https://your-app.up.railway.app` but fails when using your custom domain (e.g. `https://skindiagnostics.ai`):

1. **Do not set a custom port (e.g. 8080) for the domain.**  
   The app listens on the **`PORT`** environment variable Railway provides. In the Railway dashboard, when adding or editing the custom domain, leave the port setting as default (or remove any override like 8080).

2. **Ensure the service uses Railway’s `PORT`.**  
   The container uses `PORT` in the nginx config. Do not set a fixed port (e.g. 8080) in the service “Variables” unless you want the app to listen on that port; if you do, the custom domain target port must match.

3. **Summary:** Same service and same port for both the `*.railway.app` URL and the custom domain. No separate port for the custom domain.

## Build and run

- Build: Dockerfile (Expo web export + nginx).
- The app listens on `0.0.0.0:${PORT}` (via nginx template). Railway sets `PORT` automatically.
