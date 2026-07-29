# Arquitectura Ryuka 2.0

Esta carpeta contiene la nueva arquitectura, agregada sin romper las pantallas actuales.

- `core`: reglas puras y cálculos, sin React ni Supabase.
- `domain`: entidades y contratos de repositorios.
- `application`: casos de uso que coordinan reglas y datos.
- `infrastructure`: implementaciones concretas de Supabase/local cache.
- `presentation`: hooks y adaptadores para React.
- `events`: eventos internos desacoplados.
- `config`: reglas configurables del negocio.

La migración se hace módulo por módulo. Mientras tanto, la aplicación existente sigue funcionando tal como estaba.
