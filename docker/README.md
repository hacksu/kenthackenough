Docker is used to create development and production environments for this program.

Docker is able to create a redis cache, mongodb database, and nginx router to allow
this program to be tested as if it was in its production environment on a server.

```bash
# Development Environment
# Does not start this program itself; only its dependencies
npm run docker:up # Start Docker
npm run docker:down # Stop Docker
```

```bash
# Production Environment
# Builds this program as a container
npm run production:up # Start Docker
npm run production:down # Stop Docker
```

NGINX is used to handle routing for all these containers/programs.
It can be configured in the `nginx` directory and `nginx/templates`.

The frontend should run on port 3000, with the backend (this program) on port 3080.
These ports can be changed within the nginx config files.