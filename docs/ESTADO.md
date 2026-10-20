> Este archivo lo lee Emily (asistente por voz). Actualízalo al cerrar cada avance.
# Estado — Würfel landing web

**Fecha de actualización:** 2026-10-20

## Resumen
Landing de Würfel, la marca personal de Alex (no es empresa, no usar "SpA") para ofrecer automatización de procesos con IA. HTML/CSS/JS estático, sin build.

## Qué funciona
- Rediseño completo de la landing (commit 6eb10dc), aprobado por el usuario.
- Formulario de contacto con FormSubmit hacia el correo de la marca.
- Casos anonimizados por rubro, sin nombres ni logos de clientes.
- Auto-deploy en Vercel al hacer push a `main`.
- Workflow Emily para cambios de código por voz.

## Pendientes / próximos pasos
- Opción futura: migrar el formulario a un webhook de n8n.
- Por confirmar: la activación del correo de FormSubmit en la primera vez.

## Problemas conocidos
- El conector Vercel MCP da 403 en ese equipo: usar `npx vercel@latest api ...`.
- Mantener el tema oscuro bronce/cian y el anonimato de clientes al iterar.
- Renombrar un proyecto de Vercel no crea el dominio `*.vercel.app`: hay que agregarlo por API.

## Dónde está (URL de producción, repo, dependencias)
- Repo: github.com/WurfelSPA/wurfel-web (público).
- Producción: https://wurfel.vercel.app (proyecto Vercel `wurfel`, equipo wurfel-projects).
- Depende de: Vercel, FormSubmit.
